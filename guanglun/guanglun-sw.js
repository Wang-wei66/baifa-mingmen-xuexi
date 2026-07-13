// 本 SW 由 /guanglun/guanglun-sw.js 注册，默认作用域 = /guanglun/
// 因此天然与根目录其他 App 隔离，互不干扰
const CACHE = 'guanglun-pwa-v1';
const ASSETS = [
  './guanglun-learning.html',
  './guanglun-manifest.json',
  './guanglun-icon-192.png',
  './guanglun-icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
function isOwn(url){
  const p = url.pathname;
  return p.endsWith('/guanglun-learning.html')
      || p.endsWith('guanglun-manifest.json')
      || p.includes('guanglun-icon');
}
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!isOwn(url)) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const cp = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return res;
    }).catch(() => caches.match(e.request)))
  );
});
