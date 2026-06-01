(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var form = scope.querySelector('[data-filter-form]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      if (!form || !cards.length) {
        return;
      }
      var keyword = form.querySelector('input[name="keyword"]');
      var category = form.querySelector('select[name="category"]');
      var type = form.querySelector('select[name="type"]');
      var region = form.querySelector('select[name="region"]');
      var year = form.querySelector('select[name="year"]');

      function matches(card) {
        var word = normalize(keyword && keyword.value);
        var inText = normalize(card.getAttribute('data-search'));
        var okWord = !word || inText.indexOf(word) !== -1;
        var okCategory = !category || !category.value || card.getAttribute('data-category') === category.value;
        var okType = !type || !type.value || card.getAttribute('data-type') === type.value;
        var okRegion = !region || !region.value || card.getAttribute('data-region') === region.value;
        var okYear = !year || !year.value || card.getAttribute('data-year') === year.value;
        return okWord && okCategory && okType && okRegion && okYear;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var isVisible = matches(card);
          card.classList.toggle('is-hidden', !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && keyword) {
        keyword.value = query;
        apply();
        var library = document.getElementById('library');
        if (library) {
          window.setTimeout(function () {
            library.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      } else {
        apply();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
