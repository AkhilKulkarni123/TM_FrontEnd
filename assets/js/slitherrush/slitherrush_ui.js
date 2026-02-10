(function (window) {
    'use strict';

    var SlitherRush = window.SlitherRush = window.SlitherRush || {};

    function formatClock(totalSeconds) {
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
            empty.textContent = 'Waiting for players...';
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

        if (this.stateLabel) this.stateLabel.textContent = String(state.state || 'waiting').toUpperCase();
        if (this.matchTimerValue) this.matchTimerValue.textContent = formatClock(state.time_left || state.countdown || 0);
        if (this.aliveValue) this.aliveValue.textContent = Math.max(0, Number(state.alive_count || 0));

        if (self) {
            if (this.lengthValue) this.lengthValue.textContent = Math.max(0, Number(self.length || 0));
            if (this.scoreValue) this.scoreValue.textContent = Math.max(0, Number(self.score || 0));
        } else {
            if (this.lengthValue) this.lengthValue.textContent = '0';
            if (this.scoreValue) this.scoreValue.textContent = '0';
        }

        this._renderLeaderboard(state.leaderboard || [], state.self_id);

        var spectatingName = context.spectatingName || '--';
        var eliminated = !!(self && self.status === 'spectator' && state.state === 'active');

        if (this.deathOverlay) {
            this.deathOverlay.classList.toggle('active', eliminated);
        }
        if (eliminated) {
            if (this.deathText) this.deathText.textContent = 'YOU WERE ELIMINATED';
            if (this.spectatingText) this.spectatingText.textContent = 'SPECTATING: ' + spectatingName;
        }

        this._renderResults(context.results || null);
    };

    SlitherRush.UI = UI;
})(window);
