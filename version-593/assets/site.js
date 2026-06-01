(function () {
  function bindMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function createResultCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";

    var poster = document.createElement("a");
    poster.className = "poster-link";
    poster.href = item.url;

    var img = document.createElement("img");
    img.src = item.cover;
    img.alt = item.title;
    img.loading = "lazy";

    var badge = document.createElement("span");
    badge.className = "play-badge";
    badge.textContent = "▶";

    var body = document.createElement("div");
    body.className = "card-body";

    var meta = document.createElement("div");
    meta.className = "card-meta";
    [item.year, item.region, item.type].forEach(function (value) {
      var span = document.createElement("span");
      span.textContent = value;
      meta.appendChild(span);
    });

    var h2 = document.createElement("h2");
    var link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.title;
    h2.appendChild(link);

    var p = document.createElement("p");
    p.textContent = item.desc;

    var tagRow = document.createElement("div");
    tagRow.className = "tag-row";
    var tag = document.createElement("span");
    tag.textContent = item.genre;
    tagRow.appendChild(tag);

    poster.appendChild(img);
    poster.appendChild(badge);
    body.appendChild(meta);
    body.appendChild(h2);
    body.appendChild(p);
    body.appendChild(tagRow);
    article.appendChild(poster);
    article.appendChild(body);
    return article;
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || typeof SEARCH_INDEX === "undefined") {
      return;
    }
    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var results = page.querySelector("[data-search-results]");
    var title = page.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(query) {
      var q = query.trim().toLowerCase();
      var list = SEARCH_INDEX.filter(function (item) {
        if (!q) {
          return true;
        }
        var text = [item.title, item.desc, item.region, item.type, item.year, item.genre, item.channel].concat(item.tags || []).join(" ").toLowerCase();
        return text.indexOf(q) !== -1;
      }).slice(0, 96);
      results.innerHTML = "";
      if (title) {
        title.textContent = q ? "相关内容" : "精选内容";
      }
      if (!list.length) {
        var empty = document.createElement("p");
        empty.className = "lead-text";
        empty.textContent = "暂未找到相关内容，可以尝试更换片名、地区或标签。";
        results.appendChild(empty);
        return;
      }
      list.forEach(function (item) {
        results.appendChild(createResultCard(item));
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
      window.history.replaceState(null, "", url);
      render(q);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initial);
  }

  function initVideoPlayer(source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !source) {
      return;
    }
    var prepared = false;
    var hls = null;

    function attachSource() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          var done = false;
          function finish() {
            if (!done) {
              done = true;
              resolve();
            }
          }
          hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              finish();
            }
          });
          window.setTimeout(finish, 1200);
        });
      }
      video.src = source;
      return Promise.resolve();
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function playVideo() {
      hideButton();
      attachSource().then(function () {
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", hideButton);
    video.addEventListener("ended", function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initVideoPlayer = initVideoPlayer;

  document.addEventListener("DOMContentLoaded", function () {
    bindMobileNav();
    initHeroCarousel();
    setupSearchPage();
  });
})();
