const CACHE = "shehaby-shooting-pro-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./lang.json"
      ])
    )
  );
});
