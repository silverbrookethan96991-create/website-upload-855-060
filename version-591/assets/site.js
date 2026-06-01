(function () {
    var base = document.body.getAttribute("data-base") || "";

    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function openSearch(query) {
        var text = String(query || "").trim();
        if (text) {
            window.location.href = base + "search.html?q=" + encodeURIComponent(text);
        }
    }

    $all(".search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            openSearch(input ? input.value : "");
        });
    });

    var mobileToggle = $(".mobile-toggle");
    var mobilePanel = $(".mobile-panel");
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            var isOpen = mobilePanel.hasAttribute("hidden");
            if (isOpen) {
                mobilePanel.removeAttribute("hidden");
                mobileToggle.setAttribute("aria-expanded", "true");
                mobileToggle.textContent = "×";
            } else {
                mobilePanel.setAttribute("hidden", "");
                mobileToggle.setAttribute("aria-expanded", "false");
                mobileToggle.textContent = "☰";
            }
        });
    }

    function initCarousel(root) {
        var slides = $all(".hero-slide", root);
        var dots = $all(".hero-dot", root);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        var prev = $("[data-prev]", root);
        var next = $("[data-next]", root);
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                restart();
            });
        });
        play();
    }

    $all("[data-carousel]").forEach(initCarousel);

    function compareCards(a, b, mode) {
        if (mode === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        if (mode === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        }
        if (mode === "views") {
            return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        }
        return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
    }

    function initFilterSection(section) {
        var grid = $(".filterable-grid", section);
        if (!grid) {
            return;
        }
        var search = $(".page-search-input", section);
        var sort = $(".sort-select", section);
        var filters = $all(".filter-select", section);

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : "";
            var cards = $all(".movie-card", grid);
            var activeFilters = filters.map(function (select) {
                return {
                    key: select.getAttribute("data-filter"),
                    value: select.value
                };
            }).filter(function (item) {
                return item.value;
            });

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var visible = !query || text.indexOf(query) !== -1;
                activeFilters.forEach(function (item) {
                    if (item.key === "category") {
                        visible = visible && text.indexOf(item.value.toLowerCase()) !== -1;
                    }
                });
                card.classList.toggle("is-hidden", !visible);
            });

            cards.sort(function (a, b) {
                return compareCards(a, b, sort ? sort.value : "score");
            }).forEach(function (card) {
                grid.appendChild(card);
            });
        }

        if (search) {
            search.addEventListener("input", apply);
        }
        if (sort) {
            sort.addEventListener("change", apply);
        }
        filters.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    $all(".section-block").forEach(initFilterSection);

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card poster-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-search=\"" + escapeHtml(movie.search) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-score=\"" + movie.score + "\">" +
            "<a href=\"" + movie.url + "\" class=\"poster-link\">" +
            "<figure class=\"poster-frame\">" +
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"play-mark\">▶</span>" +
            "<span class=\"poster-type\">" + escapeHtml(movie.type) + "</span>" +
            "</figure>" +
            "<div class=\"card-body\">" +
            "<h2>" + escapeHtml(movie.title) + "</h2>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.viewsText) + "观看</span></div>" +
            "<div class=\"card-tags\">" + tags + "</div>" +
            "</div>" +
            "</a>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function initSearchPage() {
        var container = $(".search-results");
        if (!container || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = $(".large-search input[name='q']");
        if (input) {
            input.value = query;
        }
        var source = window.MOVIE_INDEX;
        var list = source;
        if (query) {
            var lower = query.toLowerCase();
            list = source.filter(function (movie) {
                return movie.search.indexOf(lower) !== -1;
            });
        } else {
            list = source.slice(0, 80);
        }
        container.innerHTML = list.map(cardHtml).join("");
        initFilterSection(container.closest(".section-block") || document);
        initImageState(container);
    }

    function initPlayers() {
        $all("video[data-video-url]").forEach(function (video) {
            var url = video.getAttribute("data-video-url");
            if (!url) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = url;
            }
            var wrap = video.closest(".video-wrap");
            var button = wrap ? $(".play-toggle", wrap) : null;
            if (button) {
                button.addEventListener("click", function () {
                    video.play();
                });
            }
            video.addEventListener("play", function () {
                if (wrap) {
                    wrap.classList.add("playing");
                }
            });
            video.addEventListener("pause", function () {
                if (wrap) {
                    wrap.classList.remove("playing");
                }
            });
        });
    }

    function initImageState(scope) {
        $all("img", scope || document).forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
                img.removeAttribute("src");
            }, { once: true });
        });
    }

    initSearchPage();
    initPlayers();
    initImageState(document);
})();
