(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
      });
    });
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var type = scope.querySelector("[data-filter-type]");
      var category = scope.querySelector("[data-filter-category]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
      if (!cards.length) {
        return;
      }
      function apply() {
        var queryValue = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var categoryValue = normalize(category && category.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var index = normalize(card.getAttribute("data-search-index"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;
          if (queryValue && index.indexOf(queryValue) === -1) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }
          if (categoryValue && cardCategory.indexOf(categoryValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            matched = false;
          }
          card.classList.toggle("hidden", !matched);
        });
      }
      [input, type, category, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll(".poster-image"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      if (!video) {
        return;
      }
      var hlsUrl = video.getAttribute("data-hls");
      var hlsInstance = null;
      function attach() {
        if (!hlsUrl || video.getAttribute("data-ready") === "true") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(hlsUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = hlsUrl;
        }
        video.setAttribute("data-ready", "true");
      }
      function start() {
        attach();
        player.classList.add("is-playing");
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        attach();
        player.classList.add("is-playing");
      });
      video.addEventListener("click", function () {
        if (video.getAttribute("data-ready") !== "true") {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImages();
    setupPlayers();
  });
})();
