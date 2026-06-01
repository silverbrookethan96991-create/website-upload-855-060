(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var input = document.querySelector("[data-search-input]");
        var list = document.querySelector("[data-search-list]");
        if (!input || !list) {
            return;
        }
        var clear = document.querySelector("[data-search-clear]");
        var empty = document.querySelector("[data-search-empty]");
        var status = document.querySelector("[data-search-status]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-search-chip]"));

        function filter() {
            var q = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function(card) {
                var text = card.getAttribute("data-search") || "";
                var match = !q || text.indexOf(q) !== -1;
                card.classList.toggle("is-filtered-out", !match);
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
            if (status) {
                status.textContent = q ? "已筛选相关影片" : "热门影片片库";
            }
        }

        input.addEventListener("input", filter);

        if (clear) {
            clear.addEventListener("click", function() {
                input.value = "";
                input.focus();
                filter();
            });
        }

        chips.forEach(function(chip) {
            chip.addEventListener("click", function() {
                input.value = chip.getAttribute("data-search-chip") || chip.textContent;
                input.focus();
                filter();
            });
        });

        filter();
    }

    window.initMoviePlayer = function(src, poster) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".player-overlay");
        var hls = null;
        if (!video || !src) {
            return;
        }
        if (poster) {
            video.setAttribute("poster", poster);
        }

        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                return;
            }
            video.src = src;
        }

        function start() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function() {});
            }
        }

        attach();

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function() {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function() {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
