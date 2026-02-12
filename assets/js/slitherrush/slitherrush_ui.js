(function (window) {
    'use strict';

    var SlitherRush = window.SlitherRush = window.SlitherRush || {};

    function formatClock(totalSeconds) {
        if (totalSeconds == null) return '--:--';
        var sec = Math.max(0, Math.floor(Number(totalSeconds || 0)));
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function UI() {
        this.stateLabel = document.getElementById('srStateLabel');
        this.lengthValue = document.getElementById('srLengthValue');
        this.scoreValue = document.getElementById('srScoreValue');
        this.aliveValue = document.getElementById('srAliveValue');
        this.matchTimerValue = document.getElementById('srMatchTimerValue');
        this.ammoValue = document.getElementById('srAmmoValue');
        this.dmgValue = document.getElementById('srDmgValue');

        this.ammoBar = document.getElementById('srAmmoBar');
        this.dmgIndicator = document.getElementById('srDmgIndicator');

        this.leaderboardList = document.getElementById('srLeaderboardList');

        this.deathOverlay = document.getElementById('srDeathOverlay');
        this.deathText = document.getElementById('srDeathText');
        this.spectatingText = document.getElementById('srSpectatingText');

        this.endOverlay = document.getElementById('srEndOverlay');
        this.endReason = document.getElementById('srEndReason');
        this.endResults = document.getElementById('srEndResults');

        this.leaveButton = document.getElementById('srLeaveBtn');
        this.backButton = document.getElementById('srBackBtn');
        this.playAgainButton = document.getElementById('srPlayAgainBtn');
    }

    UI.prototype.bindActions = function (handlers) {
        handlers = handlers || {};

        if (this.leaveButton) {
            this.leaveButton.addEventListener('click', function () {
                if (handlers.onLeave) handlers.onLeave();
            });
        }

        if (this.backButton) {
            this.backButton.addEventListener('click', function () {
                if (handlers.onBack) handlers.onBack();
            });
        }

        if (this.playAgainButton) {
            this.playAgainButton.addEventListener('click', function () {
                if (handlers.onPlayAgain) handlers.onPlayAgain();
            });
        }
    };

    UI.prototype._renderLeaderboard = function (leaderboard, selfId) {
        if (!this.leaderboardList) return;

        var rows = Array.isArray(leaderboard) ? leaderboard.slice(0, 5) : [];
        this.leaderboardList.innerHTML = '';

        rows.forEach(function (entry, index) {
            var row = document.createElement('div');
            row.className = 'sr-leaderboard-row' + (entry.id === selfId ? ' self' : '');
            row.innerHTML =
                '<span>#' + (index + 1) + ' ' + (entry.username || 'Player') + '</span>' +
                '<strong>' + Math.max(0, Number(entry.score || 0)) + '</strong>';
            this.leaderboardList.appendChild(row);
        }, this);

        if (!rows.length) {
            var empty = document.createElement('div');
            empty.className = 'sr-leaderboard-empty';
            empty.textContent = 'No slithers yet. Start collecting orbs.';
            this.leaderboardList.appendChild(empty);
        }
    };

    UI.prototype._renderResults = function (results) {
        if (!this.endOverlay) return;

        if (!results || !Array.isArray(results.results)) {
            this.endOverlay.classList.remove('active');
            return;
        }

        this.endOverlay.classList.add('active');
        if (this.endReason) {
            this.endReason.textContent = results.reason || 'Match complete';
        }

        if (this.endResults) {
            this.endResults.innerHTML = '';
            results.results.slice(0, 8).forEach(function (entry, index) {
                var row = document.createElement('div');
                row.className = 'sr-result-row';
                row.innerHTML =
                    '<span>#' + (index + 1) + ' ' + (entry.username || 'Player') + '</span>' +
                    '<strong>L' + Math.max(0, Number(entry.length || 0)) + ' / S' + Math.max(0, Number(entry.score || 0)) + '</strong>';
                this.endResults.appendChild(row);
            }, this);
        }
    };

    UI.prototype.render = function (state, context) {
        if (!state) return;

        context = context || {};

        var players = Array.isArray(state.players) ? state.players : [];
        var self = players.find(function (player) { return player.id === state.self_id; }) || null;
        var rawState = String(state.state || 'active').toLowerCase();
        var stateLabel = rawState === 'active'
            ? 'LIVE'
            : (rawState === 'waiting' ? 'WARMUP' : rawState.toUpperCase());
        var timerValue = formatClock(state.time_left || state.countdown || 0);
        if (rawState === 'active' && Number(state.time_left || 0) <= 0) {
            timerValue = '∞';
        }

        if (this.stateLabel) this.stateLabel.textContent = stateLabel;
        if (this.matchTimerValue) this.matchTimerValue.textContent = timerValue;
        if (this.aliveValue) this.aliveValue.textContent = Math.max(0, Number(state.alive_count || 0));

        var snakeLength = 0;
        var bonus = Number(context.localLengthBonus || 0);
        if (self) {
            snakeLength = Math.max(0, Number(self.length || 0)) + bonus;
            if (this.lengthValue) this.lengthValue.textContent = snakeLength;
            if (this.scoreValue) this.scoreValue.textContent = Math.max(0, Number(self.score || 0));
        } else {
            if (this.lengthValue) this.lengthValue.textContent = '0';
            if (this.scoreValue) this.scoreValue.textContent = '0';
        }

        // Damage multiplier based on length (1x base + 0.5x per 5 length)
        var dmgMultiplier = 1 + Math.floor(snakeLength / 5) * 0.5;
        if (this.dmgValue) this.dmgValue.textContent = dmgMultiplier.toFixed(1) + 'x';
        if (this.dmgIndicator) this.dmgIndicator.textContent = 'DMG: ' + dmgMultiplier.toFixed(1) + 'x  ·  Length = Power';

        // Update ammo bar pips
        var ammo = context.ammo || 0;
        var maxAmmo = context.maxAmmo || 6;
        if (this.ammoValue) this.ammoValue.textContent = ammo;
        if (this.ammoBar) {
            // Rebuild pips if count changed
            var pips = this.ammoBar.querySelectorAll('.sr-ammo-pip');
            if (pips.length !== maxAmmo) {
                var label = this.ammoBar.querySelector('.sr-ammo-label');
                this.ammoBar.innerHTML = '';
                if (label) this.ammoBar.appendChild(label);
                else {
                    var newLabel = document.createElement('span');
                    newLabel.className = 'sr-ammo-label';
                    newLabel.textContent = 'AMMO';
                    this.ammoBar.appendChild(newLabel);
                }
                for (var p = 0; p < maxAmmo; p++) {
                    var pip = document.createElement('div');
                    pip.className = 'sr-ammo-pip';
                    this.ammoBar.appendChild(pip);
                }
                pips = this.ammoBar.querySelectorAll('.sr-ammo-pip');
            }
            for (var q = 0; q < pips.length; q++) {
                pips[q].classList.toggle('filled', q < ammo);
                pips[q].classList.toggle('recharging', q === ammo && ammo < maxAmmo);
            }
        }

        this._renderLeaderboard(state.leaderboard || [], state.self_id);

        var spectatingName = context.spectatingName || '--';
        var eliminated = !!(self && self.status === 'spectator' && state.state === 'active');

        if (this.deathOverlay) {
            this.deathOverlay.classList.toggle('active', eliminated || !!context.localDeath);
        }
        if (eliminated || context.localDeath) {
            if (this.deathText) {
                this.deathText.textContent = context.localDeath
                    ? ('CRASHED INTO ' + (context.localDeathKiller || 'ANOTHER SNAKE') + '!')
                    : 'YOU WERE ELIMINATED';
            }
            if (this.spectatingText) this.spectatingText.textContent = 'Redirecting...';
        }

        this._renderResults(context.results || null);
    };

    SlitherRush.UI = UI;
})(window);
