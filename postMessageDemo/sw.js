importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');
importScripts('idb.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

// Force development builds
workbox.setConfig({ debug: true });

workbox.skipWaiting();
workbox.clientsClaim();

var dbPromise = idb.open('sportsDemoPWA', 1, function(upgradeDb) {
  console.log(`Creating object store 'userPreferences'`);
  if (!upgradeDb.objectStoreNames.contains('userPreferences')) {
    upgradeDb.createObjectStore('userPreferences', { keyPath: 'preference' });
  }
});

async function getCountryPreference() {
  return dbPromise.then(db => {
    return db.transaction('userPreferences', 'readwrite')
      .objectStore('userPreferences')
      .get('country');
  });
}

const postMessagePlugin = {
  cacheDidUpdate: async({ cacheName, url, oldResponse, newResponse }) => {
    // Use whatever logic you want to determine whether the responses differ.
    // if (oldResponse && (oldResponse.headers.get('etag') !== newResponse.headers.get('etag'))) {
    const clients = await self.clients.matchAll();
    const now = new Date();
    const hour = now.getHours() % 12;
    const minute = now.getMinutes() < 10 ? now.getMinutes() * 10 : now.getMinutes();
    const second = now.getSeconds() < 10 ? now.getSeconds() * 10 : now.getSeconds();
    const time = `${hour}:${minute}.${second}`;
    for (const client of clients) {
      // console.log(client);
      // Use whatever message body makes the most sense.
      // Note that `Response` objects can't be serialized.
      console.log(`[SW] Sending postMessage() to ${clients.length} clients`);
      client.postMessage({ command: "scoreUpdate", updated: time });
      subscribedClients = 0;
    }
    // }
  },
};

// // Later, use the plugin when creating a response strategy:
// workbox.routing.registerRoute(
//   new RegExp('/path/prefix'),
//   workbox.strategies.staleWhileRevalidate({
//     plugins: [postMessagePlugin],
//   })
// );dddd

const apiStrategy = workbox.strategies.staleWhileRevalidate({
  cacheName: 'score',
  plugins: [postMessagePlugin],
});

var subscribedClients = 1;

function getUpdates() {
  console.log("now");
  if (subscribedClients > 0) {
    getCountryPreference().then(val => {
      if (val)
        return apiStrategy.makeRequest({ request: `score/${val.setting.toLowerCase()}.txt` });
      // return fetch(`score/${val.setting.toLowerCase()}.txt`);
      else
        subscribedClients = 0;
    });
  } else {
    // console.log("clearing interval");
    console.log("no subscribed clients");
    // clearInterval(interval);
  }
}

var interval = setInterval(getUpdates, 10 * 1000);

// interval();

self.addEventListener('fetch', function(e) {
  console.log('[SW] Fetching url:', e.request.url);
  if (/score/i.test(e.request.url)) {

    e.respondWith(
      getCountryPreference().then(val => {
        if (val)
          return apiStrategy.makeRequest({ e, request: `score/${val.setting.toLowerCase()}.txt` });
        // return fetch(`score/${val.setting.toLowerCase()}.txt`);
      })
    );
  }
});

self.addEventListener('message', function handler(event) {
  console.log(event.data);
  subscribedClients += 1;
  console.log(`subscribedClients = ${subscribedClients}`);

});