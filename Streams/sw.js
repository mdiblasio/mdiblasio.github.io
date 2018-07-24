/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js");

workbox.setConfig({
  debug: true
});


// workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

// workbox.routing.registerRoute(/api\/catalog\/category/, workbox.strategies.staleWhileRevalidate({ cacheName: "api-catalog", plugins: [new workbox.expiration.Plugin({"maxEntries":100,"maxAgeSeconds":600,"purgeOnQuotaError":false}), new workbox.cacheableResponse.Plugin({"statuses":[0,200]})] }), 'GET');
// workbox.routing.registerRoute(/data\/images/, workbox.strategies.cacheFirst({ cacheName: "images", plugins: [new workbox.expiration.Plugin({"maxEntries":100,"maxAgeSeconds":604800,"purgeOnQuotaError":false})] }), 'GET');


// self.addEventListener('fetch', (event) => {
//     if (event.request.url.match("stream")) {
//         const { done, stream } = workbox.streams.concatenate([
//             fetch("part1"),
//             fetch("part2"),
//             fetch("part3"),
//         ]);
//         const response = new Response(stream, {
//             headers: {
//                 'content-type': 'text/html',
//             },
//         });
//         event.respondWith(response);
//         event.waitUntil(done);
//     }
// });

/* CONFIGURATION VARIABLES */

const VERSION = 4;

const PARTIALS_CACHE_EXPIRATION = 3 * 24 * 60 * 60;
const USER_NAME = "Roy Daiany";

const PRECACHE_LIST = [
  // '/data/guide.txt',
  // '/videos/myvideo.mp4'
];

workbox.precaching.precacheAndRoute(PRECACHE_LIST);

importScripts("/Streams/utils/idb.js");

const dbPromise = idb.open('streams-demo', 2, upgradeDB => {
  if (!upgradeDB.objectStoreNames.contains('usersettings')) {
    upgradeDB.createObjectStore('usersettings', { keyPath: 'setting' });
  }
});



function logger(_source, _msg) {
  console.log(`${_source}:\t${_msg}`);
}

function log(_msg) {
  logger("dbUtils.js", _msg);
}

function updateUsername(_username) {
  log(`updateUsername(${_username})`);
  dbPromise.then(db => {
    const tx = db.transaction('usersettings', 'readwrite');
    tx.objectStore('usersettings')
      .put({
        setting: "username",
        data: _username
      });
    return tx.complete;
  });
}

function getSetting(_setting) {
  log(`getSetting(${_setting})`);
  return dbPromise.then(db => {
      return db.transaction('usersettings')
        .objectStore('usersettings').get(_setting);
    })
    .then(obj => {
      log(`getSetting(${_setting}) = ${obj.data}`);
      return obj.data;
    })
    .catch((e) => null);

}

function deleteSetting(_setting) {
  return dbPromise.then(function(db) {
    var tx = db.transaction('usersettings', 'readwrite');
    var store = tx.objectStore('usersettings');
    store.delete(_setting);
    return tx.complete;
  });
}

// export function updateHeader() {
//   getSetting("username")
//     .then(username => {
//       if (username) {
//         document.getElementById("userName").innerHTML = `Welcome back, <u>${username}</u>!`;
//         document.getElementById("loginModule").style.setProperty("display", "none");
//         document.getElementById("logoutModule").style.removeProperty("display");
//       } else {
//         document.getElementById("userName").innerHTML = ``;
//         document.getElementById("logoutModule").style.setProperty("display", "none");
//         document.getElementById("loginModule").style.removeProperty("display");
//       }
//     });
// }

function logout() {
  log("logout()");
  deleteSetting("username")
    .then(() => updateHeader());


}

/* HANDLERS */

const headerPlugin = {
  cacheWillUpdate: async({ request, response }) => {
    var clonedResponse = response.clone();
    return getSetting("username")
      .then(username => {
        if (username) {
          return clonedResponse.text()
            .then(text => {
              let body = text.replace(
                "<span id=\"userName\"></span>",
                `<span id="userName">Welcome back, <u>${username}</u>!</span>`
              );
              return new Response(body);
            });
        } else {
          return response;
        }
      })
  },
  cachedResponseWillBeUsed: async({ cacheName, request, matchOptions, cachedResponse }) => {
    // Return `cachedResponse`, a different Response object or null
    // return cachedResponse;
    console.log("cachedResponseWillBeUsed");
    var clonedResponse = cachedResponse.clone();
    return getSetting("username")
      .then(username => {
        if (username) {
          return clonedResponse.text()
            .then(text => {
              let body = text.replace(
                "<span id=\"userName\"></span>",
                `<span id="userName">Welcome back, <u>${username}</u>!</span>`
              );
              return new Response(body);
            });
        } else {
          return clonedResponse.text()
            .then(text => {
              let body = text.replace(
                /<span id=\"userName\">.*<\/span>/,
                `<span id="userName"></span>`
              );
              return new Response(body);
            });
          // return cachedResponse;
        }
      })
  },
};

const partialsStrategy = workbox.strategies.cacheFirst({
  cacheName: "partials",
  plugins: [
    new workbox.expiration.Plugin({
      maxEntries: 60,
      maxAgeSeconds: PARTIALS_CACHE_EXPIRATION
    }),
  ],
});

const utilsStrategy = workbox.strategies.cacheFirst({
  cacheName: "utils",
  plugins: [
    new workbox.expiration.Plugin({
      maxAgeSeconds: PARTIALS_CACHE_EXPIRATION
    }),
  ],
});

// staleWhileRevalidate

const headerStrategy = workbox.strategies.staleWhileRevalidate({
  cacheName: "partials",
  plugins: [
    headerPlugin
  ]
});

