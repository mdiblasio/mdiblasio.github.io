importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

workbox.skipWaiting();
workbox.clientsClaim();

workbox.setConfig({ debug: true });

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.precaching.precacheAndRoute([
  'assets/offline.html',
  'assets/1.js',
  'assets/2.js',
  'assets/3.js',
  'assets/4.js',
  'assets/5.js',
  'assets/1.css',
  'assets/2.css',
  'assets/3.css',
  'assets/4.css',
  'assets/5.css',
]);

workbox.routing.registerRoute(
  /dummy/,
  workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
  /runtime\d?\/networkFirst/,
  workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
  /runtime\d?\/cacheFirst/,
  workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
  /runtime\d?\/networkOnly/,
  workbox.strategies.networkOnly()
);

workbox.routing.registerRoute(
  /runtime\d?\/cacheOnly/,
  workbox.strategies.cacheOnly()
);

workbox.routing.registerRoute(
  /runtime\d?\/staleWhileRevalidate/,
  workbox.strategies.staleWhileRevalidate()
);