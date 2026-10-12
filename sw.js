/* Offline rezim: najprv siet (vzdy cerstva verzia), pri vypadku siete ulozena kopia. */
var CACHE = "sv1-v1";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function(ev){
  ev.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(self.clients.claim());
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
        return hit || caches.match("index.html");
      });
    })
  );
});
