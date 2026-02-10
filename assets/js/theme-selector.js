// Global Snakes theme runtime + hero theme selector interactions.
(function () {
    'use strict';

    var STORAGE_KEY = 'theme';
    var DEFAULT_SLUG = 'default';
    var THEMES = [
        { name: 'Default', slug: 'default' },
        { name: 'Aurora Mint', slug: 'aurora-mint' },
        { name: 'Emberforge', slug: 'emberforge' },
        { name: 'Midnight Violet', slug: 'midnight-violet' },
        { name: 'Solar Flare', slug: 'solar-flare' },
        { name: 'Oceanic Depths', slug: 'oceanic-depths' },
        { name: 'Rose Nebula', slug: 'rose-nebula' },
        { name: 'Cyber Lime', slug: 'cyber-lime' },
        { name: 'Glacier Blue', slug: 'glacier-blue' },
        { name: 'Sandstone Gold', slug: 'sandstone-gold' }
    ];

    var THEMES_BY_SLUG = {};
    THEMES.forEach(function (theme) {
        THEMES_BY_SLUG[theme.slug] = theme;
    });

    function slugify(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function normalizeTheme(rawValue) {
        if (!rawValue) return DEFAULT_SLUG;
        var slug = slugify(rawValue);
        return THEMES_BY_SLUG[slug] ? slug : DEFAULT_SLUG;
    }

    function getStoredTheme() {
        var storedTheme = '';
        try {
            storedTheme = localStorage.getItem(STORAGE_KEY) || localStorage.theme || '';
        } catch (e) {
            storedTheme = '';
        }
        return normalizeTheme(storedTheme);
    }

    function setThemeAttribute(slug) {
        var resolved = THEMES_BY_SLUG[slug] ? slug : DEFAULT_SLUG;
        if (document.documentElement) {
            document.documentElement.dataset.theme = resolved;
        }
        if (document.body) {
            document.body.dataset.theme = resolved;
        }
        return resolved;
    }

    function updateSelectedState(slug) {
        var options = document.querySelectorAll('.theme-option');
        options.forEach(function (option) {
            var isSelected = option.getAttribute('data-theme') === slug;
            option.classList.toggle('is-selected', isSelected);
            option.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        });
    }

    function persistTheme(slug) {
        var theme = THEMES_BY_SLUG[slug] || THEMES_BY_SLUG[DEFAULT_SLUG];
        try {
            localStorage.setItem(STORAGE_KEY, theme.name);
            localStorage.theme = theme.name;
        } catch (e) {
            // Ignore storage failures (private mode, quota, etc).
        }
    }

    function applyTheme(slug, persist) {
        var resolved = THEMES_BY_SLUG[slug] ? slug : DEFAULT_SLUG;
        setThemeAttribute(resolved);
        updateSelectedState(resolved);
        if (persist !== false) {
            persistTheme(resolved);
        }
        return resolved;
    }

    function moveFocus(current, step) {
        var options = Array.prototype.slice.call(document.querySelectorAll('.theme-option'));
        var currentIndex = options.indexOf(current);
        if (currentIndex < 0 || !options.length) return;
        var nextIndex = (currentIndex + step + options.length) % options.length;
        options[nextIndex].focus();
    }

    function bindEvents() {
        var options = document.querySelectorAll('.theme-option');
        if (!options.length) return;

        options.forEach(function (option) {
            option.addEventListener('click', function () {
                applyTheme(option.getAttribute('data-theme'));
            });

            option.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    moveFocus(option, 1);
                } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    moveFocus(option, -1);
                }
            });
        });
    }

    function initThemeSelector() {
        var initialTheme = applyTheme(getStoredTheme(), false);
        if (document.querySelector('.theme-option')) {
            bindEvents();
            updateSelectedState(initialTheme);
        }
    }

    // Apply theme attribute immediately to reduce flash-of-unstyled-theme.
    setThemeAttribute(getStoredTheme());

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeSelector);
    } else {
        initThemeSelector();
    }
})();
