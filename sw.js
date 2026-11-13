
// Service worker do Simulador de Pedidos. Versao: 07_2026.11-655ce8aa
// Guarda o app no aparelho (funciona offline) e troca pela versao nova assim que ela e publicada.
var CACHE = "simulador-07_2026.11-655ce8aa";
var ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function(e){
  // cache:"reload" ignora o cache HTTP do navegador/GitHub Pages: garante que a versao nova entre de verdade
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ARQUIVOS.map(function(u){ return fetch(u, {cache:"reload"}).then(function(r){ if(!r.ok) throw new Error(u); return c.put(u, r); }); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k.indexOf("simulador-")===0 && k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET") return;
  var url = new URL(e.request.url);
  if(url.origin!==location.origin) return;            // wa.me e outros sites: deixa passar
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(function(r){
      if(r) return r;                                   // offline: serve do cache
      return fetch(e.request).then(function(resp){
        if(resp && resp.ok){ var cp = resp.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); }
        return resp;
      });
    }).catch(function(){ return caches.match("./index.html"); })
  );
});
