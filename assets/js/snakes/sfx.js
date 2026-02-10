/*
 * Snakes & Ladders SFX module.
 * Responsibility:
 * - Builds short game sound effects in code (Web Audio) instead of loading audio files.
 * - Exposes one global API (`window.SnakesSFX`) used by Snakes game screens.
 * Fit in overall game:
 * - UI and gameplay modules call `SnakesSFX.play(...)` at key moments (rolls, hits, wins, etc.).
 * - This keeps audio behavior centralized and easy to toggle on/off for all Snakes modes.
 */

/* Snakes & Ladders SFX (procedural, no external audio files) */
(function () {
    var STORAGE_KEY = 'snakes_sfx_enabled';
    var enabled = true;
    try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored === '0') enabled = false;
    } catch (e) {}

    var ctx = null;
    // Lazily create/resume the audio context to satisfy browser autoplay rules.
    function ensureCtx() {
        if (!ctx) {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            ctx = new AudioCtx();
        }
        if (ctx.state === 'suspended') {
            ctx.resume().catch(function () {});
        }
        return ctx;
    }

    // Generate a single pitched tone with a short fade-in/fade-out envelope.
    function tone(freq, duration, type, gain, startDelay) {
        var audioCtx = ensureCtx();
        if (!audioCtx) return;
        var t = audioCtx.currentTime + (startDelay || 0);
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain || 0.06, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
    }

    // Sweep from one frequency to another for "rising/falling" sound cues.
    function sweep(from, to, duration, type, gain) {
        var audioCtx = ensureCtx();
        if (!audioCtx) return;
        var t = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(from, t);
        osc.frequency.exponentialRampToValueAtTime(to, t + duration);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain || 0.07, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
    }

    // Map semantic game events to small tone/sweep patterns.
    function play(name) {
        if (!enabled) return;
        switch (name) {
            case 'click':
                tone(800, 0.06, 'triangle', 0.04);
                break;
            case 'dice':
                tone(500, 0.05, 'square', 0.05);
                tone(620, 0.05, 'square', 0.05, 0.05);
                tone(740, 0.05, 'square', 0.05, 0.1);
                break;
            case 'ladder':
                sweep(420, 900, 0.25, 'sine', 0.06);
                break;
            case 'snake':
                sweep(700, 220, 0.3, 'sawtooth', 0.05);
                break;
            case 'correct':
                tone(880, 0.08, 'sine', 0.06);
                tone(1175, 0.1, 'sine', 0.06, 0.08);
                break;
            case 'wrong':
                tone(220, 0.2, 'square', 0.05);
                break;
            case 'battle':
                tone(260, 0.12, 'sawtooth', 0.05);
                tone(520, 0.12, 'sawtooth', 0.05, 0.08);
                break;
            case 'shoot':
                // Blaster: quick down-sweep + pop
                sweep(1400, 520, 0.08, 'sawtooth', 0.04);
                tone(1800, 0.03, 'square', 0.025, 0.02);
                break;
            case 'fireball':
                // Fireball: airy burst + low crackle
                sweep(900, 260, 0.12, 'triangle', 0.045);
                tone(520, 0.08, 'sawtooth', 0.03, 0.04);
                break;
            case 'hurt':
                tone(180, 0.18, 'square', 0.05);
                tone(140, 0.16, 'square', 0.04, 0.04);
                break;
            case 'powerup':
                tone(900, 0.06, 'triangle', 0.05);
                tone(1200, 0.08, 'triangle', 0.05, 0.06);
                break;
            case 'win':
                // Grand win: bright fanfare + shimmer
                tone(523.25, 0.12, 'triangle', 0.06); // C5
                tone(659.25, 0.12, 'triangle', 0.06, 0.06); // E5
                tone(783.99, 0.12, 'triangle', 0.06, 0.12); // G5
                tone(1046.5, 0.16, 'triangle', 0.06, 0.18); // C6
                tone(1318.5, 0.18, 'sine', 0.05, 0.28); // E6
                tone(1568, 0.2, 'sine', 0.05, 0.38); // G6
                break;
            case 'lose':
                // Grand lose: heavy fall + low thud
                sweep(520, 120, 0.45, 'sawtooth', 0.05);
                tone(110, 0.25, 'square', 0.05, 0.1);
                break;
            default:
                break;
        }
    }

    // Persist global SFX preference so all Snakes pages share the same setting.
    function setEnabled(next) {
        enabled = !!next;
        try { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); } catch (e) {}
        updateToggle();
        if (enabled) play('click');
    }

    function toggle() {
        setEnabled(!enabled);
    }

    // Keep the floating toggle button label in sync with current state.
    function updateToggle() {
        var btn = document.getElementById('snakes-sfx-toggle');
        if (!btn) return;
        btn.textContent = enabled ? 'SFX: ON' : 'SFX: OFF';
        btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }

    // Inject a simple on-page SFX toggle so students can mute quickly.
    function initToggle() {
        if (document.getElementById('snakes-sfx-toggle')) return;
        var btn = document.createElement('button');
        btn.id = 'snakes-sfx-toggle';
        btn.type = 'button';
        btn.textContent = enabled ? 'SFX: ON' : 'SFX: OFF';
        btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        btn.style.cssText = [
            'position:fixed',
            'bottom:16px',
            'left:16px',
            'z-index:9999',
            'background:#111827',
            'color:#e5e7eb',
            'border:1px solid #374151',
            'padding:8px 12px',
            'border-radius:8px',
            'font-size:12px',
            'cursor:pointer',
            'opacity:0.9'
        ].join(';');
        btn.addEventListener('click', function () {
            toggle();
        });
        document.body.appendChild(btn);
    }

    // First user gesture unlocks audio in browsers that gate autoplay.
    document.addEventListener('pointerdown', function () {
        ensureCtx();
    }, { once: true });

    document.addEventListener('DOMContentLoaded', function () {
        initToggle();
    });

    // Shared global API used by Snakes game modules.
    window.SnakesSFX = {
        play: play,
        toggle: toggle,
        setEnabled: setEnabled,
        isEnabled: function () { return enabled; }
    };
})(); 
