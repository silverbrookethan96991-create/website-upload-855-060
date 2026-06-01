import { H as Hls } from './hls.js';

function attachPlayer(shell) {
  const video = shell.querySelector('video');
  const playButton = shell.querySelector('[data-play]');
  const playUrl = video ? video.getAttribute('data-url') : '';
  let hlsInstance = null;
  let attached = false;

  function loadVideo() {
    if (!video || !playUrl || attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
      attached = true;
      return;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
      attached = true;
    }
  }

  function start() {
    loadVideo();
    shell.classList.add('is-playing');
    if (video) {
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
  }

  if (playButton) {
    playButton.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!attached) {
        start();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.querySelectorAll('.player-shell').forEach(attachPlayer);
