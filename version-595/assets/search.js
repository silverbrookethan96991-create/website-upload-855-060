(function () {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const heading = document.querySelector('[data-search-heading]');

  if (input) {
    input.value = query;
  }

  function createCard(item) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-badge">▶</span>',
      '<span class="heat-badge">' + escapeHtml(item.year) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
      '<p>' + escapeHtml(item.desc) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '<div class="tag-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function render() {
    if (!results || !Array.isArray(window.SEARCH_INDEX)) {
      return;
    }

    const keyword = query.toLowerCase();
    const data = window.SEARCH_INDEX.filter(function (item) {
      if (!keyword) {
        return true;
      }
      return [item.title, item.desc, item.category, item.region, item.type, item.genre, item.tags].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);

    results.innerHTML = '';
    data.forEach(function (item) {
      results.appendChild(createCard(item));
    });

    if (heading) {
      heading.textContent = query ? '搜索结果：' + query : '热门搜索';
    }

    const empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('hidden', data.length !== 0);
    }
  }

  render();
})();
