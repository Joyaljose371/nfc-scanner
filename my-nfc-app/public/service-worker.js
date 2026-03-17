// service-worker.js
const CACHE_NAME = 'nfc-app-v2';

// Keep this list very small for now to ensure it finishes quickly
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Use skipWaiting to force the new service worker to take over immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
// public/service-worker.js

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_REMINDER') {
    const { title, body, delay } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: '/logo192.png',
        vibrate: [200, 100, 200],
        badge: '/logo192.png',
        tag: 'goal-alert' 
      });
    }, delay);
  }
});