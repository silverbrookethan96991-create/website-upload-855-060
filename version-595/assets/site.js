(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let active = Math.max(0, slides.findIndex(function (slide) {
    return slide.classList.contains('is-active');
  }));
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
      dot.setAttribute('aria-pressed', dotIndex === active ? 'true' : 'false');
    });
  }

  function startHero() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(active);
    startHero();
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });
    prev && prev.addEventListener('click', function () {
      showSlide(active - 1);
      startHero();
    });
    next && next.addEventListener('click', function () {
      showSlide(active + 1);
      startHero();
    });
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const cards = Array.from(document.querySelectorAll('.movie-card[data-title]'));
  const empty = document.querySelector('[data-empty-state]');

  function applyFilters() {
    if (!filterInput && !yearSelect && !typeSelect) {
      return;
    }
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' ').toLowerCase();
      const okKeyword = !keyword || text.indexOf(keyword) !== -1;
      const okYear = !year || card.dataset.year === year;
      const okType = !type || card.dataset.type === type;
      const matched = okKeyword && okYear && okType;
      card.classList.toggle('hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('hidden', visible !== 0);
    }
  }

  [filterInput, yearSelect, typeSelect].forEach(function (control) {
    control && control.addEventListener('input', applyFilters);
    control && control.addEventListener('change', applyFilters);
  });
  applyFilters();
})();
