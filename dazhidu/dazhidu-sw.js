// 本 SW 由 /dazhidu/dazhidu-sw.js 注册，默认作用域 = /dazhidu/
// 因此天然与根目录的百法 App 隔离，二者永不通话
const CACHE = 'dazhidu-pwa-v3';
// 只缓存大智度论自身资源（均为 /dazhidu/ 下的相对路径），绝不碰根目录的百法
const ASSETS = [
  './dazhidu-learning.html',
  './dazhidu-manifest.json',
  './dazhidu-icon-192.png',
  './dazhidu-icon-512.png'
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

// 仅拦截大智度论专属资源；其余请求（含百法 index.html）直接放行，互不干扰
function isOwn(url){
  const p = url.pathname;
  return p.endsWith('/dazhidu-learning.html')
      || p.endsWith('dazhidu-manifest.json')
      || p.includes('dazhidu-icon');
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!isOwn(url)) return; // 交给浏览器默认处理（网络/百法自身缓存）
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const cp = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return res;
    }).catch(() => caches.match(e.request)))
  );
});
