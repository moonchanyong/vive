const { ipcRenderer } = require("electron");

const state = {
  _song: null,
  _song_img: null, 
  _artist :null,
  _now_play: null,
  _bar_play: 0,
  _btn_like: null,
  get song(){
    return this._song;
  },
  set song(song) {
    if (song) els.song.nodeValue = song;
    this._song = song;
  },
  get song_img(){
    return this._song_img;
  },
  set song_img(song_img) {
    if(song_img) els.song_img.src = song_img;
    this._song_img = song_img;
  },
  get artist(){
    return this._artist;
  },
  set artist(artist) {
    if (artist) els.artist.nodeValue = artist;
    this._artist = artist;
  },
  get now_play() {
    return this._now_play;
  },
  set now_play(val) {
    // val === true => add class .play;
    val? els.now_play.classList.add('play') : els.now_play.classList.remove('play');
    this._now_play = val;
  },
  get bar_play() {
    return this._bar_play;
  },
  set bar_play(val) {
    // typeof val === 'string'
    els.bar_play.style.width = val;
    this._bar_play = val;
  },
  get btn_like() {
    return this._btn_like;
  },
  set btn_like(btn_like) {
    btn_like? els.btn_like.classList.add('on') : els.btn_like.classList.remove('on');
    this._btn_like = btn_like;
  }
}

const els = {
  song: null,
  artist: null,
  song_img: null,
  now_play: null,
  bar_play: null
}

ipcRenderer.send('syncState');
ipcRenderer.on('syncState', (event, arg) => {
  const keys = Object.keys(arg);
  for (const key in arg) {
    if (!key.startsWith('_')) {
      state[key] = arg[key][0];
    }
  }
});

function clickHandler(el){
  ipcRenderer.send('tovibe', el.id);
}

ipcRenderer.on('vibeChanged', (event, arg) => {
  update(arg.key, arg.val[0]);
});


function update(key, val) {
  state[key] = val;
}

document.addEventListener("DOMContentLoaded", () => {
  const $ = document.querySelector.bind(document);
  els.song = $('body > div > div.song_info > div.info_area > em > span').childNodes[0];
  els.artist = $('body > div > div.song_info > div.info_area > span').childNodes[0];
  els.song_img = $('body > div > div.song_info > a > img');
  els.now_play = $('body > div > div.control_section > div > a.btn_now');
  els.bar_play = $('body > div > div.playing_progress > div > div');
  els.btn_like = $('#like');
});