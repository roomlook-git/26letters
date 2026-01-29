const CACHE_NAME = "letters-audio-v1";

const AUDIO_FILES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => `./audio/${c}.mp3`);

const PRECACHE_URLS = ["./", "./index.html", "./styles.css", "./app.js", ...AUDIO_FILES];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (!response || response.status !== 200) return response;

      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    })(),
  );
});
