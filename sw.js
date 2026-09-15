/* MonsterGoldX — service worker: เปิดใช้งานออฟไลน์ได้ */
const CACHE = "mgx-v1";
const FILES = ["./","./index.html","./manifest.webmanifest",
  "./icon-180.png","./icon-192.png","./icon-512.png","./icon-512-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* network-first สำหรับหน้าเว็บ เพื่อให้ได้เวอร์ชันใหม่เมื่อมีเน็ต
   cache-first สำหรับไฟล์อื่น เพื่อให้เปิดเร็วและใช้ออฟไลน์ได้ */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
