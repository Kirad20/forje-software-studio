const CACHE = "forja-studio-__VERSION__";
const ASSETS = __PRECACHE__;
const studioPage = (path) => path === "/" || /^\/(admin|account|plan|integrations|evals)(\/|$)/.test(path) || /^\/p\/[^/]+\/?$/.test(path);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Retain one previous build for open tabs, without accumulating caches on every deployment.
    const keys = (await caches.keys()).filter((key) => key.startsWith("forja-studio-"));
    const previous = keys.filter((key) => key !== CACHE).at(-1);
    await Promise.all(keys.filter((key) => key !== CACHE && key !== previous).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate" && studioPage(url.pathname)) {
    event.respondWith((async () => {
      try {
        return await fetch(event.request);
      } catch {
        const offline = await (await caches.open(CACHE)).match("/offline.html");
        if (!offline) throw new Error("La pantalla offline de Forja no está disponible.");
        return offline;
      }
    })());
    return;
  }
  if (url.search || (!ASSETS.includes(url.pathname) && !url.pathname.startsWith("/assets/"))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const current = await cache.match(url.pathname);
    if (current) return current;
    for (const key of await caches.keys()) {
      if (key.startsWith("forja-studio-") && key !== CACHE) {
        const previous = await (await caches.open(key)).match(url.pathname);
        if (previous) return previous;
      }
    }
    return fetch(event.request);
  })());
});
