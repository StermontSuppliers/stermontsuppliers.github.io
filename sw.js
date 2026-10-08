/* Stermont Arcade service worker: network-first so shoppers always get fresh stock/prices; falls back to cache offline */
var C = 'stermont-v1', SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(C).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(C).then(function (c) { c.put(r, cp); }); return res; })
    .catch(function () { return caches.match(r).then(function (m) { return m || caches.match('/index.html'); }); }));
});
