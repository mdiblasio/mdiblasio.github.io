import "./idb.js";

const dbPromise = idb.open('streams-demo', 2, upgradeDB => {
  if (!upgradeDB.objectStoreNames.contains('usersettings')) {
      upgradeDB.createObjectStore('usersettings', {keyPath: 'setting'});
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
    // tx.objectStore('usersettings').put({
    //   setting: "username",
    //   value: _username
    // });
    tx.objectStore('usersettings')
    	.put({
    		setting: "username",
    		data: _username
    	});
    return tx.complete;
  });
}

export function getUsername() {
	log("getUsername()");
  dbPromise.then(db => {
    return db.transaction('usersettings')
      .objectStore('usersettings').get("username");
  }).then(obj => {
  	log(`getUsername() = ${obj.data}`);
  	return obj.data;
  });
}