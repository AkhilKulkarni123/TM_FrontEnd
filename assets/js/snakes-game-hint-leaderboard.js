/*
 * Snakes helper UI module for hints and enhanced leaderboard rendering.
 * Responsibility:
 * - Creates the collapsible in-game "Tips" panel based on current Snakes section.
 * - Replaces default leaderboard rendering with a richer view (Top 10 + current user context).
 * Fit in overall game:
 * - Runs alongside `snakes-game.js` and reads shared globals (`window.snakesGameSection`, `gameState`).
 * - Keeps user guidance and ranking UX separate from core board movement logic.
 */

// ============================================
// HINT BAR SYSTEM
// ============================================

var HintBar = (function() {
    var container = null;
    var isExpanded = false;
    
    var hints = {
        section1: [
            {
                type: 'primary',
                emoji: '🎲',
                title: 'How to Move',
                content: 'Click the dice or press the ROLL DICE button to move forward. In Section 1, you move one square at a time through the lessons.',
                steps: null
            },
            {
                type: 'success',
                emoji: '📘',
                title: 'Complete Lessons',
                content: 'When you land on a lesson square:',
                steps: [
                    'Play the mini-game challenge to unlock the content',
                    'Read the lesson material carefully',
                    'Answer the quiz question correctly',
                    'Earn 5 bullets for each completed lesson'
                ]
            },
            {
                type: 'warning',
                emoji: '🎯',
                title: 'Progress Requirements',
                content: 'You must complete ALL 5 lessons to unlock Section 2 (Question Gauntlet). Click on any visited lesson square to review or complete it.',
                steps: null
            },
            {
                type: 'primary',
                emoji: '💡',
                title: 'Tips & Tricks',
                content: 'Your progress is automatically saved every 10 seconds. You can see your ranking on the leaderboard and compete with other players!',
                steps: null
            }
        ],
        section2: [
            {
                type: 'primary',
                emoji: '🎲',
                title: 'Dice Rolling',
                content: 'Roll 1-6 to move across the board. Unlike Section 1, you can move multiple squares! Avoid landing on the same square twice.',
                steps: null
            },
            {
                type: 'success',
                emoji: '🪜',
                title: 'Ladders (Green)',
                content: 'Landing on a ladder square automatically moves you UP to a higher position. Use ladders to skip ahead and progress faster!',
                steps: null
            },
            {
                type: 'danger',
                emoji: '🐍',
                title: 'Snakes (Red)',
                content: 'Beware! Landing on a snake square sends you DOWN to a lower position. Try to avoid snakes and plan your moves carefully.',
                steps: null
            },
            {
                type: 'warning',
                emoji: '❓',
                title: 'Question Squares',
                content: 'Complete the mini-game, then answer the question:',
                steps: [
                    'Play the arcade challenge to unlock the question',
                    'Read the question carefully',
                    'Select the correct answer',
                    'Earn 5 bullets for each correct answer'
                ]
            },
            {
                type: 'primary',
                emoji: '🏁',
                title: 'Reach the Finish',
                content: 'Complete enough questions to reach square 55 (the finish line). Top 10 players can then access the BOSS BATTLE!',
                steps: null
            }
        ]
    };
    
    // Build and inject hint bar HTML for the currently active board section.
    function init() {
        // Create hint bar HTML
        var section = window.snakesGameSection || 1;
        var sectionHints = section === 1 ? hints.section1 : hints.section2;
        var sectionTitle = section === 1 ? 'Lesson Trail Guide' : 'Question Gauntlet Guide';
        var sectionDesc = section === 1 ? 'Complete all lessons to unlock Section 2' : 'Answer questions and reach the finish line!';
        
        var html = '<div class="hint-bar-container">' +
                      '<div class="hint-bar" id="hint-bar">' +
                          '<button class="hint-bar-toggle" id="hint-bar-toggle">' +
                              '<span class="toggle-icon">💡</span>' +
                              '<span>Tips</span>' +
                          '</button>' +
                          '<div class="hint-bar-content">' +
                              '<div class="hint-bar-header">' +
                                  '<span class="hint-bar-icon">📖</span>' +
                                  '<div class="hint-bar-title">' +
                                      '<h3>' + sectionTitle + '</h3>' +
                                      '<p>' + sectionDesc + '</p>' +
                                  '</div>' +
                              '</div>' +
                              '<div class="hints-grid">';
        
        sectionHints.forEach(function(hint) {
            html += '<div class="hint-card hint-' + hint.type + '">' +
                       '<div class="hint-card-header">' +
                           '<span class="hint-card-emoji">' + hint.emoji + '</span>' +
                           '<h4 class="hint-card-title">' + hint.title + '</h4>' +
                       '</div>' +
                       '<p class="hint-card-content">' + hint.content + '</p>';
            
            if (hint.steps) {
                html += '<ul class="hint-card-steps">';
                hint.steps.forEach(function(step) {
                    html += '<li>' + step + '</li>';
                });
                html += '</ul>';
            }
            
            html += '</div>';
        });
        
        html += '</div></div></div></div>';
        
        // Insert into page
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Get references
        container = document.getElementById('hint-bar');
        var toggleBtn = document.getElementById('hint-bar-toggle');
        
        // Add event listeners
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggle);
        }
    
    }
    
    // Toggle keeps click handler simple while delegating real state updates.
    function toggle() {
        if (isExpanded) {
            collapse();
        } else {
            expand();
        }
    }
    
    // Expand panel and play shared UI click feedback.
    function expand() {
        if (container) {
            container.classList.add('expanded');
            isExpanded = true;
            if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('click');
            }
        }
    }
    
    // Collapse panel and play shared UI click feedback.
    function collapse() {
        if (container) {
            container.classList.remove('expanded');
            isExpanded = false;
            if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('click');
            }
        }
    }
    
    return {
        init: init,
        toggle: toggle,
        expand: expand,
        collapse: collapse
    };
})();

