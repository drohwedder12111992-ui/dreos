/* DREOS Office – Service Worker (Offline-Shell) */
const CACHE = "dreos-v3";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/eos-logo.svg", "./icons/eos-logo-white.svg",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png",
  "./Avatare/sophie.jpg", "./Avatare/vera.jpg", "./Avatare/henrik.jpg",
  "./Avatare/ingrid.jpg", "./Avatare/samuel.jpg", "./Avatare/carla.jpg",
  "./Avatare/adrian.jpg", "./Avatare/konstantin.jpg", "./Avatare/mara.jpg"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = e.request.url;
  // API + Sync immer live
  if (u.includes("api.anthropic.com") || u.includes("supabase.co")) return;
  if (e.request.mode === "navigate" || u.endsWith("/index.html")) {
    // App-Shell: network first (Updates), Cache als Fallback
    e.respondWith(fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
    return;
  }
  // Rest: cache first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(rr => {
    if (rr.ok && u.startsWith(self.location.origin)) { const cp = rr.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return rr;
  })));
});
