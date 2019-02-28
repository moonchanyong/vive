// import { ipcRenderer } from "electron";
const { ipcRenderer }= require("electron");

// import binderbinder from "./src/binding"

const $ = document.querySelector.bind(document);
document.addEventListener('DOMContentLoaded', () => {
  const webview = document.querySelector('webview');
  webview.addEventListener('ipc-message', (event) => {
    if (event.channel === "back") webview.goBack();
    else if (event.channel === "forward") webview.goForward();
    else {
      ipcRenderer.send('vibeCanged', {
        key: event.channel,
        val: event.args
      })
    }
  });

  ipcRenderer.on('toVibe', (e, id) => {
    webview.send('toVibe', id);
  });

  webview.addEventListener('dom-ready', () => {
    webview.executeJavaScript(`
    const send = require('electron').ipcRenderer.sendToHost;
    document.addEventListener('keydown', (e) => {
      console.log(e.metaKey, e.ctrlKey, e.keyCode);
      if ((e.metaKey || e.ctrlKey) && e.keyCode === 37) send("back", "");
      else if ((e.metaKey || e.ctrlKey) && e.keyCode === 39) send("forward", "");
    })
    const init = async () => { 
      let loading = document.querySelector(".loading");
      while(!loading) { 
        await new Promise((r, v) => {
          setTimeout(r, 500);
        });
        loading = document.querySelector(".loading");
      }

      const config = { attributes: true, childList: true, characterData: true };
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // loaded
          if (mutation.target.parentNode.classList && mutation.target.parentNode.classList.contains("song")) {
            send("song", mutation.target.nodeValue.trim());  
          } else if (mutation.target.parentNode.classList && mutation.target.parentNode.classList.contains("artist")) {
            send("artist", mutation.target.nodeValue.trim());  
          } else if (mutation.target.src) {
            send("song_img", mutation.target.src);  
          } else if (mutation.target.classList && mutation.target.classList.contains("btn_now")) {
            send("now_play", mutation.target.classList.contains("play"));
          } else if (mutation.target.classList && mutation.target.classList.contains("bar_play")) {
            send("bar_play", mutation.target.style.width);
          } else if (mutation.target.classList && mutation.target.classList.contains("btn_like")) {
            send("btn_like", mutation.target.classList.contains("on"));
          }
        });
      }); 


      let song, artist, songImg, btn_now, btn_next, btn_prev, btn_like, bar_play;
      while(
        !song || !artist || !songImg || !btn_now || !btn_next || !btn_prev || !btn_like || !bar_play
      ) {
        song = document.querySelector('#player > div.player_controller > div.song_info > div.info_area > em > span');
        song = song? song.childNodes[1] : song;
        artist = document.querySelector('#player > div.player_controller > div.song_info > div.info_area > span');
        artist = artist? artist.childNodes[1] : artist;
        songImg = document.querySelector('#player > div.player_controller > div.song_info > a > img');
        btn_now = document.querySelector('#player > div.player_controller > div.control_section > div > a.btn_now'); 
        btn_next = document.querySelector('#player > div.player_controller > div.control_section > div > a.btn_play_next'); 
        btn_prev = document.querySelector('#player > div.player_controller > div.control_section > div > a.btn_play_prev'); 
        btn_like = document.querySelector('#player > div.player_controller > div.song_info > div.option_area > a'); 
        bar_play = document.querySelector('#player > div.player_controller > div.playing_progress > div > div.bar_play');
        await new Promise((r, v) => {
          setTimeout(r, 500);
        });        
      }
            
      observer.observe(song, config);
      observer.observe(artist, config);
      observer.observe(songImg, config);
      observer.observe(btn_now, config);
      observer.observe(btn_like, config);
      observer.observe(bar_play, config);
      

      // for init controller
      send("song", song.nodeValue.trim());  
      send("artist", artist.nodeValue.trim());  
      send("song_img", songImg.src);  
      send("now_play", btn_now.classList.contains("play"));  
      send("bar_play", bar_play.style.width);
      require('electron').ipcRenderer.on('toVibe', (event, id) => {
        switch(id) {
          case 'next':
            btn_next.click();
          break;
          case 'prev':
            btn_prev.click();
          break;
          case 'play':
            btn_now.click();
          break;
          case 'like':
            btn_like.click();
          break;
        }
        
      });
    } // end init
    init();`, true);
  });
});

