(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var menu = document.querySelector(".mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInput = document.querySelector(".card-filter");
  var filterGrid = document.querySelector(".filter-grid");

  if (filterInput && filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));

    filterInput.addEventListener("input", function () {
      var value = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        card.classList.toggle("is-filtered-out", value && keywords.indexOf(value) === -1);
      });
    });
  }

  var searchInput = document.getElementById("global-search");
  var searchResults = document.getElementById("search-results");
  var clearSearch = document.getElementById("clear-search");

  function renderSearch(value) {
    if (!searchResults || !window.__movieIndex) {
      return;
    }

    var query = (value || "").trim().toLowerCase();
    var data = window.__movieIndex.filter(function (movie) {
      if (!query) {
        return true;
      }

      return movie.keywords.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 180);

    if (!data.length) {
      searchResults.innerHTML = '<div class="empty-result">没有匹配内容，换一个关键词试试。</div>';
      return;
    }

    searchResults.innerHTML = data.map(function (movie) {
      return [
        '<a class="movie-card movie-card-small" href="' + movie.url + '">',
        '  <span class="poster-wrap">',
        '    <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
        '    <span class="year-badge">' + movie.year + '</span>',
        '  </span>',
        '  <span class="movie-card-body">',
        '    <strong>' + movie.title + '</strong>',
        '    <span>' + movie.oneLine + '</span>',
        '    <em>' + movie.meta + '</em>',
        '  </span>',
        '</a>'
      ].join("");
    }).join("");
  }

  if (searchInput && searchResults) {
    renderSearch("");

    searchInput.addEventListener("input", function () {
      renderSearch(searchInput.value);
    });

    if (clearSearch) {
      clearSearch.addEventListener("click", function () {
        searchInput.value = "";
        renderSearch("");
        searchInput.focus();
      });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-tag]")).forEach(function (button) {
      button.addEventListener("click", function () {
        searchInput.value = button.getAttribute("data-search-tag") || "";
        renderSearch(searchInput.value);
      });
    });
  }
})();
