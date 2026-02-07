const CACHE_NAME = 'task-manager-v1';
const urlsToCache = [
  '/index.html',
  '/manifest.json'
];

// התקנת Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache נפתח');
        return cache.addAll(urlsToCache);
      })
  );
});

// הפעלת Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('מוחק cache ישן:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// טיפול בבקשות - אסטרטגיית Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // אם נמצא ב-cache, החזר אותו
        if (response) {
          return response;
        }

        // אחרת, נסה להביא מהרשת
        return fetch(event.request).then(
          response => {
            // בדוק שהתשובה תקינה
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // שכפל את התשובה
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // אם אין רשת, החזר דף ברירת מחדל
          return caches.match('/index.html');
        });
      })
  );
});
