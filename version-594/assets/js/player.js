(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function safePlay() {
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    function bindStream() {
      if (started || !streamUrl) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            safePlay();
          });
        }
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      bindStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      safePlay();
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
