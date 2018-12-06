importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');


workbox.skipWaiting();
workbox.clientsClaim();

workbox.setConfig({ debug: true });

// Enable navigation preload.
workbox.navigationPreload.enable();

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

importScripts('prod.js');

// workbox.precaching.precacheAndRoute([
//   // {
//   //   url: 'index.html',
//   //   revision: '3'
//   // },
//   'assets/offline.html',
//   'assets/1.js',
//   'assets/2.js',
//   'assets/3.js',
//   'assets/4.js',
//   'assets/5.js',
//   'assets/1.css',
//   'assets/2.css',
//   'assets/3.css',
//   'assets/4.css',
//   'assets/5.css',
// ]);

const htmlHandler = workbox.strategies.networkOnly();
// A NavigationRoute matches navigation requests in the browser, i.e. requests for HTML.
const navigationRoute = new workbox.routing.NavigationRoute(({ event }) => {
  return htmlHandler.handle({ event }).catch(() => caches.match('assets/offline.html'));
});
workbox.routing.registerRoute(navigationRoute);

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