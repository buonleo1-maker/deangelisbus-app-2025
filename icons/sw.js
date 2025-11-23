// ============================================
// SERVICE WORKER DEANGELISBUS – PWA 2025
// Gestisce cache base e installazione app
// ============================================

const CACHE_NAME = "deangelisbus-cache-v1";

// File minimi da mettere in cache
const FILES_TO_CACHE = [
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icons/deangelisbus_icon.png"
];

// Installazione service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Intercetta richieste per funzionamento offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return (
        resp ||
        fetch(event.request).catch(() => caches.match("index.html"))
      );
    })
  );
});
