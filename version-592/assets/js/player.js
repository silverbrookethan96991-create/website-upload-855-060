(function () {
  document.querySelectorAll('.player-shell').forEach(function (shell) {
    const video = shell.querySelector('.video-player');
    const cover = shell.querySelector('.player-cover');
    if (!video || !cover) {
      return;
    }

    const url = video.getAttribute('data-url');
    let attached = false;
    let hls = null;

    const attachVideo = function () {
      if (attached || !url) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }
      video.src = url;
    };

    const startPlayback = function () {
      attachVideo();
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
