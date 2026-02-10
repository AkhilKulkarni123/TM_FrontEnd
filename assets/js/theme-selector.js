// Global Snakes theme runtime + hero theme selector interactions.
(function () {
    'use strict';

    var STORAGE_KEY = 'theme';
    var DEFAULT_SLUG = 'default';
    var THEMES = [
        { name: 'Default', slug: 'default', swatch1: '#667eea', swatch2: '#764ba2' },
        { name: 'Aurora Mint', slug: 'aurora-mint', swatch1: '#3dd6b0', swatch2: '#0f766e' },
        { name: 'Emberforge', slug: 'emberforge', swatch1: '#ff7a3d', swatch2: '#c0392b' },
        { name: 'Midnight Violet', slug: 'midnight-violet', swatch1: '#8b5cf6', swatch2: '#4c1d95' },
        { name: 'Solar Flare', slug: 'solar-flare', swatch1: '#ffb703', swatch2: '#fb8500' },
        { name: 'Oceanic Depths', slug: 'oceanic-depths', swatch1: '#00b4d8', swatch2: '#0077b6' },
        { name: 'Rose Nebula', slug: 'rose-nebula', swatch1: '#ff5ca8', swatch2: '#c9184a' },
        { name: 'Cyber Lime', slug: 'cyber-lime', swatch1: '#a3e635', swatch2: '#4d7c0f' },
        { name: 'Glacier Blue', slug: 'glacier-blue', swatch1: '#60a5fa', swatch2: '#1d4ed8' },
        { name: 'Sandstone Gold', slug: 'sandstone-gold', swatch1: '#d4a373', swatch2: '#a97142' }
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

    function getOptionScope(option) {
        return option.closest('[data-theme-options-group]') || option.closest('.theme-options') || option.parentElement;
    }

    function moveFocus(current, step) {
        var scope = getOptionScope(current);
        if (!scope) return;
        var options = Array.prototype.slice.call(scope.querySelectorAll('.theme-option'));
        var currentIndex = options.indexOf(current);
        if (currentIndex < 0 || !options.length) return;
        var nextIndex = (currentIndex + step + options.length) % options.length;
        options[nextIndex].focus();
    }

    function bindEvents() {
        var options = document.querySelectorAll('.theme-option');
        if (!options.length) return;

        options.forEach(function (option) {
            if (option.dataset.themeBound === '1') return;
            option.dataset.themeBound = '1';

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

    function shouldRenderQuickSelector() {
        if (!document.body) return false;
        return document.body.classList.contains('snakes-theme') || !!document.querySelector('.snakes-theme');
    }

    function createThemeOption(theme) {
        var option = document.createElement('button');
        option.type = 'button';
        option.className = 'theme-option';
        option.setAttribute('role', 'radio');
        option.setAttribute('aria-checked', 'false');
        option.setAttribute('data-theme', theme.slug);
        option.setAttribute('data-theme-name', theme.name);
        option.setAttribute('aria-label', theme.name + ' theme');

        var swatch = document.createElement('span');
        swatch.className = 'theme-swatch';
        swatch.setAttribute('aria-hidden', 'true');
        swatch.style.setProperty('--swatch-1', theme.swatch1);
        swatch.style.setProperty('--swatch-2', theme.swatch2);

        var label = document.createElement('span');
        label.className = 'theme-option-label';
        label.textContent = theme.name;

        var check = document.createElement('span');
        check.className = 'theme-check';
        check.setAttribute('aria-hidden', 'true');
        check.textContent = '✓';

        option.appendChild(swatch);
        option.appendChild(label);
        option.appendChild(check);
        return option;
    }

    function ensureQuickSelector() {
        if (!shouldRenderQuickSelector()) return;
        if (document.getElementById('theme-quick-launch')) return;

        var launchBtn = document.createElement('button');
        launchBtn.type = 'button';
        launchBtn.id = 'theme-quick-launch';
        launchBtn.className = 'theme-quick-launch';
        launchBtn.setAttribute('aria-label', 'Open theme selector');
        launchBtn.setAttribute('aria-controls', 'theme-selector-modal');
        launchBtn.setAttribute('aria-expanded', 'false');
        launchBtn.innerHTML = '<span aria-hidden="true">🎨</span>';

        var overlay = document.createElement('div');
        overlay.id = 'theme-selector-modal';
        overlay.className = 'theme-selector-modal-overlay';
        overlay.setAttribute('aria-hidden', 'true');

        var modal = document.createElement('div');
        modal.className = 'theme-selector-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'theme-selector-modal-title');

        var header = document.createElement('div');
        header.className = 'theme-selector-modal-header';

        var title = document.createElement('h3');
        title.id = 'theme-selector-modal-title';
        title.textContent = 'Themes';

        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'theme-selector-modal-close';
        closeBtn.setAttribute('aria-label', 'Close theme selector');
        closeBtn.textContent = '×';

        header.appendChild(title);
        header.appendChild(closeBtn);

        var subtitle = document.createElement('p');
        subtitle.className = 'theme-selector-modal-subtitle';
        subtitle.textContent = 'Choose your game color style.';

        var optionsWrap = document.createElement('div');
        optionsWrap.className = 'theme-options';
        optionsWrap.setAttribute('data-theme-options-group', 'quick');
        optionsWrap.setAttribute('role', 'radiogroup');
        optionsWrap.setAttribute('aria-label', 'Theme options');
        THEMES.forEach(function (theme) {
            optionsWrap.appendChild(createThemeOption(theme));
        });

        modal.appendChild(header);
        modal.appendChild(subtitle);
        modal.appendChild(optionsWrap);
        overlay.appendChild(modal);

        function closeModal() {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            launchBtn.setAttribute('aria-expanded', 'false');
        }

        function openModal() {
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            launchBtn.setAttribute('aria-expanded', 'true');
            var selected = overlay.querySelector('.theme-option.is-selected') || overlay.querySelector('.theme-option');
            if (selected) selected.focus();
        }

        launchBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
                closeModal();
            }
        });

        document.body.appendChild(launchBtn);
        document.body.appendChild(overlay);
    }

    function initThemeSelector() {
        ensureQuickSelector();
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
