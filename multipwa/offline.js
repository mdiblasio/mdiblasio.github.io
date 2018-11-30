window.addEventListener('offline', goOffline);

window.addEventListener('online', goOnline);

let offline = document.createElement('div');
offline.innerHTML = "You are offline";
offline.id = "offline"

function goOffline() {
  console.log("you are offline");

  document.body.insertBefore(offline, document.querySelector('h2'));

  caches.open('html').then(cache => cache.keys())
    .then(keys => {
      let paths = [];
      keys.forEach(key => {
        paths.push(key.url);
      });
      document.querySelectorAll('a').forEach(link => {
        if (!paths.includes(link.href))
          link.setAttribute("disabled", "true");
      });
    });
}

function goOnline() {
  console.log("you are online");
  offline.remove();
  
  document.querySelectorAll('a').forEach(link => {
    link.setAttribute("disabled", "false");
  });
}

window.addEventListener('load', () => {
  if (navigator.onLine)
    goOnline();
  else
    goOffline();
});