const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const extract = require('extract-zip')
const https = require('https');
const fs = require('fs');
const TRY_LIMIT = 5;

function checkUpdate(i) {
  if (i <= 0) return Promise.reject('fail');
  return new Promise((resolve, reject) => {
    const rsp = https.get('https://raw.githubusercontent.com/moonchanyong/vive/electron/package.json', (rsp) => {
      rsp.on('data', (d) => {        
        const json = JSON.parse(d.toString());
        resolve(json.version);
        return;
      });
    }).once('error', () => {
      checkUpdate(i-1).then(resolve, reject);
    });  
  });
}

function loadLatest() {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/package.json', (err, data) => {
      if(err) resolve('fail');
      const current = JSON.parse(data.toString());
      resolve(current.version);
    });
  });
}

function init() {
  return new Promise(async (resolve, reject) => {
    await loadLatest().then(async latestVer => {
      if (latestVer === 'fail') reject();
      else {
        await checkUpdate(TRY_LIMIT).then(remote => {
          resolve(remote !== latestVer);
        }, msg => {
          reject();
        });
      }
    });
  });  
}

(async () => { init().then(
  result => {
    if (result) update(TRY_LIMIT).then(run, updateFailHandle);
    else run(); 
  }, () => {
    run();
  });
})();

function updateFailHandle() {
  console.log('실패했당!');
}

  function update(i) {
    if(i <= 0) return Promise.reject('fail');
    return new Promise((resolve, reject) => {
      download('https://raw.githubusercontent.com/moonchanyong/vive/electron/app.zip', 
      'app.zip').then(() => {
        deleteFolderRecursive(__dirname + '/app');
        extract('./app.zip', { dir: __dirname }, function (err) {
          if(err) update(i-1).then(resolve, reject);
          else resolve();
          return;
        });
      });  
    });
  }

  function run(){
    const runApp = require('./app/app');
    runApp({ app, BrowserWindow, Tray, Menu, ipcMain });
  };

   function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

  function download(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
      const request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(resolve);
        });
      }).on('error', function(err) {
        fs.unlink(dest); 
        if (cb) cb(err.message);
      });
    });
  };