importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

// Force development builds
workbox.setConfig({ debug: true });

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.precacheAndRoute([
  { url: '/multipwa/offline.html', revision: '1' },
  { url: '/multipwa/main.css', revision: '5' },
]);

const htmlHandler = workbox.strategies.staleWhileRevalidate({
  cacheName: 'html',
});
// A NavigationRoute matches navigation requests in the browser, i.e. requests for HTML.
const navigationRoute = new workbox.routing.NavigationRoute(({ event }) => {
  return htmlHandler.handle({ event }).catch(() => caches.match('/multipwa/offline.html'));
});
workbox.routing.registerRoute(navigationRoute);

workbox.routing.registerRoute(
  /.*\.js$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'js',
  })
);