/**
 * Service Worker for Forward Horizon
 * Provides offline functionality and caching for better performance
 */

const CACHE_NAME = 'forward-horizon-v1.2.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Open+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com',
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS.map(url => 
          new Request(url, { mode: 'cors', credentials: 'omit' })
        ));
      })
      .catch(error => console.log('Service Worker: Cache failed', error))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses for short time
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME + '-api').then(cache => {
              cache.put(request, responseClone);
              // Expire API cache after 5 minutes
              setTimeout(() => {
                cache.delete(request);
              }, 5 * 60 * 1000);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static resources with cache-first strategy
  if (STATIC_CACHE_URLS.some(url => request.url.includes(url.replace(/^https?:\/\/[^\/]+/, '')))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(fetchResponse => {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
              return fetchResponse;
            });
        })
        .catch(() => {
          // Fallback for offline
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME + '-runtime').then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'form-submission') {
    console.log('Service Worker: Background sync - form submission');
    event.waitUntil(processOfflineSubmissions());
  }
});

// Process offline form submissions when back online
async function processOfflineSubmissions() {
  const db = await openDB();
  const submissions = await getOfflineSubmissions(db);
  
  for (const submission of submissions) {
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission.data)
      });
      
      if (response.ok) {
        await removeOfflineSubmission(db, submission.id);
        console.log('Service Worker: Offline submission processed successfully');
      }
    } catch (error) {
      console.log('Service Worker: Failed to process offline submission', error);
    }
  }
}

// Simple IndexedDB helpers (would be more robust in production)
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ForwardHorizonDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getOfflineSubmissions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['submissions'], 'readonly');
    const store = transaction.objectStore('submissions');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineSubmission(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['submissions'], 'readwrite');
    const store = transaction.objectStore('submissions');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handling (for future use)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Open Forward Horizon',
          icon: '/icon-open.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-close.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});