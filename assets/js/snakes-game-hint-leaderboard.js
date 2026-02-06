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
        
        // Check if user wants to auto-show on first visit
        try {
            var hasSeenHints = localStorage.getItem('snakes_seen_hints_section' + section);
            if (!hasSeenHints) {
                // Auto-show hints on first visit after a short delay
                setTimeout(function() {
                    expand();
                    localStorage.setItem('snakes_seen_hints_section' + section, '1');
                }, 2000);
            }
        } catch (e) {}
    }
    
    function toggle() {
        if (isExpanded) {
            collapse();
        } else {
            expand();
        }
    }
    
    function expand() {
        if (container) {
            container.classList.add('expanded');
            isExpanded = true;
            if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('click');
            }
        }
    }
    
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

        // Find current user's position
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

        // Show top 10
        var headerAdded = false;
        for (var i = 0; i < Math.min(10, leaderboardData.length); i++) {
            if (!headerAdded) {
                var headerRow = document.createElement('tr');
                headerRow.innerHTML = '<td colspan="4" class="leaderboard-section-header">🏆 Top 10 Players</td>';
                tbody.appendChild(headerRow);
                headerAdded = true;
            }
            
            var entry = leaderboardData[i];
            var tr = createLeaderboardRow(entry, i, currentUserId);
            tbody.appendChild(tr);
        }

        // If user is not in top 10, show divider and their position
        if (currentUserIndex >= 10) {
            // Add divider
            var dividerRow = document.createElement('tr');
            dividerRow.innerHTML = '<td colspan="4"><div class="leaderboard-divider"></div></td>';
            tbody.appendChild(dividerRow);

            // Add "Your Position" header
            var yourPosHeader = document.createElement('tr');
            yourPosHeader.innerHTML = '<td colspan="4" class="leaderboard-section-header">📍 Your Position</td>';
            tbody.appendChild(yourPosHeader);

            // Show user's row
            var userEntry = leaderboardData[currentUserIndex];
            var userRow = createLeaderboardRow(userEntry, currentUserIndex, currentUserId);
            tbody.appendChild(userRow);

            // Optionally show a few players around the user
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

function createLeaderboardRow(entry, index, currentUserId) {
    var tr = document.createElement('tr');
    var isCurrentUser = (entry.user_id === currentUserId);
    
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

    tr.innerHTML =
        '<td class="rank-col">' + rankBadge + '</td>' +
        '<td class="player-col">' + characterIcon + ' ' + playerName + '</td>' +
        '<td class="bullets-col">' + (entry.total_bullets || 0) + '</td>' +
        '<td class="time-col">' + formatTime(entry.time_played || 0) + '</td>';

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
