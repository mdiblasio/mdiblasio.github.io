var RUNS = 1;
var AMP_BATCH_URL = 'https://acceleratedmobilepageurl.googleapis.com/v1/ampUrls:batchGet';
var AMP_BATCH_API_KEY = 'AIzaSyDteMhzKv7HPdYx2zV4nyiQ3bbCdDoTMbM';

var dbPromise = idb.open('AMPDemos', 3, (function(upgradeDb) {
  if (!upgradeDb.objectStoreNames.contains('Tests')) {
    var queuedRequests = upgradeDb.createObjectStore('Tests', {
      unique: true,
      autoIncrement: true,
      keyPath: 'id',
    });
  }
  if (!upgradeDb.objectStoreNames.contains('API_Keys')) {
    upgradeDb.createObjectStore('API_Keys', {
      unique: true,
      // autoIncrement: true,
      keyPath: 'keyType',
    });
  }
}));

function recordClick(_url) {
  gtag('event', 'View Past Test', {
    'event_category': 'Test History',
    'event_label': _url
  });
}

// get test history
function getTests() {
  dbPromise.then(db => db.transaction('Tests', 'readonly').objectStore('Tests').getAll()).then(items => {
    let mytestsContainer = document.getElementById('mytestsContainer');
    if (items.length > 0) {
      document.getElementById('mytests').style.display = "block";
      for (let i = 0; i < items.length; i++) {
        let row = document.createElement('div');
        row.classList = "row";
        row.innerHTML = `
                          <div class="label mytests"><a href='${items[i].wptLink}' target="_blank" onclick="recordClick('${items[i].wptLink}');">Test ${i+1}</a></div>
                          <div class="entry">${items[i].url}</div>`;
        mytestsContainer.appendChild(row);
      }
    }
  });
}
getTests();

// save test to IndexedDB
function saveTest(url, wptLink) {
  dbPromise.then(db => db.transaction('Tests', 'readwrite').objectStore('Tests').add({ url: url, wptLink: wptLink }).complete);
}

// save API KEY to IndexedDB
function saveWPTAPIKey(wptApiKey) {
  dbPromise.then(db => db.transaction('API_Keys', 'readwrite').objectStore('API_Keys').add({ keyType: 'WPT', apiKey: wptApiKey }).complete);
}

// get WPT API key if it exists
function getWPTAPIKey() {
  dbPromise.then(db => db.transaction('API_Keys', 'readonly').objectStore('API_Keys').get('WPT')).then(key => {
    if (key)
      document.getElementById('wptApiKey').value = key.apiKey;
  });
}
getWPTAPIKey();

var toggle = document.getElementById('toggle');
var toggleSvg = document.getElementById('togglesvg');
var scriptBox = document.getElementById('script');
var expanded = false;

toggle.addEventListener('click', (e) => {
  console.log('clicked');
  scriptBox.style.display = expanded ? "none" : "block";
  toggleSvg.setAttribute("expanded", !expanded);
  expanded = !expanded;
});

// run WPT
function runWPT(url, connection, name, api_key) {
  return fetch(`https://www.webpagetest.org/runtest.php?k=${api_key}&url=${encodeURIComponent(url)}&f=json&runs=${RUNS}&fvonly=1&video=1&mobile=1&location=Dulles%3AChrome.${connection}`, {
    'method': 'GET',
  }).then(response => response.text()).then(json => {
    return {
      name: name,
      id: JSON.parse(json).data.testId
    };
  });
}

// TODO
// example: https://m.tokopedia.com/mitra-multitechn/traffic-cone-full-orange-75-cm-rubber-double-scotlight
// function amp2pwaWPTScript(searchTerm, ampUrl, pwaUrl, connection, name, api_key) {
//   let script =
//     `logData    0
// navigate    https://www.google.com/search?q=${encodeURIComponent(searchTerm)}
// sleep   3
// exec    window.scrollBy(0, 400);
// sleep   2
// exec    window.scrollBy(0, 400);
// sleep   2
// exec    window.scrollBy(0, 400);
// sleep   2
// exec    window.scrollBy(0, 400);
// sleep   2
// exec    window.scrollBy(0, 400);
// sleep   2
// exec    window.scrollBy(0, 400);
// sleep   5
// logData 0
// sleep   10
// logData    1
// navigate    ${pwaUrl}
// `;

// }

// run scripted WPT
function runScriptedWPT(searchTerm, ampUrl, connection, name, api_key) {
  let script =
    `logData    0
navigate    https://www.google.com/search?q=${encodeURIComponent(searchTerm)}
sleep   3
exec    window.scrollBy(0, 400);
sleep   2
exec    window.scrollBy(0, 400);
sleep   2
exec    window.scrollBy(0, 400);
sleep   2
exec    window.scrollBy(0, 400);
sleep   2
exec    window.scrollBy(0, 400);
sleep   2
exec    window.scrollBy(0, 400);
sleep   5
logData 1
execAndWait document.querySelector("a[href='${ampUrl}'").click();`;
  document.getElementById('collapse-script').style.display = 'block';
  document.getElementById('script').innerText = script;
  return fetch(`https://www.webpagetest.org/runtest.php?k=${api_key}&f=json&runs=${RUNS}&fvonly=1&video=1&mobile=1&location=Dulles%3AChrome.${connection}&script=${encodeURIComponent(script)}`).then(response => response.text()).then(json => {
    return {
      name: name,
      id: JSON.parse(json).data.testId
    };
  });
}

