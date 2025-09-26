// Service Worker for PWA support
const CACHE_NAME = 'reality-game-v1.1.0';
const urlsToCache = [
  './',
  './index.html',
  './menu.html',
  './character-creation.html',
  './game-main.html',
  './css/app.css',
  './css/menu.css',
  './css/character-creation.css',
  './css/game-main.css',
  './js/pages/menu.js',
  './js/pages/character-creation.js',
  './js/pages/game-main.js',
  './js/core/scene-manager.js',
  './js/core/f2-manager.js',
  './js/core/illustration-manager.js',
  './js/core/save-system.js',
  './js/core/world-state.js',
  './js/core/game-bootstrap.js',
  './js/core/database.js',
  './js/core/reactive-system.js',
  './manifest.json'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  // 忽略非GET请求和数据URL
  if (event.request.method !== 'GET' || event.request.url.startsWith('data:')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中 - 返回缓存版本
        if (response) {
          return response;
        }

        // 克隆请求
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 不缓存API请求和存档数据
          if (event.request.url.includes('/api/') ||
              event.request.url.includes('indexeddb')) {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// 推送通知支持（可选）
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '游戏有新内容！',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '立即查看',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '稍后再说',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('我的互动小说游戏', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
