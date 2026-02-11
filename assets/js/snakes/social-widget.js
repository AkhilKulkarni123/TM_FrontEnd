(function (window, document) {
    'use strict';

    if (window.SnakesSocial && window.SnakesSocial.__initialized) {
        return;
    }

    var HOSTNAME = window.location.hostname || '';
    var IS_LOCAL = (
        HOSTNAME === 'localhost' ||
        HOSTNAME === '127.0.0.1' ||
        HOSTNAME === '0.0.0.0' ||
        /\.local$/i.test(HOSTNAME)
    );
    var API_BASE = window.GAME_API_BASE || window.SNAKES_API_BASE || (IS_LOCAL ? (window.location.protocol + '//' + HOSTNAME + ':8306') : 'https://snakes.opencodingsociety.com');
    var API_ROOT = API_BASE + '/api';
    var SOCKET_NAMESPACE = '/social';
    var PAGE_NAME = (window.location.pathname || '').split('/').pop() || '';
    var DEFAULT_EMOJIS = ['😀', '😂', '😍', '🔥', '🎮', '👍', '👀', '😎', '😭', '🤝', '🎯', '✅', '💬', '💥', '✨', '🚀'];
    var EMOJI_ONLY_RE = /^[\s\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;

    var state = {
        ready: false,
        authenticated: false,
        bootstrapLoading: true,
        socketConnected: false,
        currentTab: 'friends',
        user: null,
        friendsState: { friends: [], pending_in: [], pending_out: [], blocked: [] },
        partyState: { party: null, incoming_invites: [] },
        conversations: [],
        messagesByConversation: {},
        activeConversationId: null,
        searchQuery: '',
        searchResults: [],
        unreadTotal: 0,
        typingByConversation: {},
        imageComposer: { file: null, preview: null, uploading: false },
        mini: { open: false, minimized: false, conversationId: null, dragX: null, dragY: null },
        activity: null,
        lastOpenedDmUserId: null,
        loadHistoryLock: {},
        drawerOpen: false,
        profileCard: { open: false, target: null }
    };

    var ui = {};
    var socket = null;
    var searchTimer = null;
    var typingTimer = null;
    var typingActive = false;

    function safeText(value) {
        return String(value == null ? '' : value);
    }

    function escapeHtml(value) {
        return safeText(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatTime(iso) {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (err) {
            return '';
        }
    }

    function formatLastSeen(iso) {
        if (!iso) return '';
        try {
            var date = new Date(iso);
            return 'Last seen ' + date.toLocaleString();
        } catch (err) {
            return '';
        }
    }

    function getConversationById(conversationId) {
        for (var i = 0; i < state.conversations.length; i += 1) {
            if (Number(state.conversations[i].id) === Number(conversationId)) return state.conversations[i];
        }
        return null;
    }

    function ensureMessagesArray(conversationId) {
        if (!state.messagesByConversation[conversationId]) {
            state.messagesByConversation[conversationId] = [];
        }
        return state.messagesByConversation[conversationId];
    }

    function computeUnreadTotal() {
        var total = 0;
        for (var i = 0; i < state.conversations.length; i += 1) {
            total += Number(state.conversations[i].unread_count || 0);
        }
        state.unreadTotal = total;
    }

    function relationForUserId(userId) {
        var targetId = Number(userId || 0);
        if (!targetId) return 'unknown';
        if (state.user && Number(state.user.id) === targetId) return 'self';

        var i = 0;
        var friends = state.friendsState.friends || [];
        for (i = 0; i < friends.length; i += 1) {
            if (Number(friends[i].id) === targetId) return 'friend';
        }
        var pendingIn = state.friendsState.pending_in || [];
        for (i = 0; i < pendingIn.length; i += 1) {
            if (Number(pendingIn[i].id) === targetId) return 'pending_in';
        }
        var pendingOut = state.friendsState.pending_out || [];
        for (i = 0; i < pendingOut.length; i += 1) {
            if (Number(pendingOut[i].id) === targetId) return 'pending_out';
        }
        var blocked = state.friendsState.blocked || [];
        for (i = 0; i < blocked.length; i += 1) {
            if (Number(blocked[i].id) === targetId) return 'blocked';
        }
        return 'none';
    }

    function normalizeProfileInput(profile) {
        profile = profile || {};
        var id = Number(profile.id || profile.user_id || profile.target_user_id || 0) || null;
        var username = String(profile.username || profile.name || profile.uid || 'Player');
        var character = String(profile.character || profile.selected_character || '').trim();
        var weaponName = String(profile.weapon_name || profile.weaponName || '').trim();
        var weaponEffect = String(profile.weapon_effect || profile.weaponEffect || '').trim();
        var square = Number(profile.current_square || profile.currentSquare || 0) || null;
        var bullets = Number(profile.total_bullets || profile.bullets || 0) || 0;
        var presence = String(profile.presence || profile.status || 'offline').trim().toLowerCase();
        var activity = profile.activity || null;
        var avatarUrl = profile.avatar_url || profile.avatarUrl || null;
        return {
            id: id,
            username: username,
            uid: profile.uid || null,
            character: character || null,
            weapon_name: weaponName || null,
            weapon_effect: weaponEffect || null,
            current_square: square,
            total_bullets: bullets,
            presence: presence || 'offline',
            activity: activity,
            last_seen: profile.last_seen || null,
            avatar_url: avatarUrl || null
        };
    }

    function closeProfileCard() {
        state.profileCard.open = false;
        state.profileCard.target = null;
        renderProfileCard();
    }

    function renderProfileCard() {
        if (!ui.profileModal || !ui.profileBody) return;
        if (!state.profileCard.open || !state.profileCard.target) {
            ui.profileModal.classList.remove('open');
            ui.profileBody.innerHTML = '';
            return;
        }
        var target = state.profileCard.target;
        var relation = relationForUserId(target.id);
        var subtitleParts = [];
        if (target.character) subtitleParts.push(target.character);
        if (target.weapon_name) subtitleParts.push(target.weapon_name);
        if (target.weapon_effect) subtitleParts.push(target.weapon_effect);
        var subtitle = subtitleParts.join(' • ');
        var activity = target.activity && (target.activity.label || target.activity.mode || target.activity.target);
        var presenceText = activity || (target.presence === 'offline' ? (formatLastSeen(target.last_seen) || 'Offline') : target.presence.replace('-', ' '));

        var relationLabel = 'Unknown';
        if (relation === 'self') relationLabel = 'You';
        else if (relation === 'friend') relationLabel = 'Friends';
        else if (relation === 'pending_in') relationLabel = 'Incoming request';
        else if (relation === 'pending_out') relationLabel = 'Request pending';
        else if (relation === 'blocked') relationLabel = 'Blocked';
        else if (relation === 'none') relationLabel = 'Not friends';

        var canAddFriend = relation === 'none' && !!target.id;
        var canMessage = relation === 'friend' && !!target.id;
        var canPartyInvite = !!(state.partyState.party && target.id && relation === 'friend');
        var pendingRequestId = 0;
        if (relation === 'pending_in') {
            var pendingIn = state.friendsState.pending_in || [];
            for (var p = 0; p < pendingIn.length; p += 1) {
                if (Number(pendingIn[p].id) === Number(target.id)) {
                    pendingRequestId = Number(pendingIn[p].friendship_id || 0) || 0;
                    break;
                }
            }
        }

        var html = '' +
            '<div class="ss-profile-head">' +
            '<div class="ss-avatar ss-profile-avatar">' + baseAvatar(target) + '</div>' +
            '<div class="ss-profile-copy">' +
            '<strong>' + escapeHtml(target.username) + '</strong>' +
            (subtitle ? '<div class="ss-profile-subtitle">' + escapeHtml(subtitle) + '</div>' : '') +
            '<div class="ss-profile-meta"><span class="ss-presence-dot ss-presence-' + escapeHtml(target.presence || 'offline') + '"></span>' + escapeHtml(presenceText || 'offline') + '</div>' +
            '</div>' +
            '<button class="ss-btn danger" data-action="profile-close">Close</button>' +
            '</div>' +
            '<div class="ss-profile-grid">' +
            (target.current_square ? '<div><small>Square</small><strong>' + escapeHtml(String(target.current_square)) + '</strong></div>' : '') +
            '<div><small>Bullets</small><strong>' + escapeHtml(String(target.total_bullets || 0)) + '</strong></div>' +
            '<div><small>Relation</small><strong>' + escapeHtml(relationLabel) + '</strong></div>' +
            '</div>' +
            '<div class="ss-profile-actions">' +
            (relation === 'pending_in' && pendingRequestId
                ? ('<button class="ss-btn success" data-action="accept-friend" data-request-id="' + pendingRequestId + '">Accept</button>' +
                   '<button class="ss-btn danger" data-action="decline-friend" data-request-id="' + pendingRequestId + '">Decline</button>')
                : ('<button class="ss-btn primary" data-action="profile-add-friend" data-user-id="' + Number(target.id || 0) + '"' + (canAddFriend ? '' : ' disabled') + '>Add Friend</button>')) +
            '<button class="ss-btn" data-action="profile-message" data-user-id="' + Number(target.id || 0) + '"' + (canMessage ? '' : ' disabled') + '>Message</button>' +
            '<button class="ss-btn" data-action="profile-invite-party" data-user-id="' + Number(target.id || 0) + '"' + (canPartyInvite ? '' : ' disabled') + '>Invite Party</button>' +
            '<button class="ss-btn" data-action="profile-open-social">Open Social</button>' +
            '</div>';

        ui.profileBody.innerHTML = html;
        ui.profileModal.classList.add('open');
    }

    function openProfileCard(profile) {
        var normalized = normalizeProfileInput(profile);
        if (!normalized.username) return false;
        state.profileCard.open = true;
        state.profileCard.target = normalized;
        renderProfileCard();
        return true;
    }

    function ensureStyles() {
        if (document.getElementById('ssSocialStyles')) return;
        var style = document.createElement('style');
        style.id = 'ssSocialStyles';
        style.textContent = [
            ':root{--ss-bg:#0d1320;--ss-bg-soft:#131b2b;--ss-text:#ebf2ff;--ss-muted:#a6b2cf;--ss-accent:var(--accent,#5aa0ff);--ss-success:#39d98a;--ss-warning:#ffcc66;--ss-danger:#ff6b6b;--ss-border:rgba(255,255,255,0.12);--ss-shadow:0 22px 44px rgba(0,0,0,.45);}',
            '#ssSocialToggle{position:fixed;right:24px;bottom:24px;width:58px;height:58px;border:none;border-radius:18px;background:linear-gradient(145deg,var(--ss-accent),#1f6ad6);color:#fff;font-size:22px;font-weight:700;box-shadow:var(--ss-shadow);cursor:pointer;z-index:90000;transition:transform .18s ease,box-shadow .18s ease;}',
            '#ssSocialToggle:hover{transform:translateY(-2px);box-shadow:0 28px 48px rgba(0,0,0,.5);}',
            '#ssSocialToggle:focus-visible{outline:2px solid #fff;outline-offset:2px;}',
            '#ssSocialUnread{position:absolute;top:-8px;right:-8px;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#ff3b30;color:#fff;font-size:12px;font-weight:700;display:none;align-items:center;justify-content:center;}',
            '#ssSocialDrawer{position:fixed;right:22px;bottom:92px;width:min(980px,calc(100vw - 28px));height:min(700px,calc(100vh - 120px));background:linear-gradient(180deg,rgba(11,17,28,.97),rgba(9,14,24,.98));border:1px solid var(--ss-border);border-radius:18px;box-shadow:var(--ss-shadow);display:flex;flex-direction:column;overflow:hidden;transform:translateY(18px) scale(.96);opacity:0;pointer-events:none;z-index:90000;transition:transform .22s ease,opacity .22s ease;}',
            '#ssSocialDrawer.open{transform:translateY(0) scale(1);opacity:1;pointer-events:auto;}',
            '#ssSocialHeader{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--ss-border);background:rgba(255,255,255,.02);}',
            '.ss-userline{display:flex;align-items:center;gap:10px;min-width:0;}',
            '.ss-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#2a3e63;font-weight:700;overflow:hidden;border:1px solid rgba(255,255,255,.18);}',
            '.ss-avatar img{width:100%;height:100%;object-fit:cover;}',
            '.ss-usertext{display:flex;flex-direction:column;min-width:0;}',
            '.ss-usertext strong{font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--ss-text)}',
            '.ss-usertext span{font-size:12px;color:var(--ss-muted);}',
            '#ssPresenceSelect{background:rgba(255,255,255,.06);border:1px solid var(--ss-border);color:var(--ss-text);padding:6px 10px;border-radius:10px;font-size:12px;}',
            '#ssTabs{display:flex;gap:8px;padding:10px 12px;border-bottom:1px solid var(--ss-border);}',
            '.ss-tab{border:1px solid var(--ss-border);background:rgba(255,255,255,.03);color:var(--ss-text);padding:8px 12px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;}',
            '.ss-tab.active{background:rgba(90,160,255,.18);border-color:rgba(90,160,255,.55);}',
            '.ss-panel{display:none;flex:1;min-height:0;overflow:hidden;}',
            '.ss-panel.active{display:flex;}',
            '#ssFriendsPanel{flex-direction:column;}',
            '.ss-section-scroll{overflow:auto;min-height:0;padding:12px 14px;}',
            '.ss-search-row{display:flex;gap:8px;align-items:center;margin-bottom:12px;}',
            '.ss-search-row input{flex:1;background:rgba(255,255,255,.05);border:1px solid var(--ss-border);color:var(--ss-text);padding:10px 12px;border-radius:10px;font-size:13px;}',
            '.ss-card{background:rgba(255,255,255,.03);border:1px solid var(--ss-border);border-radius:12px;padding:10px;margin-bottom:10px;}',
            '.ss-title{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--ss-muted);margin:0 0 8px;}',
            '.ss-friend-row{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;transition:background .15s ease;}',
            '.ss-friend-row:hover{background:rgba(255,255,255,.04);}',
            '.ss-presence-dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex:0 0 auto;margin-right:6px;}',
            '.ss-presence-online{background:#33d17a;}',
            '.ss-presence-in-game{background:#5aa0ff;}',
            '.ss-presence-away{background:#ffcc66;}',
            '.ss-presence-offline{background:#7686ad;}',
            '.ss-friend-meta{flex:1;min-width:0;}',
            '.ss-friend-meta strong{display:block;font-size:13px;color:var(--ss-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.ss-friend-meta small{font-size:11px;color:var(--ss-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.ss-row-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;}',
            '.ss-btn{border:1px solid var(--ss-border);background:rgba(255,255,255,.03);color:var(--ss-text);padding:6px 8px;border-radius:8px;font-size:11px;cursor:pointer;transition:all .15s ease;}',
            '.ss-btn:hover{background:rgba(255,255,255,.1);}',
            '.ss-btn.primary{background:rgba(90,160,255,.2);border-color:rgba(90,160,255,.6);}',
            '.ss-btn.success{background:rgba(57,217,138,.14);border-color:rgba(57,217,138,.55);}',
            '.ss-btn.danger{background:rgba(255,107,107,.14);border-color:rgba(255,107,107,.55);}',
            '.ss-empty{padding:14px;border:1px dashed rgba(255,255,255,.2);border-radius:10px;color:var(--ss-muted);font-size:13px;text-align:center;}',
            '.ss-skeleton{height:46px;border-radius:10px;background:linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.09),rgba(255,255,255,.04));background-size:220% 100%;animation:ssPulse 1.15s infinite;}',
            '@keyframes ssPulse{from{background-position:200% 0}to{background-position:-200% 0}}',
            '#ssPartyPanel{flex-direction:column;}',
            '.ss-party-roster{display:flex;flex-direction:column;gap:8px;}',
            '.ss-member-role{font-size:10px;padding:2px 6px;border-radius:999px;border:1px solid var(--ss-border);color:var(--ss-muted);}',
            '#ssMessagesPanel{display:grid;grid-template-columns:300px 1fr;}',
            '#ssConversationList{border-right:1px solid var(--ss-border);overflow:auto;padding:10px;}',
            '.ss-conv-item{padding:10px;border:1px solid var(--ss-border);border-radius:10px;background:rgba(255,255,255,.03);margin-bottom:8px;cursor:pointer;}',
            '.ss-conv-item.active{background:rgba(90,160,255,.16);border-color:rgba(90,160,255,.55);}',
            '.ss-conv-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;}',
            '.ss-conv-name{font-size:13px;font-weight:700;color:var(--ss-text);min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.ss-conv-preview{font-size:11px;color:var(--ss-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.ss-unread-chip{min-width:18px;height:18px;border-radius:999px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;background:#ff3b30;color:#fff;font-size:10px;font-weight:700;}',
            '#ssChatPane{display:flex;flex-direction:column;min-height:0;}',
            '#ssChatHeader{padding:10px 12px;border-bottom:1px solid var(--ss-border);display:flex;align-items:center;justify-content:space-between;gap:8px;}',
            '#ssChatBody{flex:1;overflow:auto;padding:12px;background:rgba(255,255,255,.015);} ',
            '.ss-msg-row{display:flex;margin-bottom:9px;}',
            '.ss-msg-row.self{justify-content:flex-end;}',
            '.ss-msg-bubble{max-width:74%;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid var(--ss-border);font-size:13px;color:var(--ss-text);word-break:break-word;}',
            '.ss-msg-row.self .ss-msg-bubble{background:rgba(90,160,255,.22);border-color:rgba(90,160,255,.55);}',
            '.ss-msg-bubble.emoji{font-size:30px;line-height:1.1;padding:6px 10px;}',
            '.ss-msg-time{font-size:10px;color:var(--ss-muted);margin-top:3px;}',
            '.ss-msg-image{display:block;max-width:220px;border-radius:10px;cursor:pointer;border:1px solid rgba(255,255,255,.2);}',
            '#ssTyping{padding:0 12px 8px;color:var(--ss-muted);font-size:11px;min-height:14px;}',
            '#ssComposer{padding:10px;border-top:1px solid var(--ss-border);display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,.02);} ',
            '.ss-composer-row{display:flex;gap:8px;align-items:center;}',
            '#ssMessageInput{flex:1;background:rgba(255,255,255,.05);border:1px solid var(--ss-border);color:var(--ss-text);padding:10px;border-radius:10px;font-size:13px;}',
            '#ssEmojiGrid{display:none;grid-template-columns:repeat(8,1fr);gap:6px;padding:8px;border:1px solid var(--ss-border);border-radius:10px;background:rgba(8,13,22,.95);} ',
            '#ssEmojiGrid.open{display:grid;}',
            '.ss-emoji-btn{border:none;background:rgba(255,255,255,.05);color:#fff;padding:6px;border-radius:8px;font-size:18px;cursor:pointer;}',
            '#ssImagePreviewWrap{display:none;align-items:center;gap:8px;}',
            '#ssImagePreviewWrap.open{display:flex;}',
            '#ssImagePreview{width:48px;height:48px;border-radius:8px;object-fit:cover;border:1px solid var(--ss-border);}',
            '#ssLightbox{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;z-index:91000;}',
            '#ssLightbox.open{display:flex;}',
            '#ssLightbox img{max-width:min(90vw,1100px);max-height:90vh;border-radius:12px;}',
            '#ssProfileModal{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;align-items:center;justify-content:center;z-index:90900;padding:12px;}',
            '#ssProfileModal.open{display:flex;}',
            '#ssProfileCard{width:min(560px,100%);background:linear-gradient(180deg,rgba(11,18,30,.98),rgba(8,14,24,.98));border:1px solid var(--ss-border);border-radius:16px;box-shadow:var(--ss-shadow);padding:14px;}',
            '.ss-profile-head{display:flex;align-items:center;gap:10px;}',
            '.ss-profile-avatar{width:52px;height:52px;flex:0 0 52px;}',
            '.ss-profile-copy{flex:1;min-width:0;}',
            '.ss-profile-copy strong{display:block;font-size:16px;color:var(--ss-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.ss-profile-subtitle{font-size:12px;color:var(--ss-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.ss-profile-meta{margin-top:4px;font-size:12px;color:var(--ss-muted);display:flex;align-items:center;gap:4px;}',
            '.ss-profile-grid{margin-top:12px;padding:10px;border:1px solid var(--ss-border);border-radius:10px;background:rgba(255,255,255,.02);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}',
            '.ss-profile-grid small{display:block;color:var(--ss-muted);font-size:10px;text-transform:uppercase;letter-spacing:.03em;}',
            '.ss-profile-grid strong{display:block;color:var(--ss-text);font-size:13px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.ss-profile-actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;}',
            '#ssToasts{position:fixed;right:18px;bottom:92px;display:flex;flex-direction:column;gap:8px;z-index:90500;width:min(340px,calc(100vw - 28px));}',
            '.ss-toast{background:rgba(9,14,23,.96);border:1px solid var(--ss-border);border-radius:12px;padding:10px;box-shadow:var(--ss-shadow);}',
            '.ss-toast strong{display:block;color:var(--ss-text);font-size:13px;margin-bottom:3px;}',
            '.ss-toast p{font-size:12px;color:var(--ss-muted);margin:0 0 8px;}',
            '.ss-toast-actions{display:flex;gap:6px;flex-wrap:wrap;}',
            '#ssMiniChat{position:fixed;right:96px;bottom:24px;width:min(340px,calc(100vw - 36px));height:370px;background:rgba(9,14,23,.97);border:1px solid var(--ss-border);border-radius:14px;box-shadow:var(--ss-shadow);display:none;flex-direction:column;z-index:90400;}',
            '#ssMiniChat.open{display:flex;}',
            '#ssMiniHeader{padding:8px 10px;border-bottom:1px solid var(--ss-border);cursor:move;display:flex;align-items:center;justify-content:space-between;gap:8px;}',
            '#ssMiniBody{flex:1;overflow:auto;padding:10px;}',
            '#ssMiniComposer{padding:8px;border-top:1px solid var(--ss-border);display:flex;gap:6px;}',
            '#ssMiniInput{flex:1;background:rgba(255,255,255,.05);border:1px solid var(--ss-border);color:var(--ss-text);padding:8px;border-radius:8px;font-size:12px;}',
            '#ssMiniChat.minimized{height:auto;}',
            '#ssMiniChat.minimized #ssMiniBody,#ssMiniChat.minimized #ssMiniComposer,#ssMiniChat.minimized #ssMiniTyping{display:none;}',
            '@media (max-width:920px){#ssMessagesPanel{grid-template-columns:1fr;}#ssConversationList{max-height:170px;border-right:none;border-bottom:1px solid var(--ss-border);}#ssSocialDrawer{right:10px;left:10px;width:auto;bottom:84px;height:min(740px,calc(100vh - 100px));}#ssSocialToggle{right:14px;bottom:14px;}#ssToasts{right:10px;left:10px;width:auto;bottom:84px;}#ssMiniChat{right:10px;left:10px;width:auto;}#ssProfileCard{padding:12px;} .ss-profile-grid{grid-template-columns:1fr 1fr;}}'
        ].join('');
        document.head.appendChild(style);
    }

    function ensureSocketIoLoaded() {
        return new Promise(function (resolve, reject) {
            if (typeof window.io === 'function') return resolve();
            var existing = document.getElementById('ssSocketIoScript');
            if (existing) {
                existing.addEventListener('load', function () { resolve(); });
                existing.addEventListener('error', function () { reject(new Error('socket.io failed to load')); });
                return;
            }
            var script = document.createElement('script');
            script.id = 'ssSocketIoScript';
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = function () { resolve(); };
            script.onerror = function () { reject(new Error('socket.io failed to load')); };
            document.head.appendChild(script);
        });
    }

    function baseAvatar(summary) {
        if (summary && summary.avatar_url) {
            var avatarSrc = summary.avatar_url;
            if (avatarSrc.indexOf('http://') !== 0 && avatarSrc.indexOf('https://') !== 0) {
                avatarSrc = API_BASE + avatarSrc;
            }
            return '<img src="' + escapeHtml(avatarSrc) + '" alt="">';
        }
        var source = (summary && (summary.username || summary.uid)) || '?';
        return '<span>' + escapeHtml(source.charAt(0).toUpperCase()) + '</span>';
    }

    function showToast(title, message, actions) {
        if (!ui.toasts) return;
        var id = 'ssToast_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        var box = document.createElement('div');
        box.className = 'ss-toast';
        box.id = id;
        var html = '<strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(message) + '</p><div class="ss-toast-actions"></div>';
        box.innerHTML = html;
        var actionWrap = box.querySelector('.ss-toast-actions');
        var buttonActions = actions || [];
        for (var i = 0; i < buttonActions.length; i += 1) {
            (function (action) {
                var btn = document.createElement('button');
                btn.className = 'ss-btn ' + (action.className || '');
                btn.textContent = action.label;
                btn.addEventListener('click', function () {
                    if (typeof action.onClick === 'function') action.onClick();
                    if (box.parentNode) box.parentNode.removeChild(box);
                });
                actionWrap.appendChild(btn);
            })(buttonActions[i]);
        }
        ui.toasts.appendChild(box);
        window.setTimeout(function () {
            if (box.parentNode) box.parentNode.removeChild(box);
        }, 7000);
    }

    function setDrawerOpen(open) {
        state.drawerOpen = !!open;
        if (!ui.drawer) return;
        if (state.drawerOpen) {
            ui.drawer.classList.add('open');
        } else {
            ui.drawer.classList.remove('open');
        }
    }

    function setTab(tab) {
        state.currentTab = tab;
        var tabs = ui.drawer.querySelectorAll('.ss-tab');
        for (var i = 0; i < tabs.length; i += 1) {
            tabs[i].classList.toggle('active', tabs[i].dataset.tab === tab);
        }
        var panels = ui.drawer.querySelectorAll('.ss-panel');
        for (var j = 0; j < panels.length; j += 1) {
            panels[j].classList.toggle('active', panels[j].dataset.panel === tab);
        }
        if (tab === 'messages' && state.activeConversationId) {
            markConversationRead(state.activeConversationId);
        }
    }

    function renderBadge() {
        if (!ui.badge) return;
        computeUnreadTotal();
        if (state.unreadTotal > 0) {
            ui.badge.style.display = 'inline-flex';
            ui.badge.textContent = String(Math.min(99, state.unreadTotal));
        } else {
            ui.badge.style.display = 'none';
        }
    }

    function groupedFriends() {
        var groups = {
            online: [],
            in_game: [],
            away: [],
            offline: []
        };
        var friends = state.friendsState.friends || [];
        for (var i = 0; i < friends.length; i += 1) {
            var friend = friends[i];
            var status = friend.presence || 'offline';
            if (status === 'online') groups.online.push(friend);
            else if (status === 'in-game') groups.in_game.push(friend);
            else if (status === 'away') groups.away.push(friend);
            else groups.offline.push(friend);
        }
        return groups;
    }

    function renderFriendRow(friend, includePartyInvite) {
        var status = friend.presence || 'offline';
        var activity = friend.activity && (friend.activity.label || friend.activity.mode || friend.activity.target);
        var subtitle = activity || (status === 'offline' ? formatLastSeen(friend.last_seen) : status.replace('-', ' '));
        var html = '<div class="ss-friend-row" data-friend-id="' + Number(friend.id) + '">' +
            '<div class="ss-avatar">' + baseAvatar(friend) + '</div>' +
            '<div class="ss-friend-meta">' +
            '<strong>' + escapeHtml(friend.username || friend.uid || 'Unknown') + '</strong>' +
            '<small><span class="ss-presence-dot ss-presence-' + escapeHtml(status) + '"></span>' + escapeHtml(subtitle || status) + '</small>' +
            '</div>' +
            '<div class="ss-row-actions">' +
            '<button class="ss-btn" data-action="message" data-user-id="' + Number(friend.id) + '">Message</button>';
        if (includePartyInvite) {
            html += '<button class="ss-btn primary" data-action="party-invite" data-user-id="' + Number(friend.id) + '">Invite</button>';
        }
        html += '<button class="ss-btn" data-action="remove-friend" data-user-id="' + Number(friend.id) + '">Remove</button>' +
            '<button class="ss-btn danger" data-action="block-user" data-user-id="' + Number(friend.id) + '">Block</button>' +
            '</div></div>';
        return html;
    }

    function renderFriendsTab() {
        if (!ui.friendsContent) return;
        if (state.bootstrapLoading) {
            ui.friendsContent.innerHTML = '<div class="ss-skeleton"></div><div class="ss-skeleton" style="margin-top:8px;"></div><div class="ss-skeleton" style="margin-top:8px;"></div>';
            return;
        }
        var html = '';
        html += '<div class="ss-search-row"><input id="ssFriendSearch" type="text" placeholder="Search users by username..." value="' + escapeHtml(state.searchQuery) + '"></div>';

        if (state.searchQuery.trim()) {
            html += '<div class="ss-card"><p class="ss-title">Search Results</p>';
            if (!state.searchResults.length) {
                html += '<div class="ss-empty">No users found.</div>';
            } else {
                for (var s = 0; s < state.searchResults.length; s += 1) {
                    var hit = state.searchResults[s];
                    html += '<div class="ss-friend-row">' +
                        '<div class="ss-avatar">' + baseAvatar(hit) + '</div>' +
                        '<div class="ss-friend-meta"><strong>' + escapeHtml(hit.username || hit.uid) + '</strong><small>@' + escapeHtml(hit.uid || '') + '</small></div>' +
                        '<div class="ss-row-actions">';
                    if (hit.friendship_status === 'accepted') {
                        html += '<span class="ss-member-role">Friends</span>';
                    } else if (hit.friendship_status === 'pending') {
                        html += '<span class="ss-member-role">Pending</span>';
                    } else if (hit.friendship_status === 'blocked') {
                        html += '<span class="ss-member-role">Blocked</span>';
                    } else {
                        html += '<button class="ss-btn primary" data-action="send-friend-request" data-user-id="' + Number(hit.id) + '">Add Friend</button>';
                    }
                    html += '</div></div>';
                }
            }
            html += '</div>';
        }

        var pendingIn = state.friendsState.pending_in || [];
        if (pendingIn.length) {
            html += '<div class="ss-card"><p class="ss-title">Incoming Requests</p>';
            for (var i = 0; i < pendingIn.length; i += 1) {
                var incoming = pendingIn[i];
                html += '<div class="ss-friend-row"><div class="ss-avatar">' + baseAvatar(incoming) + '</div>' +
                    '<div class="ss-friend-meta"><strong>' + escapeHtml(incoming.username) + '</strong><small>Wants to be friends</small></div>' +
                    '<div class="ss-row-actions">' +
                    '<button class="ss-btn success" data-action="accept-friend" data-request-id="' + Number(incoming.friendship_id) + '">Accept</button>' +
                    '<button class="ss-btn danger" data-action="decline-friend" data-request-id="' + Number(incoming.friendship_id) + '">Decline</button>' +
                    '</div></div>';
            }
            html += '</div>';
        }

        var pendingOut = state.friendsState.pending_out || [];
        if (pendingOut.length) {
            html += '<div class="ss-card"><p class="ss-title">Outgoing Requests</p>';
            for (var o = 0; o < pendingOut.length; o += 1) {
                var out = pendingOut[o];
                html += '<div class="ss-friend-row"><div class="ss-avatar">' + baseAvatar(out) + '</div>' +
                    '<div class="ss-friend-meta"><strong>' + escapeHtml(out.username) + '</strong><small>Pending approval</small></div></div>';
            }
            html += '</div>';
        }

        var groups = groupedFriends();
        var includePartyInvite = !!(state.partyState.party);
        var ordered = [
            { key: 'online', label: 'Online' },
            { key: 'in_game', label: 'In Game' },
            { key: 'away', label: 'Away' },
            { key: 'offline', label: 'Offline' }
        ];
        for (var g = 0; g < ordered.length; g += 1) {
            var group = ordered[g];
            var list = groups[group.key];
            if (!list.length) continue;
            html += '<div class="ss-card"><p class="ss-title">' + group.label + '</p>';
            for (var f = 0; f < list.length; f += 1) {
                html += renderFriendRow(list[f], includePartyInvite);
            }
            html += '</div>';
        }

        if (!pendingIn.length && !pendingOut.length && !(state.friendsState.friends || []).length && !state.searchQuery.trim()) {
            html += '<div class="ss-empty">No friends yet. Search and send your first friend request.</div>';
        }

        ui.friendsContent.innerHTML = html;

        var searchInput = document.getElementById('ssFriendSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function (event) {
                state.searchQuery = event.target.value || '';
                if (searchTimer) window.clearTimeout(searchTimer);
                searchTimer = window.setTimeout(function () {
                    if (!socket || !state.socketConnected) return;
                    socket.emit('friends_search', { query: state.searchQuery.trim() });
                }, 280);
            });
        }
    }

    function resolveLeaderMember() {
        var party = state.partyState.party;
        if (!party || !party.members) return null;
        for (var i = 0; i < party.members.length; i += 1) {
            if (Number(party.members[i].id) === Number(party.leader_id)) return party.members[i];
        }
        return party.members[0] || null;
    }

    function joinActivity(activity) {
        if (!activity || !activity.mode) return;
        var mode = activity.mode;
        var target = activity.target || '';
        if (mode === 'boss-battle' || mode === 'boss') {
            var url = 'boss-battle.html?join=1';
            if (target) url += '&room_id=' + encodeURIComponent(target);
            window.location.href = url;
            return;
        }
        if (mode === 'pvp') {
            var pvpUrl = 'pvp-arena.html?join=1';
            if (target) pvpUrl += '&room_id=' + encodeURIComponent(target);
            window.location.href = pvpUrl;
            return;
        }
        if (mode === 'slitherrush') {
            var party = state.partyState.party;
            if (party) {
                try { sessionStorage.setItem('snakes_party_id', String(party.id)); } catch (err) {}
            }
            var srUrl = 'slitherrush.html';
            if (party) srUrl += '?party_id=' + encodeURIComponent(String(party.id));
            window.location.href = srUrl;
            return;
        }
        if (mode === 'platformer') {
            window.location.href = 'platformer-arcade.html';
            return;
        }
        window.location.href = 'mode-selection.html';
    }

    function renderPartyTab() {
        if (!ui.partyContent) return;
        if (state.bootstrapLoading) {
            ui.partyContent.innerHTML = '<div class="ss-skeleton"></div><div class="ss-skeleton" style="margin-top:8px;"></div>';
            return;
        }
        var incomingInvites = state.partyState.incoming_invites || [];
        var party = state.partyState.party;
        var html = '';

        if (incomingInvites.length) {
            html += '<div class="ss-card"><p class="ss-title">Incoming Party Invites</p>';
            for (var i = 0; i < incomingInvites.length; i += 1) {
                var invite = incomingInvites[i];
                html += '<div class="ss-friend-row">' +
                    '<div class="ss-avatar">' + baseAvatar(invite.inviter || {}) + '</div>' +
                    '<div class="ss-friend-meta"><strong>' + escapeHtml((invite.inviter && invite.inviter.username) || 'Player') + '</strong><small>Invited you to a party</small></div>' +
                    '<div class="ss-row-actions">' +
                    '<button class="ss-btn success" data-action="accept-party-invite" data-invite-id="' + Number(invite.id) + '">Accept</button>' +
                    '<button class="ss-btn danger" data-action="decline-party-invite" data-invite-id="' + Number(invite.id) + '">Decline</button>' +
                    '</div></div>';
            }
            html += '</div>';
        }

        if (!party) {
            html += '<div class="ss-card"><div class="ss-empty">You are not in a party.</div>' +
                '<div style="display:flex;justify-content:center;margin-top:10px;"><button class="ss-btn primary" data-action="create-party">Create Party</button></div></div>';
            ui.partyContent.innerHTML = html;
            return;
        }

        var leader = resolveLeaderMember();
        var canLead = !!party.is_leader;
        html += '<div class="ss-card"><p class="ss-title">Party #' + Number(party.id) + '</p>';
        if (leader && leader.activity && leader.activity.mode && Number(leader.id) !== Number(state.user.id)) {
            html += '<div style="margin-bottom:10px;"><button class="ss-btn primary" data-action="join-leader-activity">Join Leader Arena</button></div>';
        }
        html += '<div class="ss-party-roster">';
        var members = party.members || [];
        for (var m = 0; m < members.length; m += 1) {
            var member = members[m];
            var crown = Number(member.id) === Number(party.leader_id) ? '👑 ' : '';
            var subtitle = member.activity && (member.activity.label || member.activity.mode || member.activity.target);
            if (!subtitle) subtitle = member.presence || 'offline';
            html += '<div class="ss-friend-row">' +
                '<div class="ss-avatar">' + baseAvatar(member) + '</div>' +
                '<div class="ss-friend-meta"><strong>' + escapeHtml(crown + (member.username || member.uid || 'Member')) + '</strong>' +
                '<small><span class="ss-presence-dot ss-presence-' + escapeHtml(member.presence || 'offline') + '"></span>' + escapeHtml(subtitle) + '</small></div>' +
                '<div class="ss-row-actions">';
            if (canLead && Number(member.id) !== Number(state.user.id)) {
                html += '<button class="ss-btn danger" data-action="kick-member" data-user-id="' + Number(member.id) + '">Kick</button>';
                html += '<button class="ss-btn" data-action="transfer-leader" data-user-id="' + Number(member.id) + '">Transfer</button>';
            } else if (Number(member.id) === Number(state.user.id) && canLead) {
                html += '<span class="ss-member-role">Leader</span>';
            }
            html += '</div></div>';
        }
        html += '</div>';

        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">' +
            '<button class="ss-btn primary" data-action="open-party-invite-picker">Invite Friend</button>' +
            '<button class="ss-btn" data-action="leave-party">Leave Party</button>' +
            '</div>';

        if (state.partyInvitePickerOpen) {
            html += '<div class="ss-card" style="margin-top:10px;"><p class="ss-title">Invite Friends</p>';
            var friendList = state.friendsState.friends || [];
            var memberById = {};
            for (var k = 0; k < members.length; k += 1) memberById[Number(members[k].id)] = true;
            var invitedAny = false;
            for (var f = 0; f < friendList.length; f += 1) {
                var friend = friendList[f];
                if (memberById[Number(friend.id)]) continue;
                invitedAny = true;
                html += '<div class="ss-friend-row"><div class="ss-avatar">' + baseAvatar(friend) + '</div>' +
                    '<div class="ss-friend-meta"><strong>' + escapeHtml(friend.username) + '</strong><small>' + escapeHtml(friend.presence || 'offline') + '</small></div>' +
                    '<div class="ss-row-actions"><button class="ss-btn primary" data-action="party-invite" data-user-id="' + Number(friend.id) + '">Invite</button></div></div>';
            }
            if (!invitedAny) html += '<div class="ss-empty">No eligible friends to invite.</div>';
            html += '</div>';
        }

        html += '</div>';
        ui.partyContent.innerHTML = html;
    }

    function renderConversationList() {
        if (!ui.conversationList) return;
        if (state.bootstrapLoading) {
            ui.conversationList.innerHTML = '<div class="ss-skeleton"></div><div class="ss-skeleton" style="margin-top:8px;"></div><div class="ss-skeleton" style="margin-top:8px;"></div>';
            return;
        }
        if (!state.conversations.length) {
            ui.conversationList.innerHTML = '<div class="ss-empty">No conversations yet.</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < state.conversations.length; i += 1) {
            var conv = state.conversations[i];
            var isActive = Number(conv.id) === Number(state.activeConversationId);
            var title = (conv.title && conv.title.name) || 'Conversation';
            var preview = '';
            if (conv.last_message) {
                if (conv.last_message.type === 'image') preview = '[Image]';
                else preview = conv.last_message.body_text || '';
            }
            html += '<div class="ss-conv-item ' + (isActive ? 'active' : '') + '" data-action="open-conversation" data-conversation-id="' + Number(conv.id) + '">' +
                '<div class="ss-conv-top"><div class="ss-conv-name">' + escapeHtml(title) + '</div>' +
                (conv.unread_count ? '<span class="ss-unread-chip">' + Number(conv.unread_count) + '</span>' : '') + '</div>' +
                '<div class="ss-conv-preview">' + escapeHtml(preview) + '</div></div>';
        }
        ui.conversationList.innerHTML = html;
    }

    function renderMessages(messages, forMini) {
        var output = '';
        for (var i = 0; i < messages.length; i += 1) {
            var msg = messages[i];
            var self = Number(msg.sender_id) === Number(state.user && state.user.id);
            var typeClass = '';
            if (msg.type === 'emoji' || (msg.body_text && EMOJI_ONLY_RE.test(msg.body_text) && msg.body_text.length <= 24)) {
                typeClass = ' emoji';
            }
            output += '<div class="ss-msg-row ' + (self ? 'self' : '') + '"><div class="ss-msg-bubble' + typeClass + '">';
            if (msg.type === 'image' && msg.image_url) {
                var src = API_BASE + msg.image_url;
                output += '<img class="ss-msg-image" src="' + escapeHtml(src) + '" alt="chat image" data-action="open-lightbox" data-image-src="' + escapeHtml(src) + '">';
                if (msg.body_text) output += '<div style="margin-top:6px;">' + escapeHtml(msg.body_text) + '</div>';
            } else {
                output += escapeHtml(msg.body_text || '');
            }
            if (!forMini) output += '<div class="ss-msg-time">' + escapeHtml(formatTime(msg.created_at)) + '</div>';
            output += '</div></div>';
        }
        return output || '<div class="ss-empty">No messages yet.</div>';
    }

    function renderChatPane(scrollRestore) {
        if (!ui.chatPane) return;
        var conv = getConversationById(state.activeConversationId);
        if (!conv) {
            ui.chatPane.innerHTML = '<div style="display:grid;place-items:center;height:100%;"><div class="ss-empty">Select a conversation to start chatting.</div></div>';
            return;
        }
        var messages = ensureMessagesArray(conv.id);
        var typingUsers = state.typingByConversation[conv.id] || [];
        var title = (conv.title && conv.title.name) || 'Conversation';
        var html = '' +
            '<div id="ssChatHeader"><strong>' + escapeHtml(title) + '</strong>' +
            '<div><button class="ss-btn" data-action="open-mini-chat" data-conversation-id="' + Number(conv.id) + '">Open Mini Chat</button></div></div>' +
            '<div id="ssChatBody">' + renderMessages(messages, false) + '</div>' +
            '<div id="ssTyping">' + (typingUsers.length ? escapeHtml(typingUsers.join(', ') + ' typing...') : '') + '</div>' +
            '<div id="ssComposer">' +
            '<div id="ssImagePreviewWrap" class="' + (state.imageComposer.preview ? 'open' : '') + '">' +
            '<img id="ssImagePreview" src="' + escapeHtml(state.imageComposer.preview || '') + '" alt="preview">' +
            '<button class="ss-btn danger" data-action="clear-image-preview">Remove</button>' +
            '</div>' +
            '<div id="ssEmojiGrid">' + DEFAULT_EMOJIS.map(function (emoji) {
                return '<button class="ss-emoji-btn" data-action="pick-emoji" data-emoji="' + escapeHtml(emoji) + '">' + escapeHtml(emoji) + '</button>';
            }).join('') + '</div>' +
            '<div class="ss-composer-row">' +
            '<button class="ss-btn" data-action="toggle-emoji">Emoji</button>' +
            '<button class="ss-btn" data-action="pick-image">Image</button>' +
            '<input id="ssImageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;">' +
            '<input id="ssMessageInput" type="text" placeholder="Type a message...">' +
            '<button class="ss-btn primary" data-action="send-message">Send</button>' +
            '</div></div>';
        ui.chatPane.innerHTML = html;

        var body = document.getElementById('ssChatBody');
        if (body) {
            if (scrollRestore && typeof scrollRestore.beforeHeight === 'number') {
                var nextHeight = body.scrollHeight;
                var delta = nextHeight - Number(scrollRestore.beforeHeight || 0);
                body.scrollTop = Math.max(0, Number(scrollRestore.beforeTop || 0) + delta);
            } else {
                body.scrollTop = body.scrollHeight;
            }
            body.addEventListener('scroll', function () {
                if (body.scrollTop <= 8) {
                    loadOlderMessages(conv.id);
                }
            });
        }

        var input = document.getElementById('ssMessageInput');
        if (input) {
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendComposerMessage();
                } else {
                    reportTyping(true);
                }
            });
            input.addEventListener('input', function () { reportTyping(true); });
            input.focus();
        }
    }

    function renderMiniChat() {
        if (!ui.mini) return;
        var conv = getConversationById(state.mini.conversationId);
        if (!state.mini.open || !conv) {
            ui.mini.classList.remove('open');
            return;
        }
        ui.mini.classList.add('open');
        ui.mini.classList.toggle('minimized', !!state.mini.minimized);
        var messages = ensureMessagesArray(conv.id);
        var typingUsers = state.typingByConversation[conv.id] || [];
        ui.mini.querySelector('#ssMiniTitle').textContent = (conv.title && conv.title.name) || 'Chat';
        ui.mini.querySelector('#ssMiniBody').innerHTML = renderMessages(messages, true);
        ui.mini.querySelector('#ssMiniTyping').textContent = typingUsers.length ? (typingUsers.join(', ') + ' typing...') : '';
        var body = ui.mini.querySelector('#ssMiniBody');
        if (body) body.scrollTop = body.scrollHeight;
    }

    function renderAll() {
        renderBadge();
        renderFriendsTab();
        renderPartyTab();
        renderConversationList();
        renderChatPane();
        renderMiniChat();
        renderProfileCard();
    }

    function markConversationRead(conversationId) {
        var messages = ensureMessagesArray(conversationId);
        if (!messages.length || !socket) return;
        var lastMessage = messages[messages.length - 1];
        socket.emit('chat_read', { conversation_id: Number(conversationId), last_read_message_id: Number(lastMessage.id) });
    }

    function applyChatOpen(payload) {
        if (!payload || !payload.conversation) return;
        var conversation = payload.conversation;
        var found = getConversationById(conversation.id);
        if (!found) {
            state.conversations.unshift(conversation);
        } else {
            for (var i = 0; i < state.conversations.length; i += 1) {
                if (Number(state.conversations[i].id) === Number(conversation.id)) {
                    state.conversations[i] = conversation;
                    break;
                }
            }
        }
        state.activeConversationId = conversation.id;
        state.messagesByConversation[conversation.id] = payload.messages || [];
        if (state.lastOpenedDmUserId && conversation.title && Number(conversation.title.target_user_id) === Number(state.lastOpenedDmUserId)) {
            state.mini.open = true;
            state.mini.minimized = false;
            state.mini.conversationId = conversation.id;
            state.lastOpenedDmUserId = null;
        }
        renderAll();
        markConversationRead(conversation.id);
    }

    function reportTyping(isTyping) {
        if (!socket || !state.activeConversationId) return;
        if (isTyping && !typingActive) {
            typingActive = true;
            socket.emit('chat_typing', { conversation_id: Number(state.activeConversationId), is_typing: true });
        }
        if (typingTimer) window.clearTimeout(typingTimer);
        typingTimer = window.setTimeout(function () {
            if (typingActive) {
                typingActive = false;
                socket.emit('chat_typing', { conversation_id: Number(state.activeConversationId), is_typing: false });
            }
        }, 900);
    }

    function uploadImage(file) {
        var fd = new FormData();
        fd.append('image', file);
        return fetch(API_ROOT + '/social/upload-image', {
            method: 'POST',
            credentials: 'include',
            body: fd
        }).then(function (res) {
            if (!res.ok) throw new Error('Image upload failed');
            return res.json();
        });
    }

    function clearImageComposer() {
        state.imageComposer.file = null;
        state.imageComposer.preview = null;
        state.imageComposer.uploading = false;
        renderChatPane();
    }

    function sendComposerMessage() {
        if (!socket || !state.activeConversationId) return;
        var input = document.getElementById('ssMessageInput');
        var text = input ? String(input.value || '').trim() : '';
        var imageFile = state.imageComposer.file;
        if (!text && !imageFile) return;

        if (imageFile) {
            if (state.imageComposer.uploading) return;
            state.imageComposer.uploading = true;
            uploadImage(imageFile).then(function (payload) {
                socket.emit('chat_send', {
                    conversation_id: Number(state.activeConversationId),
                    type: 'image',
                    body_text: text || null,
                    image_url: payload.image_url
                });
                if (input) input.value = '';
                clearImageComposer();
            }).catch(function (err) {
                state.imageComposer.uploading = false;
                showToast('Upload Failed', err.message || 'Unable to upload image.');
            });
            return;
        }

        var msgType = (text && EMOJI_ONLY_RE.test(text) && text.length <= 24) ? 'emoji' : 'text';
        socket.emit('chat_send', {
            conversation_id: Number(state.activeConversationId),
            type: msgType,
            body_text: text
        });
        if (input) input.value = '';
        reportTyping(false);
    }

    function loadOlderMessages(conversationId) {
        if (!socket || !conversationId || state.loadHistoryLock[conversationId]) return;
        var messages = ensureMessagesArray(conversationId);
        if (!messages.length) return;
        state.loadHistoryLock[conversationId] = true;
        socket.emit('chat_history_before', {
            conversation_id: Number(conversationId),
            before_message_id: Number(messages[0].id),
            limit: 30
        });
    }

    function openMiniChatForConversation(conversationId) {
        state.mini.open = true;
        state.mini.minimized = false;
        state.mini.conversationId = Number(conversationId);
        renderMiniChat();
        markConversationRead(conversationId);
    }

    function openDmWithFriend(userId) {
        if (!socket) return;
        state.lastOpenedDmUserId = Number(userId);
        socket.emit('chat_open_dm', { friend_user_id: Number(userId) });
        setTab('messages');
        setDrawerOpen(true);
    }

    function updateActivity(mode, target, label) {
        state.activity = {
            mode: mode || '',
            target: target || '',
            label: label || ''
        };
        if (socket && state.socketConnected) {
            socket.emit('social_activity_set', state.activity);
        }
    }

    function initPageActivity() {
        if (PAGE_NAME === 'mode-selection.html') updateActivity('arcade', '', 'Browsing Battle Arcade');
        else if (PAGE_NAME === 'boss-battle.html') updateActivity('boss-battle', '', 'In Boss Battle');
        else if (PAGE_NAME === 'pvp-arena.html') updateActivity('pvp', '', 'In PVP Arena');
        else if (PAGE_NAME === 'slitherrush.html') updateActivity('slitherrush', '', 'In SLITHERRUSH');
        else if (PAGE_NAME === 'platformer-arcade.html') updateActivity('platformer', '', 'In Platformer Arcade');
        else if (PAGE_NAME === 'game-board-part1.html' || PAGE_NAME === 'game-board-part2.html') updateActivity('snakes-board', '', 'On Game Board');
    }

    function bindGlobalActions() {
        document.body.addEventListener('click', function (event) {
            var actionEl = event.target.closest('[data-action]');
            if (!actionEl) return;
            var action = actionEl.getAttribute('data-action');
            var userId = Number(actionEl.getAttribute('data-user-id'));
            var requestId = Number(actionEl.getAttribute('data-request-id'));
            var inviteId = Number(actionEl.getAttribute('data-invite-id'));
            var conversationId = Number(actionEl.getAttribute('data-conversation-id'));

            if (action === 'send-friend-request' && socket) socket.emit('friends_request_send', { target_user_id: userId });
            else if (action === 'accept-friend' && socket) socket.emit('friends_request_accept', { request_id: requestId });
            else if (action === 'decline-friend' && socket) socket.emit('friends_request_decline', { request_id: requestId });
            else if (action === 'remove-friend' && socket) socket.emit('friends_remove', { friend_user_id: userId });
            else if (action === 'block-user' && socket) socket.emit('friends_block', { user_id: userId });
            else if (action === 'message') openDmWithFriend(userId);
            else if (action === 'create-party' && socket) socket.emit('party_create');
            else if (action === 'party-invite' && socket && state.partyState.party) socket.emit('party_invite', { party_id: Number(state.partyState.party.id), invitee_user_id: userId });
            else if (action === 'accept-party-invite' && socket) socket.emit('party_invite_accept', { invite_id: inviteId });
            else if (action === 'decline-party-invite' && socket) socket.emit('party_invite_decline', { invite_id: inviteId });
            else if (action === 'leave-party' && socket && state.partyState.party) socket.emit('party_leave', { party_id: Number(state.partyState.party.id) });
            else if (action === 'kick-member' && socket && state.partyState.party) socket.emit('party_kick', { party_id: Number(state.partyState.party.id), member_user_id: userId });
            else if (action === 'transfer-leader' && socket && state.partyState.party) socket.emit('party_transfer_leader', { party_id: Number(state.partyState.party.id), new_leader_id: userId });
            else if (action === 'open-party-invite-picker') {
                state.partyInvitePickerOpen = !state.partyInvitePickerOpen;
                renderPartyTab();
            } else if (action === 'join-leader-activity') {
                var leader = resolveLeaderMember();
                if (leader && leader.activity) joinActivity(leader.activity);
            } else if (action === 'open-conversation' && socket) {
                state.activeConversationId = conversationId;
                socket.emit('chat_open', { conversation_id: conversationId, limit: 40 });
                renderAll();
            } else if (action === 'send-message') {
                sendComposerMessage();
            } else if (action === 'toggle-emoji') {
                var grid = document.getElementById('ssEmojiGrid');
                if (grid) grid.classList.toggle('open');
            } else if (action === 'pick-emoji') {
                var input = document.getElementById('ssMessageInput');
                var emoji = actionEl.getAttribute('data-emoji') || '';
                if (input) {
                    input.value = (input.value || '') + emoji;
                    input.focus();
                    reportTyping(true);
                }
            } else if (action === 'pick-image') {
                var imageInput = document.getElementById('ssImageInput');
                if (imageInput) imageInput.click();
            } else if (action === 'clear-image-preview') {
                clearImageComposer();
            } else if (action === 'open-lightbox') {
                var src = actionEl.getAttribute('data-image-src');
                if (src && ui.lightboxImg) {
                    ui.lightboxImg.src = src;
                    ui.lightbox.classList.add('open');
                }
            } else if (action === 'profile-close') {
                closeProfileCard();
            } else if (action === 'profile-add-friend') {
                if (!socket || !userId) return;
                socket.emit('friends_request_send', { target_user_id: userId });
                showToast('Friend Request', 'Friend request sent.', []);
                renderProfileCard();
            } else if (action === 'profile-message') {
                if (!userId) return;
                openDmWithFriend(userId);
                closeProfileCard();
            } else if (action === 'profile-invite-party') {
                if (socket && state.partyState.party && userId) {
                    socket.emit('party_invite', { party_id: Number(state.partyState.party.id), invitee_user_id: userId });
                    showToast('Party Invite', 'Party invite sent.', []);
                    renderProfileCard();
                }
            } else if (action === 'profile-open-social') {
                setDrawerOpen(true);
                setTab('friends');
            } else if (action === 'open-mini-chat') {
                openMiniChatForConversation(conversationId || state.activeConversationId);
            }
        });

        document.body.addEventListener('change', function (event) {
            if (event.target && event.target.id === 'ssImageInput') {
                var file = event.target.files && event.target.files[0];
                if (!file) return;
                state.imageComposer.file = file;
                var reader = new FileReader();
                reader.onload = function () {
                    state.imageComposer.preview = reader.result;
                    renderChatPane();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function bindMiniDrag() {
        var header = ui.mini.querySelector('#ssMiniHeader');
        if (!header) return;
        var dragging = false;
        var startX = 0;
        var startY = 0;
        var baseLeft = 0;
        var baseTop = 0;

        header.addEventListener('mousedown', function (event) {
            if (event.target.closest('[data-mini-control]')) return;
            dragging = true;
            var rect = ui.mini.getBoundingClientRect();
            baseLeft = rect.left;
            baseTop = rect.top;
            startX = event.clientX;
            startY = event.clientY;
            event.preventDefault();
        });

        window.addEventListener('mousemove', function (event) {
            if (!dragging) return;
            var dx = event.clientX - startX;
            var dy = event.clientY - startY;
            var nextLeft = Math.max(8, baseLeft + dx);
            var nextTop = Math.max(8, baseTop + dy);
            ui.mini.style.left = nextLeft + 'px';
            ui.mini.style.top = nextTop + 'px';
            ui.mini.style.right = 'auto';
            ui.mini.style.bottom = 'auto';
        });

        window.addEventListener('mouseup', function () { dragging = false; });
    }

    function bindStaticUiEvents() {
        ui.toggle.addEventListener('click', function () {
            setDrawerOpen(!state.drawerOpen);
        });
        var tabButtons = ui.drawer.querySelectorAll('.ss-tab');
        for (var i = 0; i < tabButtons.length; i += 1) {
            tabButtons[i].addEventListener('click', function () { setTab(this.dataset.tab); });
        }
        ui.presenceSelect.addEventListener('change', function () {
            if (!socket) return;
            socket.emit('presence_set', { status: this.value });
        });
        ui.lightbox.addEventListener('click', function (event) {
            if (event.target === ui.lightbox) ui.lightbox.classList.remove('open');
        });
        if (ui.profileModal) {
            ui.profileModal.addEventListener('click', function (event) {
                if (event.target === ui.profileModal) closeProfileCard();
            });
        }
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                if (ui.lightbox.classList.contains('open')) ui.lightbox.classList.remove('open');
                else if (state.profileCard.open) closeProfileCard();
                else if (state.drawerOpen) setDrawerOpen(false);
            }
        });

        ui.mini.querySelector('#ssMiniClose').addEventListener('click', function () {
            state.mini.open = false;
            renderMiniChat();
        });
        ui.mini.querySelector('#ssMiniMin').addEventListener('click', function () {
            state.mini.minimized = !state.mini.minimized;
            renderMiniChat();
        });
        ui.mini.querySelector('#ssMiniSend').addEventListener('click', function () {
            var input = ui.mini.querySelector('#ssMiniInput');
            var text = String(input.value || '').trim();
            if (!text || !socket || !state.mini.conversationId) return;
            var msgType = EMOJI_ONLY_RE.test(text) && text.length <= 24 ? 'emoji' : 'text';
            socket.emit('chat_send', {
                conversation_id: Number(state.mini.conversationId),
                type: msgType,
                body_text: text
            });
            input.value = '';
        });
        ui.mini.querySelector('#ssMiniInput').addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                ui.mini.querySelector('#ssMiniSend').click();
            }
        });
        ui.mini.querySelector('#ssMiniEmoji').addEventListener('click', function () {
            var input = ui.mini.querySelector('#ssMiniInput');
            if (!input) return;
            input.value = (input.value || '') + '😀';
            input.focus();
        });
        ui.mini.querySelector('#ssMiniImage').addEventListener('click', function () {
            var picker = ui.mini.querySelector('#ssMiniImageInput');
            if (picker) picker.click();
        });
        ui.mini.querySelector('#ssMiniImageInput').addEventListener('change', function (event) {
            var file = event.target.files && event.target.files[0];
            if (!file || !socket || !state.mini.conversationId) return;
            uploadImage(file).then(function (payload) {
                socket.emit('chat_send', {
                    conversation_id: Number(state.mini.conversationId),
                    type: 'image',
                    image_url: payload.image_url
                });
            }).catch(function (err) {
                showToast('Upload Failed', err.message || 'Unable to upload image.');
            });
            event.target.value = '';
        });
        bindMiniDrag();
    }

    function buildUi() {
        ensureStyles();
        var wrapper = document.createElement('div');
        wrapper.id = 'ssSocialRoot';
        wrapper.innerHTML = '' +
            '<button id="ssSocialToggle" aria-label="Open social panel">👥<span id="ssSocialUnread">0</span></button>' +
            '<div id="ssSocialDrawer" aria-hidden="true">' +
            '<div id="ssSocialHeader">' +
            '<div class="ss-userline"><div class="ss-avatar" id="ssUserAvatar">?</div><div class="ss-usertext"><strong id="ssUserName">Social</strong><span id="ssUserStatus">Connecting...</span></div></div>' +
            '<select id="ssPresenceSelect"><option value="online">Online</option><option value="away">Away</option></select>' +
            '</div>' +
            '<div id="ssTabs">' +
            '<button class="ss-tab active" data-tab="friends">Friends</button>' +
            '<button class="ss-tab" data-tab="party">Party</button>' +
            '<button class="ss-tab" data-tab="messages">Messages</button>' +
            '</div>' +
            '<section class="ss-panel active" data-panel="friends"><div class="ss-section-scroll" id="ssFriendsContent"></div></section>' +
            '<section class="ss-panel" data-panel="party"><div class="ss-section-scroll" id="ssPartyContent"></div></section>' +
            '<section class="ss-panel" data-panel="messages" id="ssMessagesPanel"><div id="ssConversationList"></div><div id="ssChatPane"></div></section>' +
            '</div>' +
            '<div id="ssToasts"></div>' +
            '<div id="ssMiniChat"><div id="ssMiniHeader"><strong id="ssMiniTitle">Chat</strong><div><button class="ss-btn" id="ssMiniMin" data-mini-control="1">_</button> <button class="ss-btn danger" id="ssMiniClose" data-mini-control="1">X</button></div></div><div id="ssMiniBody"></div><div id="ssMiniTyping" style="padding:0 10px 6px;font-size:11px;color:var(--ss-muted);"></div><div id="ssMiniComposer"><button class="ss-btn" id="ssMiniEmoji">🙂</button><button class="ss-btn" id="ssMiniImage">Img</button><input id="ssMiniImageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;"><input id="ssMiniInput" type="text" placeholder="Message..."><button class="ss-btn primary" id="ssMiniSend">Send</button></div></div>' +
            '<div id="ssProfileModal"><div id="ssProfileCard"><div id="ssProfileBody"></div></div></div>' +
            '<div id="ssLightbox"><img alt="chat image" id="ssLightboxImg"></div>';
        document.body.appendChild(wrapper);

        ui.root = wrapper;
        ui.toggle = wrapper.querySelector('#ssSocialToggle');
        ui.badge = wrapper.querySelector('#ssSocialUnread');
        ui.drawer = wrapper.querySelector('#ssSocialDrawer');
        ui.userAvatar = wrapper.querySelector('#ssUserAvatar');
        ui.userName = wrapper.querySelector('#ssUserName');
        ui.userStatus = wrapper.querySelector('#ssUserStatus');
        ui.presenceSelect = wrapper.querySelector('#ssPresenceSelect');
        ui.friendsContent = wrapper.querySelector('#ssFriendsContent');
        ui.partyContent = wrapper.querySelector('#ssPartyContent');
        ui.conversationList = wrapper.querySelector('#ssConversationList');
        ui.chatPane = wrapper.querySelector('#ssChatPane');
        ui.toasts = wrapper.querySelector('#ssToasts');
        ui.lightbox = wrapper.querySelector('#ssLightbox');
        ui.lightboxImg = wrapper.querySelector('#ssLightboxImg');
        ui.mini = wrapper.querySelector('#ssMiniChat');
        ui.profileModal = wrapper.querySelector('#ssProfileModal');
        ui.profileBody = wrapper.querySelector('#ssProfileBody');

        bindStaticUiEvents();
        bindGlobalActions();
    }

    function refreshUserHeader() {
        if (!state.user) return;
        ui.userName.textContent = state.user.username || state.user.uid || 'User';
        ui.userStatus.textContent = state.socketConnected ? 'Connected' : 'Offline';
        ui.userAvatar.innerHTML = baseAvatar(state.user);
    }

    function connectSocialSocket() {
        return ensureSocketIoLoaded().then(function () {
            socket = window.io(API_BASE + SOCKET_NAMESPACE, {
                transports: ['websocket'],
                withCredentials: true
            });

            socket.on('connect', function () {
                state.socketConnected = true;
                refreshUserHeader();
                if (state.activity) socket.emit('social_activity_set', state.activity);
            });
            socket.on('disconnect', function () {
                state.socketConnected = false;
                refreshUserHeader();
            });

            socket.on('social_error', function (payload) {
                showToast('Social Error', (payload && payload.message) || 'An error occurred.');
            });

            socket.on('friends_state', function (payload) {
                state.friendsState = payload || { friends: [], pending_in: [], pending_out: [], blocked: [] };
                renderAll();
            });

            socket.on('friends_search', function (payload) {
                state.searchResults = (payload && payload.results) || [];
                renderFriendsTab();
            });

            socket.on('friend_request_received', function (payload) {
                var from = payload && payload.from_user;
                showToast('Friend Request', (from && from.username ? from.username : 'A player') + ' sent you a friend request.', []);
            });

            socket.on('presence_update', function (payload) {
                var userId = Number(payload && payload.user_id);
                if (state.user && Number(state.user.id) === userId && ui.presenceSelect) {
                    if (payload.status === 'away' || payload.status === 'online') {
                        ui.presenceSelect.value = payload.status;
                    }
                }
                var friends = state.friendsState.friends || [];
                for (var i = 0; i < friends.length; i += 1) {
                    if (Number(friends[i].id) === userId) {
                        friends[i].presence = payload.status;
                        friends[i].last_seen = payload.last_seen || null;
                        friends[i].activity = payload.activity || null;
                    }
                }
                if (state.partyState.party && state.partyState.party.members) {
                    for (var m = 0; m < state.partyState.party.members.length; m += 1) {
                        if (Number(state.partyState.party.members[m].id) === userId) {
                            state.partyState.party.members[m].presence = payload.status;
                            state.partyState.party.members[m].last_seen = payload.last_seen || null;
                            state.partyState.party.members[m].activity = payload.activity || null;
                        }
                    }
                }
                renderAll();
            });

            socket.on('party_state', function (payload) {
                state.partyState = payload || { party: null, incoming_invites: [] };
                state.partyInvitePickerOpen = false;
                renderAll();
            });

            socket.on('party_invite_received', function (payload) {
                var invite = payload && payload.invite;
                var summary = payload && payload.party_summary;
                var inviter = invite && summary && summary.members ? summary.members.find(function (m) { return Number(m.id) === Number(invite.inviter_id); }) : null;
                showToast(
                    'Party Invite',
                    (inviter && inviter.username ? inviter.username : 'A friend') + ' invited you to a party.',
                    [
                        {
                            label: 'Accept',
                            className: 'success',
                            onClick: function () {
                                if (socket && invite) socket.emit('party_invite_accept', { invite_id: Number(invite.id) });
                            }
                        },
                        {
                            label: 'Decline',
                            className: 'danger',
                            onClick: function () {
                                if (socket && invite) socket.emit('party_invite_decline', { invite_id: Number(invite.id) });
                            }
                        }
                    ]
                );
            });

            socket.on('chat_list', function (payload) {
                state.conversations = (payload && payload.conversations) || [];
                computeUnreadTotal();
                renderAll();
            });

            socket.on('chat_open', function (payload) {
                applyChatOpen(payload);
            });

            socket.on('chat_message', function (payload) {
                var msg = payload && payload.message;
                if (!msg) return;
                var arr = ensureMessagesArray(msg.conversation_id);
                arr.push(msg);
                var conv = getConversationById(msg.conversation_id);
                if (conv) conv.last_message = msg;

                var viewingConversation = Number(state.activeConversationId) === Number(msg.conversation_id) && state.currentTab === 'messages';
                var viewingMini = state.mini.open && !state.mini.minimized && Number(state.mini.conversationId) === Number(msg.conversation_id);
                if (viewingConversation || viewingMini) {
                    markConversationRead(msg.conversation_id);
                } else if (Number(msg.sender_id) !== Number(state.user && state.user.id)) {
                    showToast('New Message', (msg.sender && msg.sender.username ? msg.sender.username + ': ' : '') + (msg.body_text || (msg.type === 'image' ? '[Image]' : 'Message')), [
                        {
                            label: 'Reply',
                            className: 'primary',
                            onClick: function () {
                                setTab('messages');
                                setDrawerOpen(true);
                                if (socket) socket.emit('chat_open', { conversation_id: Number(msg.conversation_id), limit: 40 });
                                openMiniChatForConversation(msg.conversation_id);
                            }
                        }
                    ]);
                }
                renderAll();
            });

            socket.on('chat_typing', function (payload) {
                var convId = Number(payload && payload.conversation_id);
                var userId = Number(payload && payload.user_id);
                var isTyping = !!(payload && payload.is_typing);
                if (!convId || !userId || userId === Number(state.user && state.user.id)) return;
                var conv = getConversationById(convId);
                var name = 'Player';
                if (conv && conv.member_ids && conv.member_ids.length) {
                    var fallback = conv.title && conv.title.name;
                    name = fallback || 'Player';
                }
                var list = state.typingByConversation[convId] || [];
                if (isTyping && list.indexOf(name) === -1) list.push(name);
                if (!isTyping) list = list.filter(function (entry) { return entry !== name; });
                state.typingByConversation[convId] = list;
                renderChatPane();
                renderMiniChat();
            });

            socket.on('chat_unread', function (payload) {
                var convId = Number(payload && payload.conversation_id);
                var count = Number(payload && payload.unread_count || 0);
                var conv = getConversationById(convId);
                if (conv) conv.unread_count = count;
                computeUnreadTotal();
                renderBadge();
                renderConversationList();
            });

            socket.on('chat_history_before', function (payload) {
                var convId = Number(payload && payload.conversation_id);
                var messages = (payload && payload.messages) || [];
                if (!convId) return;
                var restore = null;
                if (Number(state.activeConversationId) === convId) {
                    var activeBody = document.getElementById('ssChatBody');
                    if (activeBody) {
                        restore = {
                            beforeHeight: activeBody.scrollHeight,
                            beforeTop: activeBody.scrollTop
                        };
                    }
                }
                var existing = ensureMessagesArray(convId);
                state.messagesByConversation[convId] = messages.concat(existing);
                state.loadHistoryLock[convId] = false;
                if (Number(state.activeConversationId) === convId) renderChatPane(restore);
            });
        });
    }

    function bootstrap() {
        return fetch(API_ROOT + '/social/bootstrap', { credentials: 'include' })
            .then(function (res) {
                if (res.status === 401) {
                    state.authenticated = false;
                    return null;
                }
                if (!res.ok) throw new Error('Unable to load social bootstrap');
                return res.json();
            })
            .then(function (payload) {
                if (!payload) {
                    state.bootstrapLoading = false;
                    return;
                }
                state.authenticated = true;
                state.user = payload.user || null;
                state.friendsState = payload.friends_state || state.friendsState;
                state.partyState = payload.party_state || state.partyState;
                state.conversations = (payload.chat_list && payload.chat_list.conversations) || [];
                if (ui.presenceSelect && payload.presence && (payload.presence.status === 'away' || payload.presence.status === 'online')) {
                    ui.presenceSelect.value = payload.presence.status;
                }
                state.bootstrapLoading = false;
                computeUnreadTotal();
                refreshUserHeader();
                renderAll();
            })
            .catch(function () {
                state.bootstrapLoading = false;
                state.authenticated = false;
            });
    }

    function maybeDisableForGuests() {
        if (state.authenticated) return false;
        if (ui.root) ui.root.style.display = 'none';
        return true;
    }

    function canUseInteractiveSocialUi() {
        if (!ui.root) return false;
        if (ui.root.style.display === 'none') return false;
        if (!state.authenticated) return false;
        return true;
    }

    function init() {
        buildUi();
        initPageActivity();
        bootstrap().then(function () {
            if (maybeDisableForGuests()) return;
            connectSocialSocket().catch(function () {
                showToast('Social Offline', 'Could not connect to social realtime services.');
            });
        });
        state.ready = true;
        window.SnakesSocial = window.SnakesSocial || {};
        window.SnakesSocial.__initialized = true;
        window.SnakesSocial.openDrawer = function (tab) {
            if (!canUseInteractiveSocialUi()) return false;
            if (tab) setTab(tab);
            setDrawerOpen(true);
            return true;
        };
        window.SnakesSocial.setActivity = function (activity) {
            activity = activity || {};
            updateActivity(activity.mode, activity.target, activity.label);
        };
        window.SnakesSocial.openMiniChatWithUser = function (userId) {
            if (!canUseInteractiveSocialUi() || !socket || !state.socketConnected) return false;
            openDmWithFriend(userId);
            return true;
        };
        window.SnakesSocial.openPlayerProfile = function (profile) {
            if (!canUseInteractiveSocialUi()) return false;
            return openProfileCard(profile || {});
        };
        window.SnakesSocial.closePlayerProfile = function () {
            closeProfileCard();
        };
        window.SnakesSocial.sendFriendRequest = function (userId) {
            if (!canUseInteractiveSocialUi() || !socket || !state.socketConnected) return false;
            var targetId = Number(userId || 0);
            if (!targetId) return false;
            socket.emit('friends_request_send', { target_user_id: targetId });
            return true;
        };
        window.SnakesSocial.openDmWithUser = function (userId) {
            if (!canUseInteractiveSocialUi() || !socket || !state.socketConnected) return false;
            var targetId = Number(userId || 0);
            if (!targetId) return false;
            openDmWithFriend(targetId);
            return true;
        };
        window.SnakesSocial.getState = function () {
            return JSON.parse(JSON.stringify({
                friendsState: state.friendsState,
                partyState: state.partyState,
                conversations: state.conversations,
                activeConversationId: state.activeConversationId
            }));
        };
        window.SnakesSocial.isAvailable = function () {
            return canUseInteractiveSocialUi() && !!socket && !!state.socketConnected;
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document);
