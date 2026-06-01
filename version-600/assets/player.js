(function () {
  function initMoviePlayer(videoId, buttonId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var prepared = false;

    if (!video || !sourceUrl) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      }
    }

    function start() {
      prepare();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playing = video.play();

      if (playing && typeof playing.catch === "function") {
        playing.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
