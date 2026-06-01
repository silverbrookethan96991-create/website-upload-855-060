(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var sliders = document.querySelectorAll('[data-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var prev = slider.querySelector('[data-prev]');
    var next = slider.querySelector('[data-next]');
    var dotsWrap = slider.querySelector('[data-dots]');
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }
    }

    function go(step) {
      setSlide(current + step);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        go(1);
      }, 5600);
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第' + (index + 1) + '屏');
        dot.addEventListener('click', function () {
          setSlide(index);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        go(1);
        restart();
      });
    }

    setSlide(0);
    restart();
  });

  var filterInputs = document.querySelectorAll('[data-filter-input]');

  function filterCards(input) {
    var area = input.closest('[data-search-area]') || document;
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
    var empty = area.querySelector('[data-empty]');
    var query = input.value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && !input.value) {
      input.value = q;
      filterCards(input);
    }
  });

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var url = shell.getAttribute('data-play');

    if (!video || !url) {
      return;
    }

    if (!video.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        shell.hlsPlayer = hls;
      } else {
        video.src = url;
      }
      video.dataset.ready = '1';
    }

    shell.classList.add('is-playing');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayer(shell);
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && video && !video.dataset.ready) {
        startPlayer(shell);
      }
    });
  });
})();
