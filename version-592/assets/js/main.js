(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const slider = document.querySelector('.hero-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;
    const showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    };
    const start = function () {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };
    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });
    start();
  }

  const cardLists = Array.from(document.querySelectorAll('[data-card-list]'));
  const liveInputs = Array.from(document.querySelectorAll('[data-live-search]'));
  const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
  const params = new URLSearchParams(window.location.search);
  const urlQuery = params.get('q') || '';
  let activeFilter = '全部';

  const normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  };

  const applyFilters = function () {
    const queryInput = liveInputs[0];
    const query = normalize(queryInput ? queryInput.value : '');
    cardLists.forEach(function (list) {
      Array.from(list.querySelectorAll('.movie-card')).forEach(function (card) {
        const text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        const category = card.getAttribute('data-category') || '';
        const filterMatch = activeFilter === '全部' || category === activeFilter || text.indexOf(normalize(activeFilter)) !== -1;
        const queryMatch = !query || text.indexOf(query) !== -1;
        card.style.display = filterMatch && queryMatch ? '' : 'none';
      });
    });
  };

  if (urlQuery && liveInputs.length) {
    liveInputs.forEach(function (input) {
      if (input.hasAttribute('data-query-sync')) {
        input.value = urlQuery;
      }
    });
    applyFilters();
  }

  liveInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || '全部';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });
})();
