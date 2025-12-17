(function () {
    var ICONS = {
        knight: '🛡️',
        wizard: '🧙',
        archer: '🏹',
        warrior: '⚔️'
    };

    function getCharacterIcon(fallback) {
        try {
            var saved = localStorage.getItem('snakes_selected_character');
            if (saved && ICONS[saved]) return ICONS[saved];
        } catch (e) {}
        return ICONS[fallback] || '🙂';
    }

    function randomPosition(size, forbidden) {
        var pos;
        var keyMap = {};
        (forbidden || []).forEach(function (f) { keyMap[f.x + '-' + f.y] = true; });
        do {
            pos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (keyMap[pos.x + '-' + pos.y]);
        return pos;
    }

    function createState(zone, opts) {
        var gridEl = zone.querySelector('.arcade-grid');
        var statusEl = zone.querySelector('.arcade-status');
        if (!gridEl) return null;
        var size = Number(opts.size || zone.dataset.arcadeSize || 5);
        var target = Number(opts.target || zone.dataset.arcadeTarget || 3);
        var icon = getCharacterIcon(zone.dataset.arcadeIcon);
        zone.style.setProperty('--arcade-grid-size', size);

        var player = {
            x: Math.floor(size / 2),
            y: size - 1
        };
        var orbs = [];
        for (var i = 0; i < target; i++) {
            var orb = randomPosition(size, [player].concat(orbs));
            orbs.push(orb);
        }

        var state = {
            zone: zone,
            grid: gridEl,
            status: statusEl,
            size: size,
            targetCount: target,
            collected: 0,
            orbs: orbs,
            player: player,
            icon: icon,
            completeMessage: opts.completeMessage || zone.dataset.arcadeComplete || 'All knowledge orbs secured!',
            activeMessage: opts.activeMessage || zone.dataset.arcadeMessage || 'Use WASD or arrow keys to collect the glowing orbs.',
            onComplete: typeof opts.onComplete === 'function' ? opts.onComplete : null
        };

        zone.__arcadeState = state;
        renderState(state);

        zone.addEventListener('mouseenter', function () { Arcade.activeState = state; });
        zone.addEventListener('click', function () { Arcade.activeState = state; });
        if (!Arcade.activeState) Arcade.activeState = state;
        updateStatus(state, state.activeMessage);

        return state;
    }

    function renderState(state) {
        state.grid.innerHTML = '';
        for (var y = 0; y < state.size; y++) {
            for (var x = 0; x < state.size; x++) {
                var cell = document.createElement('div');
                cell.className = 'arcade-cell';
                if (state.player.x === x && state.player.y === y) {
                    cell.classList.add('player');
                    cell.textContent = state.icon;
                } else if (state.orbs.some(function (orb) { return orb.x === x && orb.y === y; })) {
                    cell.classList.add('orb');
                }
                state.grid.appendChild(cell);
            }
        }
    }

    function updateStatus(state, message, complete) {
        if (!state.status) return;
        state.status.textContent = message;
        if (complete) state.status.classList.add('complete');
    }

    function movePlayer(state, dx, dy) {
        if (!state) return;
        var nx = state.player.x + dx;
        var ny = state.player.y + dy;
        if (nx < 0 || nx >= state.size || ny < 0 || ny >= state.size) return;
        state.player.x = nx;
        state.player.y = ny;
        var hitIndex = state.orbs.findIndex(function (orb) { return orb.x === nx && orb.y === ny; });
        if (hitIndex !== -1) {
            state.orbs.splice(hitIndex, 1);
            state.collected++;
            if (state.collected >= state.targetCount) {
                updateStatus(state, state.completeMessage, true);
                if (state.onComplete) state.onComplete();
            } else {
                updateStatus(state, 'Orb secured! ' + (state.targetCount - state.collected) + ' left.');
            }
        }
        renderState(state);
    }

    var Arcade = {
        activeState: null,
        initZones: function () {
            document.querySelectorAll('.arcade-zone').forEach(function (zone) {
                createState(zone, {});
            });
        },
        createMiniGame: function (zone, options) {
            return createState(zone, options || {});
        }
    };

    function handleKey(event) {
        var key = event.key.toLowerCase();
        var state = Arcade.activeState;
        if (!state) return;
        var dx = 0, dy = 0;
        if (key === 'arrowleft' || key === 'a') dx = -1;
        else if (key === 'arrowright' || key === 'd') dx = 1;
        else if (key === 'arrowup' || key === 'w') dy = -1;
        else if (key === 'arrowdown' || key === 's') dy = 1;
        else return;
        event.preventDefault();
        movePlayer(state, dx, dy);
    }

    document.addEventListener('keydown', handleKey);
    document.addEventListener('DOMContentLoaded', function () {
        Arcade.initZones();
    });

    window.SnakesArcade = Arcade;
})();