// Initialize hint bar when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for game to start before showing hint bar
    setTimeout(function() {
        var gameContainer = document.getElementById('game-container');
        if (gameContainer && !gameContainer.classList.contains('hidden')) {
            HintBar.init();
        }
    }, 1000);
});

// Also initialize when game container becomes visible
var gameContainerObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.target.id === 'game-container' &&
            !mutation.target.classList.contains('hidden')) {
            // Only initialize once
            if (!document.getElementById('hint-bar')) {
                HintBar.init();
            }
        }
    });
});

var gameContainer = document.getElementById('game-container');
if (gameContainer) {
    gameContainerObserver.observe(gameContainer, { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
}

// Expose globally
window.HintBar = HintBar;

// ============================================
// ENHANCED LEADERBOARD SYSTEM
// ============================================

function openLeaderboardSocialProfile(entry) {
    var socialBridge = window.SnakesBoardSocial || null;
    if (socialBridge && typeof socialBridge.openProfileFromLeaderboard === 'function') {
        var openedViaBridge = !!socialBridge.openProfileFromLeaderboard(entry || {});
        if (openedViaBridge) return true;
    }

    var social = window.SnakesSocial || null;
    if (social && typeof social.openPlayerProfile === 'function') {
        var opened = social.openPlayerProfile({
            id: Number((entry && (entry.user_id || entry.id)) || 0) || null,
            user_id: Number((entry && (entry.user_id || entry.id)) || 0) || null,
            username: (entry && (entry.username || entry.name)) || 'Player',
            avatar_url: entry && (entry.avatar_url || entry.avatarUrl || null),
            character: entry && (entry.selected_character || entry.character || ''),
            total_bullets: entry && (entry.total_bullets || entry.bullets || 0),
            time_played: entry && (entry.time_played || 0)
        });
        if (opened !== false) return true;
    }

    // Fallback profile modal if social widget is not available.
    if (typeof window.showPlayerInfoPopup === 'function') {
        window.showPlayerInfoPopup({
            user_id: Number((entry && (entry.user_id || entry.id)) || 0) || null,
            username: (entry && (entry.username || entry.name)) || 'Player',
            selected_character: entry && (entry.selected_character || entry.character || ''),
            total_bullets: entry && (entry.total_bullets || entry.bullets || 0),
            time_played: entry && (entry.time_played || 0)
        });
        return true;
    }

    return false;
}

function sendLeaderboardFriendRequest(entry) {
    var socialBridge = window.SnakesBoardSocial || null;
    if (socialBridge && typeof socialBridge.sendFriendRequestFromLeaderboard === 'function') {
        var sentViaBridge = !!socialBridge.sendFriendRequestFromLeaderboard(entry || {});
        if (sentViaBridge) return true;
    }

    var social = window.SnakesSocial || null;
    if (!social || typeof social.sendFriendRequest !== 'function') return false;
    var targetUserId = Number((entry && (entry.user_id || entry.id)) || 0) || 0;
    var currentUserId = Number((typeof gameState !== 'undefined' && gameState.userId) || 0) || 0;
    if (targetUserId && currentUserId && targetUserId === currentUserId) return false;
    if (!targetUserId) return false;
    social.sendFriendRequest(targetUserId);
    return true;
}

function openLeaderboardDm(entry) {
    var socialBridge = window.SnakesBoardSocial || null;
    if (socialBridge && typeof socialBridge.openDmFromLeaderboard === 'function') {
        var openedViaBridge = !!socialBridge.openDmFromLeaderboard(entry || {});
        if (openedViaBridge) return true;
    }

    var social = window.SnakesSocial || null;
    if (!social || typeof social.openDmWithUser !== 'function') return false;
    var targetUserId = Number((entry && (entry.user_id || entry.id)) || 0) || 0;
    var currentUserId = Number((typeof gameState !== 'undefined' && gameState.userId) || 0) || 0;
    if (targetUserId && currentUserId && targetUserId === currentUserId) return false;
    if (!targetUserId) return false;
    social.openDmWithUser(targetUserId);
    return true;
}

function bindLeaderboardRowSocialActions(tr, entry, currentUserId) {
    if (!tr || !entry) return;

    var targetUserId = Number(entry.user_id || entry.id || 0) || 0;
    var isCurrentUser = !!targetUserId && !!currentUserId && targetUserId === Number(currentUserId || 0);
    if (isCurrentUser) return;

    tr.classList.add('leaderboard-player-row');
    tr.setAttribute('tabindex', '0');
    tr.setAttribute('role', 'button');
    tr.setAttribute('aria-label', 'Open social profile for ' + (entry.username || 'player'));

    tr.addEventListener('click', function (event) {
        var target = event.target || null;
        var actionBtn = target && typeof target.closest === 'function'
            ? target.closest('[data-lb-action]')
            : null;

        if (actionBtn) {
            if (actionBtn.disabled) return;
            var action = actionBtn.getAttribute('data-lb-action');
            if (action === 'profile') openLeaderboardSocialProfile(entry);
            else if (action === 'friend') {
                if (!sendLeaderboardFriendRequest(entry)) openLeaderboardSocialProfile(entry);
            }
            else if (action === 'chat') {
                if (!openLeaderboardDm(entry)) openLeaderboardSocialProfile(entry);
            }
            event.stopPropagation();
            return;
        }

        openLeaderboardSocialProfile(entry);
    });

    tr.addEventListener('keydown', function (event) {
        var key = String(event.key || '').toLowerCase();
        if (key !== 'enter' && key !== ' ') return;
        var keyTarget = event.target || null;
        if (keyTarget && typeof keyTarget.closest === 'function' && keyTarget.closest('[data-lb-action]')) return;
        event.preventDefault();
        openLeaderboardSocialProfile(entry);
    });
}

// Enhanced leaderboard flow: fetch broad ranking data, then render top + personal context.
function viewLeaderboardEnhanced() {
    var modal = document.getElementById('leaderboard-modal');
    var tbody = document.querySelector('#leaderboard-table tbody');
    
    if (!tbody) {
        console.error('Leaderboard table body not found');
        return;
    }

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="4" class="leaderboard-loading">' +
                      '<div class="leaderboard-loading-spinner"></div>' +
                      '<p>Loading leaderboard...</p>' +
                      '</td></tr>';
    
    if (modal) modal.classList.remove('hidden');

    // Determine API URL
    var API_URL;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        API_URL = "http://localhost:8306/api";
    } else {
        API_URL = "https://snakes.opencodingsociety.com/api";
    }

    // Fetch full leaderboard (up to 100 players to find user's position)
    fetch(API_URL + '/snakes/leaderboard?limit=100', {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Origin': 'client'
        }
    })
    .then(function (res) { 
        if (!res.ok) throw new Error('Failed to fetch leaderboard'); 
        return res.json(); 
    })
    .then(function (data) {
        tbody.innerHTML = '';
        var leaderboardData = data.leaderboard || [];
        
        if (leaderboardData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-leaderboard">' +
                            '<div class="empty-leaderboard-icon">🏆</div>' +
                            '<h3 class="empty-leaderboard-title">No players yet!</h3>' +
                            '<p class="empty-leaderboard-text">Be the first to earn bullets!</p>' +
                            '</td></tr>';
            return;
        }

        // Find current user's position so we can show a personalized section when needed.
        var currentUserId = null;
        var currentUserIndex = -1;
        
        if (typeof gameState !== 'undefined' && gameState.userId) {
            currentUserId = gameState.userId;
        }
        
        // Find user in leaderboard
        for (var i = 0; i < leaderboardData.length; i++) {
            if (leaderboardData[i].user_id === currentUserId) {
                currentUserIndex = i;
                break;
            }
        }

        // Always show Top 10 first as the primary competitive view.
        var headerAdded = false;
        for (var i = 0; i < Math.min(10, leaderboardData.length); i++) {
            if (!headerAdded) {
                var headerRow = document.createElement('tr');
                headerRow.className = 'leaderboard-meta-row';
                headerRow.innerHTML = '<td colspan="4" class="leaderboard-section-header">🏆 Top 10 Players</td>';
                tbody.appendChild(headerRow);
                headerAdded = true;
            }
            
            var entry = leaderboardData[i];
            var tr = createLeaderboardRow(entry, i, currentUserId);
            tbody.appendChild(tr);
        }

        // If user is outside Top 10, add a focused "Your Position" block for motivation.
        if (currentUserIndex >= 10) {
            // Add divider
            var dividerRow = document.createElement('tr');
            dividerRow.className = 'leaderboard-meta-row';
            dividerRow.innerHTML = '<td colspan="4"><div class="leaderboard-divider"></div></td>';
            tbody.appendChild(dividerRow);

            // Add "Your Position" header
            var yourPosHeader = document.createElement('tr');
            yourPosHeader.className = 'leaderboard-meta-row';
            yourPosHeader.innerHTML = '<td colspan="4" class="leaderboard-section-header">📍 Your Position</td>';
            tbody.appendChild(yourPosHeader);

            // Show user's row
            var userEntry = leaderboardData[currentUserIndex];
            var userRow = createLeaderboardRow(userEntry, currentUserIndex, currentUserId);
            tbody.appendChild(userRow);

            // Add immediate neighbors for local ranking context.
            var contextBefore = Math.max(10, currentUserIndex - 1);
            var contextAfter = Math.min(leaderboardData.length - 1, currentUserIndex + 1);

            // Show one player before if available and not already shown
            if (contextBefore > 10 && contextBefore < currentUserIndex) {
                var beforeEntry = leaderboardData[contextBefore];
                var beforeRow = createLeaderboardRow(beforeEntry, contextBefore, currentUserId);
                tbody.insertBefore(beforeRow, userRow);
            }

            // Show one player after if available
            if (contextAfter > currentUserIndex && contextAfter < leaderboardData.length) {
                var afterEntry = leaderboardData[contextAfter];
                var afterRow = createLeaderboardRow(afterEntry, contextAfter, currentUserId);
                tbody.appendChild(afterRow);
            }
        }

        // New/zero-score players may be absent from API ranking; synthesize a local row for clarity.
        if (currentUserIndex === -1 && currentUserId) {
            var dividerRow2 = document.createElement('tr');
            dividerRow2.className = 'leaderboard-meta-row';
            dividerRow2.innerHTML = '<td colspan="4"><div class="leaderboard-divider"></div></td>';
            tbody.appendChild(dividerRow2);

            var yourPosHeader2 = document.createElement('tr');
            yourPosHeader2.className = 'leaderboard-meta-row';
            yourPosHeader2.innerHTML = '<td colspan="4" class="leaderboard-section-header">📍 Your Position</td>';
            tbody.appendChild(yourPosHeader2);

            // Build a synthetic entry from gameState
            var characterIcons = { knight: '🛡️', wizard: '🧙', archer: '🏹', warrior: '⚔️' };
            var userRank = leaderboardData.length + 1;
            var userName = (typeof gameState !== 'undefined' && gameState.username) ? gameState.username : 'You';
            var userChar = (typeof gameState !== 'undefined' && gameState.character) ? gameState.character : '';
            var userBullets = (typeof gameState !== 'undefined') ? (gameState.bullets || 0) : 0;
            var charIcon = characterIcons[userChar] || '🙂';

            var syntheticRow = document.createElement('tr');
            syntheticRow.className = 'current-user-row';
            syntheticRow.innerHTML =
                '<td class="rank-col"><span class="rank-badge regular">' + userRank + '</span></td>' +
                '<td class="player-col">' + charIcon + ' ' + userName + '<span class="user-position-badge">👤 YOU</span></td>' +
                '<td class="bullets-col">' + userBullets + '</td>' +
                '<td class="time-col">-</td>';
            tbody.appendChild(syntheticRow);
        }
    })
    .catch(function (err) {
        console.error('Leaderboard error:', err);
        tbody.innerHTML = '<tr><td colspan="4" class="leaderboard-error">' +
                        '<div class="leaderboard-error-icon">⚠️</div>' +
                        '<p class="leaderboard-error-text">Failed to load leaderboard</p>' +
                        '<p class="leaderboard-error-text">' + err.message + '</p>' +
                        '<button class="leaderboard-error-retry" onclick="viewLeaderboardEnhanced()">Retry</button>' +
                        '</td></tr>';
    });
}

