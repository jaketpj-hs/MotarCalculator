const CACHE_NAME = "distance-xy-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
    "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );
      }),

      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", event => {

  // Pour les pages HTML :
  // on cherche d'abord la dernière version sur Internet.
  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });

          return response;

        })
        .catch(() => {
          return caches.match(event.request);
        })
    );

    return;
  }

  // Pour le reste : cache d'abord
  event.respondWith(
    caches.match(event.request).then(cached => {

      return cached || fetch(event.request);

    })
  );

});
