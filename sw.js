// Service Worker for SteamTrack
const CACHE_NAME = 'steamtrack-cache-v1';
const DYNAMIC_CACHE = 'steamtrack-dynamic-v1';

// Resources to cache immediately on install
const STATIC_ASSETS = [
    '/SAE/',
    '/SAE/index.html',
    '/SAE/roleta.html',
    '/SAE/hall.html',
    '/SAE/precos.html',
    '/SAE/xp.html',
    '/SAE/languages.js',
    '/SAE/database.js',
    '/SAE/manifest.json',
    // External CDN resources
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('[SW] Cache install failed:', err))
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API requests - always fetch fresh
    if (url.pathname.includes('/api/') || url.pathname.includes('api.php')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Steam CDN images - cache first with network fallback
    if (url.hostname.includes('steamcdn') || 
        url.hostname.includes('steamstatic') ||
        url.hostname.includes('akamaihd.net')) {
        event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Static assets - stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
});

// Cache First strategy - good for immutable assets
async function cacheFirst(request, cacheName = CACHE_NAME) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache first fetch failed:', error);
        return new Response('Offline - Resource not cached', { status: 503 });
    }
}

// Network First strategy - good for API calls
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Stale While Revalidate - good for pages
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, networkResponse.clone());
                });
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-achievements') {
        event.waitUntil(syncAchievements());
    }
});

async function syncAchievements() {
    // Placeholder for syncing cached achievements when back online
    console.log('[SW] Syncing achievements...');
}

// Push notifications
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Nova conquista desbloqueada!',
        icon: '/SAE/icons/icon-192x192.png',
        badge: '/SAE/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/SAE/index.html'
        },
        actions: [
            { action: 'view', title: 'Ver' },
            { action: 'close', title: 'Fechar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'SteamTrack', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Focus existing window if open
            for (const client of clientList) {
                if (client.url.includes('/SAE/') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});

// Message handler for cache control
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data === 'clearCache') {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    if (event.data.type === 'CACHE_URLS') {
        caches.open(DYNAMIC_CACHE).then(cache => {
            cache.addAll(event.data.urls);
        });
    }
});

console.log('[SW] Service Worker loaded');
