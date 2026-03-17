// service-worker.js

const CACHE_NAME = 'nfc-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add other assets like CSS or icons here if they have specific names
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Listen for notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Opens the app when the notification is clicked
  );
});

// Necessary to intercept requests for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});