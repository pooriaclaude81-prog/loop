/* Offline cache shared by the chooser, the legacy site and the Tintinalli-based site.
   Network first, fall back to the cached copy. The Tintinalli files are pre-cached from dist/files.json. */
var CACHE = 'orders-v2';
var CORE = ['./', 'index.html', 'legacy.html', 'admin.html', 'config.js', 'css/style.css', 'js/parser.js', 'js/render.js', 'js/app.js', 'js/admin.js', 'content/bundle.js', 'tintinalli/'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    var core = Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
    var tn = fetch('tintinalli/dist/files.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) {
      return Promise.all(j.files.map(function (f) { return c.add('tintinalli/' + f).catch(function () {}); }).concat(c.add('tintinalli/dist/files.json').catch(function () {})));
    }).catch(function () {});
    return Promise.all([core, tn]);
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, copy); }); }
    return res;
  }).catch(function () { return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html'); }); }));
});
