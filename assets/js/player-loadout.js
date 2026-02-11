/*
 * Snakes player loadout/profile utility.
 * Responsibility:
 * - Defines hero identities and weapon presets used across Snakes game modes.
 * - Reads/writes selected hero, weapon, and avatar data from browser storage.
 * - Provides safe helper methods for rendering avatar markup in leaderboards/UI.
 * Fit in overall game:
 * - `snakes-game.js`, SLITHERRUSH modules, and other Snakes pages call `window.SnakesLoadout`
 *   so all modes share the same player identity and equipment configuration.
 */
(function (window) {
    'use strict';

    // Canonical storage keys so all Snakes pages read/write the same profile fields.
    var STORAGE_KEYS = {
        hero: 'snakes_selected_character',
        weapon: 'snakes_selected_weapon',
        avatarData: 'snakes_avatar_data',
        avatarUrl: 'snakes_avatar_url'
    };

    var HERO_LOADOUTS = {
        knight: {
            hero: 'knight',
            name: 'Knight',
            icon: '🛡️',
            weaponType: 'bulwark-disc',
            weaponName: 'Bulwark Disc',
            weaponDescription: 'Throws a reinforced shield-disc that ricochets off one wall before fading.',
            weaponEffect: 'Bounce',
            identity: 'Knight controls space with defensive pressure. Their weapon rewards steady aim and safe positioning.'
        },
        wizard: {
            hero: 'wizard',
            name: 'Wizard',
            icon: '🧙',
            weaponType: 'arcane-orb',
            weaponName: 'Arcane Orb',
            weaponDescription: 'Launches volatile magic that bursts on impact and splashes nearby targets.',
            weaponEffect: 'Splash',
            identity: 'Wizard zones enemies with magical bursts. Their shots are tactical and punish grouped movement.'
        },
        archer: {
            hero: 'archer',
            name: 'Archer',
            icon: '🏹',
            weaponType: 'piercing-arrow',
            weaponName: 'Piercing Arrow',
            weaponDescription: 'Fires a fast precision bolt with light guidance and excellent travel speed.',
            weaponEffect: 'Piercing',
            identity: 'Archer excels at precision and pressure. Their weapon rewards clean tracking and positioning.'
        },
        warrior: {
            hero: 'warrior',
            name: 'Warrior',
            icon: '⚔️',
            weaponType: 'rage-axe',
            weaponName: 'Rage Axe',
            weaponDescription: 'Hurls a heavy axe that hits hard and tears through front-line defenses.',
            weaponEffect: 'Cleave',
            identity: 'Warrior is the burst bruiser. Their weapon is heavier, slower, and built for decisive hits.'
        }
    };

    // Weapon behavior presets consumed by gameplay/rendering code.
    var WEAPON_PRESETS = {
        'bulwark-disc': {
            id: 'bulwark-disc',
            displayName: 'Bulwark Disc',
            shape: 'disc',
            speed: 10,
            size: 8,
            damage: 1,
            effect: 'bounce',
            maxBounces: 1,
            splashRadius: 0,
            homing: false,
            color: '#8ed7ff',
            glow: '#5bc7ff'
        },
        'arcane-orb': {
            id: 'arcane-orb',
            displayName: 'Arcane Orb',
            shape: 'orb',
            speed: 11,
            size: 8,
            damage: 1,
            effect: 'splash',
            maxBounces: 0,
            splashRadius: 24,
            homing: false,
            color: '#ff9f5a',
            glow: '#ff6b6b'
        },
        'piercing-arrow': {
            id: 'piercing-arrow',
            displayName: 'Piercing Arrow',
            shape: 'arrow',
            speed: 13.5,
            size: 5,
            damage: 1,
            effect: 'piercing',
            maxBounces: 0,
            splashRadius: 0,
            homing: true,
            color: '#8ef7cc',
            glow: '#4de8af'
        },
        'rage-axe': {
            id: 'rage-axe',
            displayName: 'Rage Axe',
            shape: 'axe',
            speed: 9,
            size: 10,
            damage: 2,
            effect: 'cleave',
            maxBounces: 0,
            splashRadius: 0,
            homing: false,
            color: '#ffc46b',
            glow: '#ffb347'
        }
    };

    // Storage wrappers prevent crashes in private mode / blocked storage contexts.
    function safeStorageRead(storage, key) {
        try {
            return storage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function safeStorageWrite(storage, key, value) {
        try {
            storage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Normalize hero values so game state never receives unknown character keys.
    function normalizeHero(hero) {
        var key = String(hero || '').toLowerCase().trim();
        return HERO_LOADOUTS[key] ? key : 'knight';
    }

    // Weapon selection is validated against presets, with hero default fallback.
    function normalizeWeaponType(hero, weaponType) {
        var heroKey = normalizeHero(hero);
        var type = String(weaponType || '').toLowerCase().trim();
        if (WEAPON_PRESETS[type]) return type;
        return HERO_LOADOUTS[heroKey].weaponType;
    }

    // Return a clean, read-only-ish copy for UI usage.
    function getLoadoutByHero(hero) {
        var heroKey = normalizeHero(hero);
        var entry = HERO_LOADOUTS[heroKey];
        return {
            hero: heroKey,
            name: entry.name,
            icon: entry.icon,
            weaponType: entry.weaponType,
            weaponName: entry.weaponName,
            weaponDescription: entry.weaponDescription,
            weaponEffect: entry.weaponEffect,
            identity: entry.identity
        };
    }

    // Return a cloned preset so callers cannot mutate the source table by accident.
    function getWeaponPreset(weaponType, hero) {
        var resolved = normalizeWeaponType(hero, weaponType);
        var preset = WEAPON_PRESETS[resolved];
        var copy = {};
        Object.keys(preset).forEach(function (key) {
            copy[key] = preset[key];
        });
        return copy;
    }

    // Session value wins during active play; local storage acts as persistent fallback.
    function getSelectedHero() {
        var value = safeStorageRead(sessionStorage, STORAGE_KEYS.hero) || safeStorageRead(localStorage, STORAGE_KEYS.hero);
        return normalizeHero(value);
    }

    // Same fallback order as hero selection, but normalized per current hero.
    function getStoredWeaponType(hero) {
        var value = safeStorageRead(sessionStorage, STORAGE_KEYS.weapon) || safeStorageRead(localStorage, STORAGE_KEYS.weapon);
        return normalizeWeaponType(hero || getSelectedHero(), value);
    }

    // Save loadout to chosen storage scope (guest/session vs signed-in/local).
    function saveLoadout(hero, weaponType, options) {
        var heroKey = normalizeHero(hero);
        var resolvedWeapon = normalizeWeaponType(heroKey, weaponType);
        var useSession = options && options.useSession;
        var storage = useSession ? sessionStorage : localStorage;
        safeStorageWrite(storage, STORAGE_KEYS.hero, heroKey);
        safeStorageWrite(storage, STORAGE_KEYS.weapon, resolvedWeapon);
        return {
            hero: heroKey,
            weaponType: resolvedWeapon
        };
    }

    // Avatar data URL storage accessor (photo snapshots, generated avatars, etc.).
    function getAvatarData() {
        return safeStorageRead(localStorage, STORAGE_KEYS.avatarData) || safeStorageRead(sessionStorage, STORAGE_KEYS.avatarData) || '';
    }

    // Avatar URL accessor for hosted profile images.
    function getAvatarUrl() {
        return safeStorageRead(localStorage, STORAGE_KEYS.avatarUrl) || safeStorageRead(sessionStorage, STORAGE_KEYS.avatarUrl) || '';
    }

    // Detect plain base64 strings that should be upgraded to data URLs.
    function isLikelyBase64Payload(value) {
        if (!value || value.length < 80) return false;
        return /^[A-Za-z0-9+/=\s]+$/.test(value);
    }

    // Accept only safe/expected avatar source formats and normalize them.
    function normalizeAvatarSource(source) {
        if (source === null || typeof source === 'undefined') return '';
        var value = String(source).trim();
        if (!value) return '';

        var lower = value.toLowerCase();
        if (lower === 'null' || lower === 'none' || lower === 'undefined' || lower === '[object object]') {
            return '';
        }

        if (/^data:image\//i.test(value)) return value;
        if (/^(https?:\/\/|blob:|\/\/|\/|\.\/|\.\.\/)/i.test(value)) return value;
        if (isLikelyBase64Payload(value)) {
            return 'data:image/png;base64,' + value.replace(/\s+/g, '');
        }
        return '';
    }

    // Store avatar image payload (or clear both stores when emptied).
    function setAvatarData(dataUrl, useSession) {
        var storage = useSession ? sessionStorage : localStorage;
        var value = String(dataUrl || '');
        if (!value) {
            clearAvatar();
            return;
        }
        safeStorageWrite(storage, STORAGE_KEYS.avatarData, value);
    }

    // Store avatar URL (or clear both stores when emptied).
    function setAvatarUrl(url, useSession) {
        var storage = useSession ? sessionStorage : localStorage;
        var value = String(url || '');
        if (!value) {
            clearAvatarUrl();
            return;
        }
        safeStorageWrite(storage, STORAGE_KEYS.avatarUrl, value);
    }

    // Remove avatar data from both scopes to avoid stale fallbacks.
    function clearAvatar() {
        try {
            localStorage.removeItem(STORAGE_KEYS.avatarData);
            sessionStorage.removeItem(STORAGE_KEYS.avatarData);
        } catch (e) {}
    }

    // Remove avatar URL from both scopes to avoid stale fallbacks.
    function clearAvatarUrl() {
        try {
            localStorage.removeItem(STORAGE_KEYS.avatarUrl);
            sessionStorage.removeItem(STORAGE_KEYS.avatarUrl);
        } catch (e) {}
    }

    // Pull avatar candidates from different server/client field naming conventions.
    function getAvatarSourceForPlayer(player) {
        if (player && typeof player === 'object') {
            var candidates = [
                player.avatar_data,
                player.avatarData,
                player.avatar_data_url,
                player.avatar_url,
                player.avatarUrl
            ];
            for (var i = 0; i < candidates.length; i++) {
                var normalized = normalizeAvatarSource(candidates[i]);
                if (normalized) return normalized;
            }
        }
        return '';
    }

    // Build compact initials fallback when avatar image is unavailable.
    function getInitials(name) {
        var text = String(name || 'Player').trim();
        if (!text) return 'P';
        var parts = text.split(/\s+/).filter(Boolean);
        if (!parts.length) return 'P';
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    // Escape user-provided text before injecting into HTML strings.
    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Render shared avatar bubble markup for leaderboard/lobby/player cards.
    function renderAvatarMarkup(player, options) {
        var opts = options || {};
        var className = opts.className || 'player-avatar-bubble';
        var ringColor = opts.ringColor || 'rgba(255, 255, 255, 0.6)';
        var size = opts.size || 24;
        var avatarSource = getAvatarSourceForPlayer(player) || opts.fallbackAvatar || '';
        var username = (player && (player.username || player.name)) || opts.fallbackName || 'Player';
        var initials = escapeHtml(getInitials(username));

        if (avatarSource) {
            return '<span class="' + escapeHtml(className) + ' has-image" style="--avatar-size:' + Number(size) + 'px;--avatar-ring:' + escapeHtml(ringColor) + ';" title="' + escapeHtml(username) + '">' +
                '<img src="' + escapeHtml(avatarSource) + '" alt="' + escapeHtml(username) + ' avatar" loading="lazy" decoding="async" />' +
                '</span>';
        }

        return '<span class="' + escapeHtml(className) + ' no-image" style="--avatar-size:' + Number(size) + 'px;--avatar-ring:' + escapeHtml(ringColor) + ';" title="' + escapeHtml(username) + '">' +
            '<span class="avatar-fallback">' + initials + '</span>' +
            '</span>';
    }

    // One-call profile snapshot used by page boot logic.
    function getFullProfile() {
        var hero = getSelectedHero();
        var loadout = getLoadoutByHero(hero);
        var weaponType = getStoredWeaponType(hero);
        return {
            hero: hero,
            weaponType: weaponType,
            loadout: loadout,
            avatarData: getAvatarData(),
            avatarUrl: getAvatarUrl()
        };
    }

    // Exported API for all Snakes front-end modules.
    window.SnakesLoadout = {
        STORAGE_KEYS: STORAGE_KEYS,
        HERO_LOADOUTS: HERO_LOADOUTS,
        WEAPON_PRESETS: WEAPON_PRESETS,
        normalizeHero: normalizeHero,
        normalizeWeaponType: normalizeWeaponType,
        getLoadoutByHero: getLoadoutByHero,
        getWeaponPreset: getWeaponPreset,
        getSelectedHero: getSelectedHero,
        getStoredWeaponType: getStoredWeaponType,
        saveLoadout: saveLoadout,
        getAvatarData: getAvatarData,
        getAvatarUrl: getAvatarUrl,
        normalizeAvatarSource: normalizeAvatarSource,
        setAvatarData: setAvatarData,
        setAvatarUrl: setAvatarUrl,
        clearAvatar: clearAvatar,
        clearAvatarUrl: clearAvatarUrl,
        getAvatarSourceForPlayer: getAvatarSourceForPlayer,
        getInitials: getInitials,
        renderAvatarMarkup: renderAvatarMarkup,
        getFullProfile: getFullProfile
    };
})(window);