// Shared row renderer keeps visual formatting consistent across top/user/context sections.
function createLeaderboardRow(entry, index, currentUserId) {
    var tr = document.createElement('tr');
    var targetUserId = Number(entry.user_id || entry.id || 0) || 0;
    var isCurrentUser = !!targetUserId && targetUserId === Number(currentUserId || 0);
    
    if (isCurrentUser) {
        tr.className = 'current-user-row';
    }

    var rankClass = '';
    var rankBadge = '';
    
    if (index === 0) {
        rankClass = 'gold';
        rankBadge = '<span class="rank-badge ' + rankClass + '">' + (index + 1) + '</span>';
    } else if (index === 1) {
        rankClass = 'silver';
        rankBadge = '<span class="rank-badge ' + rankClass + '">' + (index + 1) + '</span>';
    } else if (index === 2) {
        rankClass = 'bronze';
        rankBadge = '<span class="rank-badge ' + rankClass + '">' + (index + 1) + '</span>';
    } else {
        rankClass = 'regular';
        rankBadge = '<span class="rank-badge ' + rankClass + '">' + (index + 1) + '</span>';
    }

    // Get character icon
    var characterIcons = {
        knight: '🛡️',
        wizard: '🧙',
        archer: '🏹',
        warrior: '⚔️'
    };
    var characterIcon = characterIcons[entry.selected_character] || '🙂';

    var playerName = entry.username || 'Unknown';
    if (isCurrentUser) {
        playerName += '<span class="user-position-badge">👤 YOU</span>';
    }

    var hasTargetUser = targetUserId > 0;
    var socialReady = !!(window.SnakesSocial && (typeof window.SnakesSocial.isAvailable !== 'function' || window.SnakesSocial.isAvailable()));
    var actionsHtml = '';
    if (!isCurrentUser) {
        actionsHtml =
            '<span class="leaderboard-player-actions">' +
                '<button type="button" class="leaderboard-player-action profile" data-lb-action="profile">Profile</button>' +
                '<button type="button" class="leaderboard-player-action friend" data-lb-action="friend"' + (hasTargetUser && socialReady ? '' : ' disabled') + '>Friend</button>' +
                '<button type="button" class="leaderboard-player-action chat" data-lb-action="chat"' + (hasTargetUser && socialReady ? '' : ' disabled') + '>Chat</button>' +
            '</span>';
    }

    tr.innerHTML =
        '<td class="rank-col">' + rankBadge + '</td>' +
        '<td class="player-col"><div class="leaderboard-player-cell"><span class="leaderboard-player-name">' + characterIcon + ' ' + playerName + '</span>' + actionsHtml + '</div></td>' +
        '<td class="bullets-col">' + (entry.total_bullets || 0) + '</td>' +
        '<td class="time-col">' + formatTime(entry.time_played || 0) + '</td>';

    bindLeaderboardRowSocialActions(tr, entry, currentUserId);

    return tr;
}

// Helper function for time formatting (if not already defined)
if (typeof formatTime !== 'function') {
    function formatTime(totalSeconds) {
        totalSeconds = Number(totalSeconds || 0);
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
    }
}

// Override the original viewLeaderboard function
if (typeof window.viewLeaderboard !== 'undefined') {
    window.viewLeaderboard = viewLeaderboardEnhanced;
}

// Make sure the enhanced version is called
document.addEventListener('DOMContentLoaded', function() {
    var leaderboardBtn = document.getElementById('view-leaderboard-btn');
    if (leaderboardBtn) {
        // Remove any existing listeners and add new one
        var newBtn = leaderboardBtn.cloneNode(true);
        leaderboardBtn.parentNode.replaceChild(newBtn, leaderboardBtn);
        newBtn.addEventListener('click', viewLeaderboardEnhanced);
    }
});
