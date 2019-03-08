// const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const { TRAY_ICON_PATH, CONTROLLER_TEM_PATH } = require('./conf');

module.exports = function runApp({ app, BrowserWindow, Tray, Menu, ipcMain }) {
  let tray = null;
  const state = {
    isQuit: false, 
    _cont: null,
    _song: '',
    _artist: '',
    _song_img: '',
    _bar_play: '0%',
    _btn_like: false,
    _now_play: false,
    get song() {
      return this._song;
    },
    set song(val) {
      if (val !== this._song) {
        this._song = val;
        setController("song", val);
      }
      
    },
    get artist() {
      return this._artist;
    },
    set artist(val) {
      if (val !== this._artist) {
        this._artist = val;
        setController("artist", val);
      }
    },
    get song_img() {
      return this._song_img;
    },
    set song_img(val) {
      if (val !== this._song_img) {
        this._song_img = val;
        setController("song_img", val);
      }
    },
    get controller() {
      if(!this._cont) {
        this._cont = createController();
      }

      return this._cont;
    },
    get now_play() {
      return this._now_play;    
    },
    set now_play(now_play) {
      setController("now_play", now_play);
      this._now_play = now_play;
    },
    get bar_play() {
      return this._bar_play;    
    },
    set bar_play(bar_play) {
      setController("bar_play", bar_play);
      this._bar_play = bar_play;
    },
    get btn_like() {
      return this._btn_like;
    },
    set btn_like(btn_like) {
      setController("btn_like", btn_like);
      this._btn_like = btn_like;
    }
  }
  function setController(key, val) {
    state.controller.webContents.send(
      'vibeChanged',
      {key, val}
    );
  }
  ipcMain.on('vibeCanged', (event, arg) => {
    state[arg.key] = arg.val;
  });

  ipcMain.on('syncState', (event) =>{ 
    event.sender.send('syncState', 
      Object.assign({}, state)
    )
  });

  function createController() {
    const win =  new BrowserWindow({ 
      width: 400,
      height: 103, 
      darkTheme: true, 
      maximizable: false,
      resizable: false
    });
    win.loadFile(CONTROLLER_TEM_PATH);
    win.on('close', (e) => {
      if (!state.isQuit) {
        e.preventDefault();
        win.hide();
      }
    })

    return win;
  }

  function createWindow () {
    let vive = new BrowserWindow({ width: 800, height: 600, closable: true, darkTheme: true, maximizable: false });
    tray = new Tray(__dirname + "/img/vibe_tray_16.png");
    const contextMenu = Menu.buildFromTemplate([
      {label: 'Open Vive', type: 'normal', click: () => {
        vive.show();
      }},
      {label: 'Open Controller', type: 'normal', click: () => {
        state.controller.show();
      }},
      {type: 'separator'},
      {label: 'Quit', type: 'normal', click: () => {
        state.isQuit = true;
        vive.close();
        app.quit();
      }}]);
    tray.setContextMenu(contextMenu); 

    vive.loadFile(__dirname + '/index.html');
    vive.on('close', (e) => {
      if (!state.isQuit) {
        e.preventDefault();
        vive.hide();
      }
    });
    
    ipcMain.on('tovibe', (event, id) => {
      vive.webContents.send('toVibe', id);
    });
  }

  createWindow();

  // 모든 창이 닫혔을 때 종료.
  app.on('window-all-closed', () => {
    // macOS에서는 사용자가 명확하게 Cmd + Q를 누르기 전까지는
    // 애플리케이션이나 메뉴 바가 활성화된 상태로 머물러 있는 것이 일반적입니다.
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}