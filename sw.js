// AURA Service Worker — Offline Mode
const CACHE_NAME = 'aura-v11';
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // If some CDN assets fail, cache what we can
        return Promise.allSettled(
          STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Push — show notification from server or scheduled
self.addEventListener('push', event => {
  var data = { title: '💪 AURA Fitness', body: 'Hai un allenamento in programma!' };
  if (event.data) {
    try { data = event.data.json(); } catch(e) {
      data.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏋️</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💪</text></svg>',
      tag: data.tag || 'aura-push',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

// Notification click — open app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  var tab = (event.notification.data && event.notification.data.tab) || 'workout';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        if (windowClients[i].url.includes('AURAMOBILE') && 'focus' in windowClients[i]) {
          windowClients[i].postMessage({ type: 'navigate-tab', tab: tab });
          return windowClients[i].focus();
        }
      }
      return clients.openWindow('/?tab=' + tab);
    })
  );
});

// Fetch — cache-first for static, network-first for API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-first for Open Food Facts API
  if (url.hostname.includes('openfoodfacts.org')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for Firebase
  if (url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for navigation (always get latest HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for everything else (static assets, CDN libs)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => new Response('Offline', { status: 503 }))
  );
});
