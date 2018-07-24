import "./utils/idb.js";

const dbPromise = idb.open('streams-demo', 2, upgradeDB => {
  if (!upgradeDB.objectStoreNames.contains('usersettings')) {
    upgradeDB.createObjectStore('usersettings', { keyPath: 'setting' });
  }
});



export function logger(_source, _msg) {
  console.log(`${_source}:\t${_msg}`);
}

function log(_msg) {
  logger("dbUtils.js", _msg);
}

export function updateUsername(_username) {
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

export function getSetting(_setting) {
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

export function deleteSetting(_setting) {
  return dbPromise.then(function(db) {
    var tx = db.transaction('usersettings', 'readwrite');
    var store = tx.objectStore('usersettings');
    store.delete(_setting);
    return tx.complete;
  });
}

export function updateHeader() {
  getSetting("username")
    .then(username => {
      if (username) {
        document.getElementById("userName").innerHTML = `Welcome back, <u>${username}</u>!`;
        document.getElementById("loginModule").style.setProperty("display", "none");
        document.getElementById("logoutModule").style.removeProperty("display");
      } else {
      	document.getElementById("userName").innerHTML = ``;
        document.getElementById("logoutModule").style.setProperty("display", "none");
        document.getElementById("loginModule").style.removeProperty("display");
      }
    });
}

export function logout() {
  log("logout()");
  deleteSetting("username")
  	.then(() => updateHeader());


}