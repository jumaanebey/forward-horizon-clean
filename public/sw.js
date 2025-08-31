/**
 * Service Worker for Forward Horizon PWA
 * Crisis-focused offline functionality for housing emergencies
 */

const CACHE_NAME = 'forward-horizon-pwa-v2.0.0';
const CRITICAL_CACHE = 'forward-horizon-critical-v2.0.0';

// Critical resources for offline crisis support
const CRITICAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/application.html',
  '/application-success.html',
  '/programs.html',
  '/faq.html',
  '/stories.html',
  '/get-involved.html',
  '/js/pwa-install.js',
  '/js/offline-support.js',
  '/manifest.json'
];

// Static resources for performance
const STATIC_CACHE_URLS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com'
];

// Install event - cache critical and static resources
self.addEventListener('install', event => {
  console.log('Forward Horizon PWA: Installing Service Worker...');
  event.waitUntil(
    Promise.all([
      // Cache critical pages for offline crisis support
      caches.open(CRITICAL_CACHE)
        .then(cache => {
          console.log('Service Worker: Caching critical pages');
          return cache.addAll(CRITICAL_CACHE_URLS);
        }),
      // Cache static resources
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Caching static resources');
          return cache.addAll(STATIC_CACHE_URLS.map(url => 
            new Request(url, { mode: 'cors', credentials: 'omit' })
          ));
        })
    ]).catch(error => {
      console.log('Service Worker: Cache installation failed', error);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Forward Horizon PWA: Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== CRITICAL_CACHE) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - crisis-focused offline strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME + '-api').then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response or offline message
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline API response
            return new Response(JSON.stringify({
              error: 'offline',
              message: 'This request failed because you are offline. Your form data has been saved and will be submitted when you reconnect.',
              crisisNumbers: {
                emergency: '911',
                forwardHorizon: '(310) 488-5280',
                nationalSuicide: '988'
              }
            }), {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Critical pages get cache-first strategy (always available offline)
  if (CRITICAL_CACHE_URLS.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(
      caches.open(CRITICAL_CACHE).then(cache => {
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            // Update cache in background if online
            fetch(request).then(networkResponse => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            }).catch(() => {
              // Network failed, but we have cached version
              console.log('Network failed, serving from cache:', request.url);
            });
            return cachedResponse;
          }
          
          // Not in cache, try network
          return fetch(request).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Both cache and network failed, return offline page
            if (request.destination === 'document') {
              return cache.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Static resources with cache-first strategy
  if (STATIC_CACHE_URLS.some(staticUrl => request.url.includes(staticUrl.replace(/^https?:\/\/[^\/]+/, '')))) {
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
          // Static resource failed to load
          console.log('Static resource failed to load:', request.url);
          return new Response('Resource unavailable offline', { status: 503 });
        })
    );
    return;
  }

  // Other requests - network first with runtime caching
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME + '-runtime').then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cachedResponse => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
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