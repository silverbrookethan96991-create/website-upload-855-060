(function () {
    var panel = document.querySelector('[data-mobile-panel]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }

            index = (target + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        start();
    }

    var input = document.querySelector('[data-search-input]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-empty-state]');

    function matchValue(card, name, value) {
        if (!value) {
            return true;
        }
        return (card.getAttribute(name) || '').indexOf(value) !== -1;
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
            var ok = (!keyword || haystack.indexOf(keyword) !== -1) &&
                matchValue(card, 'data-region', regionValue) &&
                matchValue(card, 'data-type', typeValue) &&
                matchValue(card, 'data-year', yearValue);

            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    [input, region, type, year].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    filterCards();

    function setupPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var button = wrapper.querySelector('.play-overlay');
        var stream = wrapper.getAttribute('data-stream');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !stream) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function play() {
            attach();

            if (button) {
                button.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
