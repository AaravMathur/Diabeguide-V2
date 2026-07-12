// DiabeGuide PWA Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler (required for PWA installability)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
