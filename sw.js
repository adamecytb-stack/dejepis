/* Offline rezim: najprv siet (vzdy cerstva verzia), pri vypadku siete ulozena kopia. */
var CACHE = "dejepis-v2";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png",
  "csr/", "csr/index.html", "csr/manifest.webmanifest", "csr/icon-180.png", "csr/icon-192.png", "csr/icon-512.png"];

self.addEventListener("install", function(ev){
  ev.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
  self.skipWaiting();
});

/* stara cache tejto appky; ine appky na adamecytb-stack.github.io maju vlastne cache, tie sa nemazu */
self.addEventListener("activate", function(ev){
  ev.waitUntil(caches.delete("sv1-v1").then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(ev){
  var req = ev.request;
  if(req.method !== "GET" || req.url.indexOf(self.location.origin) !== 0){ return; }
  ev.respondWith(
    fetch(req).then(function(res){
      if(res && res.ok){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req, {ignoreSearch:true}).then(function(hit){
        return hit || caches.match(req.url.indexOf("/csr/") >= 0 ? "csr/index.html" : "index.html");
      });
    })
  );
});
