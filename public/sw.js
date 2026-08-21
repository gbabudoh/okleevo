// Minimal service worker: exists to satisfy PWA installability
// (Chrome/Android require a registered SW with a fetch handler).
// No offline caching — every request just passes straight through to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Network offline", { status: 503, statusText: "Service Unavailable" });
    })
  );
});
