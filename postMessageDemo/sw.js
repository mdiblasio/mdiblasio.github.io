importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

// https://github.com/jakearchibald/idb
importScripts('idb.js');

if (workbox) {
  console.log(`[SW] Yay! Workbox is loaded 🎉`);
} else {
  console.log(`[SW] Boo! Workbox didn't load 😬`);
}

// Force development builds
workbox.setConfig({ debug: true });

workbox.skipWaiting();
workbox.clientsClaim();

const DEFAULT_COUNTRY_PREFERENCE = 'eur';

// IndexedDB
var dbPromise = idb.open('sportsDemoPWA', 1, function(upgradeDb) {
  console.log(`Creating object store 'userPreferences'`);
  if (!upgradeDb.objectStoreNames.contains('userPreferences')) {
    upgradeDb.createObjectStore('userPreferences', { keyPath: 'preference' });
  }
});

// read DB
function readDB(_table, _key) {
  return dbPromise.then(function(db) {
    return db.transaction(_table, 'readwrite')
      .objectStore(_table)
      .get(_key);
  });
}

// write to DB
function writeDB(_table, _value) {
  return dbPromise.then(function(db) {
    return db.transaction(_table, 'readwrite')
      .objectStore(_table)
      .put(_value)
      .complete;
  })
}

async function getCountryPreference() {
  return readDB('userPreferences', 'country');
}


// plugin to broadcast post messages when cache has been updated
const postMessagePlugin = {
  cacheDidUpdate: async({ cacheName, url, oldResponse, newResponse }) => {
    // Use whatever logic you want to determine whether the responses differ.
    // if (oldResponse && (oldResponse.headers.get('etag') !== newResponse.headers.get('etag'))) {
    const now = new Date();
    const hour = now.getHours() % 12;
    const minute = now.getMinutes() < 10 ? now.getMinutes() * 10 : now.getMinutes();
    const second = now.getSeconds() < 10 ? now.getSeconds() * 10 : now.getSeconds();
    const time = `${hour}:${minute}.${second}`;
    // clients must resubscribe after each update is sent
    subscribedClients = false;
    broadcastMessage({ command: "score-update", timestamp: time });
    // }sss
  },
};

const apiStrategy = workbox.strategies.staleWhileRevalidate({
  cacheName: 'score',
  plugins: [postMessagePlugin],
});


// rewrite URL based on user country preference
self.addEventListener('fetch', function(e) {
  console.log('[SW] Fetching url:', e.request.url);
  if (/score/i.test(e.request.url)) {
    e.respondWith(
      getCountryPreference().then(val => {
        val = val ? val.setting : DEFAULT_COUNTRY_PREFERENCE;
        // use api strategy to make request
        return apiStrategy.makeRequest({ e, request: `score/${val}.txt` });
      })
    );
  }
});


async function broadcastMessage(_msg) {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    console.log(`[SW] Sending postMessage(${_msg.command}) to ${clients.length} clients`);
    client.postMessage(_msg);
  }
}

// initially no subscribed clientss
var subscribedClients = false;
// check for updates every X seconds
const CHECK_FOR_UPDATES_INTERVAL_SECONDS = 10;

// check for updates if there are subscribed clientss
function getUpdates() {
  if (subscribedClients) {
    getCountryPreference().then(val => {
      val = val ? val.setting : DEFAULT_COUNTRY_PREFERENCE;
      return apiStrategy.makeRequest({ request: `score/${val}.txt` });
    });
  } else {
    console.log(`[SW] No subscribed clients, not checking for updates`);
  }
}
var interval = setInterval(getUpdates, CHECK_FOR_UPDATES_INTERVAL_SECONDS * 1000);


// message handler
self.addEventListener('message', function handler(event) {
  // reply if receipt requested
  if (event.data.receipt)
    event.ports[0].postMessage({ received: true });
  console.log(`[SW] Message received, command: '${event.data.command}'`);
  if (event.data.command === 'subscribe')
    subscribedClients = true;
  // }
});