const streamsStrategy = workbox.streams.strategy([
  // () => fetch("header.partial.html"),
  ({ event }) => headerStrategy.makeRequest({ event, request: "partials/header.partial.html" }),
  ({ event }) => partialsStrategy.makeRequest({ event, request: "partials/body.partial.0.html" }),
  ({ event }) => partialsStrategy.makeRequest({ event, request: "partials/body.partial.1.html" }),
  ({ event }) => partialsStrategy.makeRequest({ event, request: "partials/body.partial.2.html" }),
  ({ event }) => partialsStrategy.makeRequest({ event, request: "partials/body.partial.3.html" }),
  ({ event }) => partialsStrategy.makeRequest({ event, request: "partials/footer.partial.html" }),
  // () => fetch("body.partial.html"),
  // () => fetch("footer.partial.html"),
], { 'content-type': 'text/html' });

/* ROUTES */

// header partial
workbox.routing.registerRoute(
  /header\.partial/,
  headerStrategy
);

// all other partials
workbox.routing.registerRoute(
  /partial/,
  partialsStrategy
);

// utils
workbox.routing.registerRoute(
  /utils/,
  utilsStrategy
);


// videos (range requests)
workbox.routing.registerRoute(
  /videos/,
  workbox.strategies.cacheFirst({
    cacheName: "videos",
    plugins: [
      new workbox.rangeRequests.Plugin(),
    ],
  })
);

// text
workbox.routing.registerRoute(
  /data\/.*\.txt/,
  workbox.strategies.cacheFirst({
    cacheName: "text",
    plugins: [
      new workbox.rangeRequests.Plugin(),
    ],
  })
);

// index
workbox.routing.registerRoute(
  /index/,
  streamsStrategy
);

// workbox.routing.registerNavigationRoute( //"/index.html");
//   ({ event }) => streamsStrategy.makeRequest({ event, request: "index.html" }),
// );

workbox.skipWaiting();
workbox.clientsClaim();

// self.addEventListener('message', (event) => {
//  console.log(`SW received message: ${event.data}`);
//   if (!event.data){
//     return;
//   }

//   switch (event.data) {
//     case 'skipWaiting':
//       self.skipWaiting();
//       break;
//     default:
//       // NOOP
//       break;
//   }
// });


/*

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js');

const CACHE_NAME = 'my-cache';
const START_CACHE_KEY = 'start';
const END_CACHE_KEY = 'end';

self.addEventListener('install', (event) => {
    event.waitUntil((async() => {
        const cache = await caches.open(CACHE_NAME);
        await Promise.all([
            cache.put(START_CACHE_KEY,
                new Response('<html><head></head><body>')),
            cache.put(END_CACHE_KEY,
                new Response('</body></html>')),
        ]);
    })());
});

// Use a stale-while-revalidate strategy as a source for part of the response.
const apiStrategy = workbox.strategies.staleWhileRevalidate({
    cacheName: 'apiStrategy',
});

// String together an artificially complex series of stream sources.
const streamsStrategy = workbox.streams.strategy([
  () => caches.match(START_CACHE_KEY, { cacheName: CACHE_NAME }), 
  () => `<p>🎉 This <code>iframe</code> is composed of multiple streams.</p>`, 
  () => `<p>Here's an API call, using a stale-while-revalidate strategy:</p>`, 
  ({event}) => apiStrategy.makeRequest({event, request: '/api/date',}),
  () => caches.match(END_CACHE_KEY, { cacheName: CACHE_NAME}), 
]);

// Once the strategy is configured, the actual routing looks clean.
workbox.routing.registerRoute(new RegExp('iframe$'), streamsStrategy);

workbox.skipWaiting();
workbox.clientsClaim();


*/

// self.addEventListener('fetch', (event) => {
//     if (event.request.url.match("stream")) {
//         const { done, response } = workbox.streams.concatenateToResponse([
//             fetch("header"),
//             fetch("body"),
//             fetch("footer"),
//         ], { 'content-type': 'text/html' });
//         event.respondWith(response);
//         event.waitUntil(done);
//     }
// });


// // In the service worker:
// self.addEventListener('fetch', event => {
//     console.log(event.request);
//     // if (event.request.mode !== 'navigate') {
//     if (event.request.url.match("stream")) {

//         var decoder = new TextDecoder();
//         var stream = new ReadableStream({
//             start(controller) {
//                 var fetch1 = fetch("file1.txt");
//                 var fetch2 = fetch("file2.txt");
//                 var fetch3 = fetch("file3.txt");

//                 function pushStream(_stream) {
//                     // Get a lock on the stream
//                     var reader = _stream.getReader();

//                     return reader.read().then(function process(result) {
//                         if (result.done) return;
//                         // Push the value to the combined stream
//                         // controller.enqueue(decoder.decode(result.value, { stream: true }));
//                         controller.enqueue(result.value);
//                         // Read more & process
//                         return reader.read().then(process);
//                     });
//                 }

//                 // fetch("file1.txt")
//                 //     .then(res => pushStream(res.body))
//                 //     .then(() => fetch("file2.txt"))
//                 //     .then(res => pushStream(res.body))
//                 //     .then(() => fetch("file3.txt"))
//                 //     .then(res => pushStream(res.body))
//                 //     .then(() => controller.close());

//                 fetch1
//                     .then(res => pushStream(res.body))
//                     .then(() => fetch2)
//                     .then(res => pushStream(res.body))
//                     .then(() => fetch3)
//                     .then(res => pushStream(res.body))
//                     .then(() => controller.close());
//             }
//         });


//         event.respondWith(new Response(stream, {
//             headers: { 'Content-Type': 'text/html' }
//         }));

//     } else {
//         return fetch(event.request);
//     }


// });