/*
 * KOZ DOM UI renderer/controller.
 * Responsibility:
 * - References HUD/overlay elements and updates them from current match state.
 * - Renders scoreboard, lobby list, countdown, results, and killfeed.
 * - Binds button actions (play again/leave/back) to callbacks from main module.
 * Fit in overall game:
 * - `koz_main.js` creates this object and calls `render(state)` every frame.
 * - Keeps UI concerns separate from socket logic (`koz_client`) and canvas drawing (`koz_renderer`).
 */
(function (window) {
    'use strict';

    var KOZ = window.KOZ = window.KOZ || {};

    // Shared mm:ss formatter for timers in the KOZ HUD.
    function formatClock(totalSeconds) {
        var sec = Math.max(0, Math.floor(totalSeconds || 0));
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    // Cache all relevant DOM nodes once to avoid repeated queries per frame.
    function KOZUI() {
        this.stateLabel = document.getElementById('kozStateLabel');
        this.matchTimer = document.getElementById('kozMatchTimer');
        this.shrinkTimer = document.getElementById('kozShrinkTimer');

        this.hpValue = document.getElementById('kozHpValue');
        this.ammoValue = document.getElementById('kozAmmoValue');
        this.overclockValue = document.getElementById('kozOverclockValue');
        this.overclockFill = document.getElementById('kozOverclockFill');
        this.playerName = document.getElementById('kozPlayerName');

        this.scoreboardList = document.getElementById('kozScoreboardList');
        this.killfeedList = document.getElementById('kozKillfeedList');

        this.lobbyOverlay = document.getElementById('kozLobbyOverlay');
        this.lobbyText = document.getElementById('kozLobbyText');
        this.lobbyPlayerList = document.getElementById('kozLobbyPlayers');
        this.lobbyLeaveBtn = document.getElementById('kozLobbyLeaveBtn');
        this.lobbyStatusBadge = document.getElementById('kozLobbyStatusBadge');

        this.countdownOverlay = document.getElementById('kozCountdownOverlay');
        this.countdownValue = document.getElementById('kozCountdownValue');

        this.resultsOverlay = document.getElementById('kozResultsOverlay');
        this.resultsWinner = document.getElementById('kozResultsWinner');
        this.resultsList = document.getElementById('kozResultsList');

        this.outsideWarning = document.getElementById('kozOutsideWarning');

        this.playAgainBtn = document.getElementById('kozPlayAgainBtn');
        this.leaveBtn = document.getElementById('kozLeaveBtn');
        this.backBtn = document.getElementById('kozBackBtn');
        this.backResultsBtn = document.getElementById('kozBackResultsBtn');

        this.latestResults = null;
        this.killfeedIds = {};
    }

    // Attach externally provided actions to footer/control buttons.
    KOZUI.prototype.bindActions = function (handlers) {
        handlers = handlers || {};
        if (this.playAgainBtn) {
            this.playAgainBtn.addEventListener('click', function () {
                if (handlers.onPlayAgain) handlers.onPlayAgain();
            });
        }
        if (this.leaveBtn) {
            this.leaveBtn.addEventListener('click', function () {
                if (handlers.onLeave) handlers.onLeave();
            });
        }
        if (this.lobbyLeaveBtn) {
            this.lobbyLeaveBtn.addEventListener('click', function () {
                if (handlers.onLeave) handlers.onLeave();
            });
        }
        if (this.backBtn) {
            this.backBtn.addEventListener('click', function () {
                if (handlers.onBack) handlers.onBack();
            });
        }
        if (this.backResultsBtn) {
            this.backResultsBtn.addEventListener('click', function () {
                if (handlers.onBack) handlers.onBack();
            });
        }
    };

    // Deduplicated killfeed insertion (server may resend recent entries in snapshots).
    KOZUI.prototype.pushKillfeed = function (entry) {
        if (!entry || this.killfeedIds[entry.id]) return;
        this.killfeedIds[entry.id] = true;

        var row = document.createElement('div');
        row.className = 'killfeed-item';

        var killer = entry.killerName || 'Storm';
        var target = entry.targetName || 'Player';
        row.textContent = killer + ' eliminated ' + target;

        this.killfeedList.prepend(row);

        while (this.killfeedList.children.length > 6) {
            this.killfeedList.removeChild(this.killfeedList.lastChild);
        }
    };

    // Rebuild compact scoreboard panel from sorted server scoreboard data.
    KOZUI.prototype._renderScoreboard = function (state) {
        var self = this;
        this.scoreboardList.innerHTML = '';

        (state.scoreboard || []).forEach(function (entry, index) {
            var row = document.createElement('div');
            row.className = 'score-row' + (entry.sid === state.selfId ? ' self' : '');

            var top = document.createElement('div');
            top.className = 'score-top';

            var left = document.createElement('div');
            left.className = 'score-left';

            var rank = document.createElement('span');
            rank.className = 'score-rank';
            rank.textContent = '#' + (index + 1);

            var name = document.createElement('span');
            name.className = 'score-name';
            name.textContent = entry.name || 'Player';

            left.appendChild(rank);
            left.appendChild(name);

            var score = document.createElement('span');
            score.className = 'score-value';
            score.textContent = entry.score;

            top.appendChild(left);
            top.appendChild(score);

            var sub = document.createElement('div');
            sub.className = 'score-sub';
            sub.textContent = (entry.kills || 0) + 'K / ' + (entry.deaths || 0) + 'D · Core ' + (entry.coreSeconds || 0) + 's';

            row.appendChild(top);
            row.appendChild(sub);
            self.scoreboardList.appendChild(row);
        });
    };

    // Render lobby roster and waiting/ready messaging before active match begins.
    KOZUI.prototype._renderLobby = function (state) {
        var lobby = state.lobby || {};
        var activePlayers = (lobby.activePlayers || 0);
        var minPlayers = (lobby.minPlayers || 4);
        var waiting = activePlayers < minPlayers;

        this.lobbyPlayerList.innerHTML = '';
        (lobby.players || []).forEach(function (player) {
            var row = document.createElement('div');
            row.className = 'lobby-player-row' + (player.spectator ? ' spectator' : '');

            var avatar = document.createElement('div');
            avatar.className = 'lobby-avatar';
            if (player.avatar) {
                avatar.style.backgroundImage = 'url("' + player.avatar.replace(/"/g, '') + '")';
            } else {
                avatar.textContent = (player.name || 'P').slice(0, 1).toUpperCase();
            }

            var text = document.createElement('div');
            text.className = 'lobby-player-text';
            text.innerHTML = '<strong>' + (player.name || 'Player') + '</strong><span>' + (player.hero || 'hero') + (player.spectator ? ' · Spectator' : '') + '</span>';

            row.appendChild(avatar);
            row.appendChild(text);
            this.lobbyPlayerList.appendChild(row);
        }, this);

        if (waiting) {
            this.lobbyText.textContent = 'Waiting for players (' + activePlayers + ' joined, ' + minPlayers + ' minimum to start)';
            if (this.lobbyStatusBadge) {
                this.lobbyStatusBadge.textContent = 'Awaiting Squad';
                this.lobbyStatusBadge.setAttribute('data-state', 'waiting');
            }
        } else if ((state.match || {}).state === 'COUNTDOWN') {
            this.lobbyText.textContent = 'Minimum reached. Match starting soon.';
            if (this.lobbyStatusBadge) {
                this.lobbyStatusBadge.textContent = 'Launch Imminent';
                this.lobbyStatusBadge.setAttribute('data-state', 'countdown');
            }
        } else {
            this.lobbyText.textContent = 'Lobby ready. More players can still join.';
            if (this.lobbyStatusBadge) {
                this.lobbyStatusBadge.textContent = 'Combat Ready';
                this.lobbyStatusBadge.setAttribute('data-state', 'ready');
            }
        }

        var show = (state.match.state === 'LOBBY' || state.match.state === 'COUNTDOWN');
        this.lobbyOverlay.classList.toggle('active', show);
    };

    // Separate countdown overlay for final pre-match start signal.
    KOZUI.prototype._renderCountdown = function (state) {
        var show = state.match.state === 'COUNTDOWN';
        this.countdownOverlay.classList.toggle('active', show);
        if (show) {
            this.countdownValue.textContent = Math.max(0, state.match.countdown || 0);
        }
    };

    // End-of-match overlay with winner and final ranking rows.
    KOZUI.prototype._renderResults = function (state) {
        if (state.match.state !== 'RESULTS') {
            this.resultsOverlay.classList.remove('active');
            return;
        }

        this.resultsOverlay.classList.add('active');

        var payload = this.latestResults || {};
        if (payload.winner && payload.winner.name) {
            this.resultsWinner.textContent = 'Winner: ' + payload.winner.name;
        } else {
            this.resultsWinner.textContent = 'Winner: --';
        }

        this.resultsList.innerHTML = '';
        (payload.results || state.scoreboard || []).slice(0, 8).forEach(function (entry, index) {
            var row = document.createElement('div');
            row.className = 'result-row';
            row.innerHTML = '<span>#' + (index + 1) + ' ' + (entry.name || 'Player') + '</span><strong>' + (entry.score || 0) + '</strong>';
            this.resultsList.appendChild(row);
        }, this);
    };

    // Store latest explicit results payload from socket event.
    KOZUI.prototype.handleResults = function (payload) {
        this.latestResults = payload || null;
    };

    // Main UI update entry called once per frame with current render state.
    KOZUI.prototype.render = function (state) {
        this.stateLabel.textContent = state.match.state || 'LOBBY';
        this.matchTimer.textContent = formatClock(state.match.timeLeft || 0);
        this.shrinkTimer.textContent = formatClock(state.match.nextShrinkIn || 0);

        this.hpValue.textContent = Math.max(0, Math.round(state.localPlayer.hp || 0));
        this.ammoValue.textContent = Math.max(0, Math.round(state.localPlayer.ammo || 0));
        this.overclockValue.textContent = Math.round(state.localPlayer.overclockMeter || 0) + '%';
        this.overclockFill.style.width = Math.max(0, Math.min(100, state.localPlayer.overclockMeter || 0)) + '%';
        this.playerName.textContent = state.localPlayer.name || 'Player';

        this.outsideWarning.classList.toggle('active', !!state.localPlayer.outside);

        this._renderScoreboard(state);
        this._renderLobby(state);
        this._renderCountdown(state);
        this._renderResults(state);

        (state.killfeed || []).forEach(function (entry) {
            this.pushKillfeed(entry);
        }, this);
    };

    // Expose UI constructor on KOZ namespace.
    KOZ.UI = KOZUI;
})(window);