// call AMP URL API to get AMP and AMP Cache URLs given canonical URL
function callAMPBatchURLAPI(url) {
  return fetch(`${AMP_BATCH_URL}?key=${AMP_BATCH_API_KEY}`, {
    'body': `{"urls":["${url}"]}`,
    method: 'POST',
    headers: new Headers([
      ['Content-Type', 'application/json']
    ]),
  }).then(response => response.json());

}

var urlInput = document.getElementById("canonicalURL");
var AMPUrlsJson;

// check to make sure canonical URL has AMP equivalent as soon as user enters it
urlInput.addEventListener('change', (e) => {
  urlInput.setCustomValidity("Checking if URL is valid, try again in a moment");
  callAMPBatchURLAPI(urlInput.value).then(json => {
    AMPUrlsJson = json;
    if (json["urlErrors"])
      urlInput.setCustomValidity("Did not find AMP version. Enter a URL with an AMP equivalent.");
    else
      urlInput.setCustomValidity('');
  });
});

var wptApiKeyInput = document.getElementById("wptApiKey");
wptApiKeyInput.addEventListener('change', (e) => {
  saveWPTAPIKey(wptApiKeyInput.value);
});

// console.log('clicked....');
// let amp2pwaCheckbox = document.getElementById('amp2pwaCheckbox');
// let pwaURLrow = document.getElementById('pwaURLrow');

// amp2pwaCheckbox.addEventListener('click', () => {
//   console.log('clicked....');
//   if (amp2pwaCheckbox.checked) {
//     pwaURLrow.style.display = 'flex';
//     document.querySelectorAll('.checkbox').forEach(checkbox => {
//       if (checkbox.id != 'amp2pwaCheckbox')
//         checkbox.checked = false;
//     });
//   } else {
//     pwaURLrow.style.display = 'none';
//     document.querySelectorAll('.checkbox').forEach(checkbox => {
//       if (checkbox.id != 'amp2pwaCheckbox')
//         checkbox.checked = true;
//     });
//   }
// });

var form = document.getElementById('inputUrls');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  var formData = new FormData(form);

  document.getElementById('output').style.display = 'block';
  let connection = (formData.get('connectionType') === "3G") ? "3GFast" : formData.get('connectionType');
  let device = formData.get('device');
  let wptApiKey = formData.get('wptApiKey');

  let testInfo = {
    canonical: { url: AMPUrlsJson.ampUrls[0].originalUrl, label: 'Canonical', run: false },
    origin: { url: AMPUrlsJson.ampUrls[0].ampUrl, label: 'AMP Origin', run: false },
    cache: { url: AMPUrlsJson.ampUrls[0].cdnAmpUrl, label: 'AMP Cache', run: false },
    serp: { url: formData.get('searchTerm'), label: 'AMP SERP', run: false },
  };

  // run all tests
  var promises = [];
  document.querySelectorAll('.checkbox').forEach(check => {
    if (check.checked) {
      if (check.value === "serp")
        promises.push(runScriptedWPT(testInfo[check.value].url, testInfo.origin.url, connection, check.value, wptApiKey));
      else
        promises.push(runWPT(testInfo[check.value].url, connection, check.value, wptApiKey));
    }
  });

  // after tests have kicked off, populate links
  let first = true;
  Promise.all(promises).then(values => {
    let compareVideosURL = `https://www.webpagetest.org/video/compare.php?tests=`;
    values.forEach(val => {
      if (!first) compareVideosURL += `,`;
      first = false;
      compareVideosURL += `${val.id}-l:${testInfo[val.name].label}-c:0`;
      document.getElementById(`${val.name}WPTLink`).innerHTML = `<a target="_blank" href='https://www.webpagetest.org/result/${val.id}'>WPT Link</a>`;
    });
    compareVideosURL += `&ival=1000`;

    document.getElementById('comparisonLink').href = compareVideosURL;
    document.getElementById('wptiframe').src = compareVideosURL;

    saveTest(testInfo.canonical.url, compareVideosURL);
    gtag('event', 'Run Test', {
      'event_category': `${connection}`,
      'event_label': `url=${testInfo.canonical.url}&searchTerm=${testInfo.serp.url}&link=${compareVideosURL}`
    });
  });

  document.getElementById('canonicalUrl').innerHTML = `<code><a href='${testInfo.canonical.url}'>${testInfo.canonical.url}</a></code>`;
  document.getElementById('originUrl').innerHTML = `<code><a href='${testInfo.origin.url}'>${testInfo.origin.url}</a></code>`;
  document.getElementById('cacheUrl').innerHTML = `<code><a href='${testInfo.cache.url}'>${testInfo.cache.url}</a></code>`;
});