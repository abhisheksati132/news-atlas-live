document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('mousemove', (e) => {
        const bgX = (e.clientX / window.innerWidth - 0.5) * -20;
        const bgY = (e.clientY / window.innerHeight - 0.5) * -20;
        document.documentElement.style.setProperty('--bg-mouse-x', bgX);
        document.documentElement.style.setProperty('--bg-mouse-y', bgY);
    });

    const interactiveSelectors = 'a, button, input, .nav-tab, .map-box, .glass-glow-track, .shortcut-item, [onclick]';

    const glowSyncObserver = new MutationObserver(() => applyGlowTracking());
    glowSyncObserver.observe(document.body, { childList: true, subtree: true });

    const applyGlowTracking = () => {
        const trackers = document.querySelectorAll('.glass-glow-track, .apple-glass, .glass-panel, div.rounded-2xl, div.rounded-3xl, footer, nav [class*="glass"]');
        trackers.forEach(el => {

            if (!el.classList.contains('glass-glow-track')) el.classList.add('glass-glow-track');

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                el.style.setProperty('--mouse-x', x + 'px');
                el.style.setProperty('--mouse-y', y + 'px');
            });
        });
    };
    applyGlowTracking();

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    window.scrambleText = function (element, finalString, duration = 1000) {
        if (!element) return;

        let iterations = 0;
        const interval = setInterval(() => {
            element.innerText = finalString.split('')
                .map((letter, index) => {
                    if (index < iterations) return finalString[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iterations >= finalString.length) clearInterval(interval);
            iterations += 1 / (duration / 500);
        }, 30);
    };

    const decryptElements = document.querySelectorAll('.decrypt-text');

    const decryptObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.dataset.scrambled) {
                    const finalStr = el.dataset.final || el.innerText;
                    if (!el.dataset.final) el.dataset.final = finalStr;
                    window.scrambleText(el, finalStr, 800);
                    el.dataset.scrambled = "true";
                }
            }
        });
    }, { threshold: 0.1 });

    decryptElements.forEach(el => decryptObserver.observe(el));

    const initTicker = () => {
        const tickerContainer = document.getElementById('footer-ticker-content');
        if (!tickerContainer) return;

        const baseItems = [
            { type: 'SYSTEM', text: 'MAP ENGINE CALIBRATED v3.7.1' },
            { type: 'STACK', text: 'NODE.JS | EXPRESS | FIREBASE | VERCEL EDGE' },
            { type: 'UI', text: 'TAILWIND CSS | VANILLA JS | WEBAUDIO' },
            { type: 'DATA', text: 'APINEWSDATA | GDET | WORLD BANK API' },
            { type: 'NET', text: 'UPLINK STABLE (14ms)' },
            { type: 'WARN', text: 'INTERCEPTING ENCRYPTED TRAFFIC...' },
            { type: 'INFO', text: 'GLOBAL MARKETS: MIXED' },
            { type: 'GEO', text: 'TRACKING 195 SOVEREIGN STATES' }
        ];

        const renderTicker = () => {

            const itemsHtml = [...baseItems, ...baseItems].map(item => {
                let color = 'text-slate-500';
                if (item.type === 'SYSTEM' || item.type === 'NET') color = 'text-blue-400';
                if (item.type === 'WARN') color = 'text-amber-400 animate-pulse';
                if (item.type === 'GEO') color = 'text-emerald-400';

                return `<span class="font-black ${color} uppercase mx-8" 
                 style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .25em;">
                 ${item.type}: ${item.text}</span>`;
            }).join('');
            tickerContainer.innerHTML = itemsHtml;
        };
        renderTicker();
    };
    initTicker();

    let audioCtx = null;

    const playTacticalHover = () => {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) { return; }
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.005, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
    };

    document.querySelectorAll(interactiveSelectors).forEach(el => {
        el.addEventListener('mouseenter', playTacticalHover);
    });

    if (!document.getElementById('cmd-palette-overlay')) {
        const cmdPaletteHtml = `
        <div id="cmd-palette-container" class="fixed inset-0 z-[10001] hidden flex flex-col items-center pt-[15vh]">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onclick="toggleCmdPalette(false)"></div>
          <div class="relative w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden glass-glow-track transform transition-all scale-95 opacity-0" id="cmd-palette-modal">
            <div class="p-4 flex items-center gap-3 border-b border-white/5">
              <i class="fas fa-terminal text-cyan-400"></i>
              <input type="text" id="cmd-palette-input" class="w-full bg-transparent border-none outline-none text-white font-mono text-lg placeholder-slate-500" placeholder="Search Intel, Queries, or Actions..." autocomplete="off">
              <div class="text-[10px] text-slate-500 font-mono tracking-widest border border-white/10 px-2 py-0.5 rounded bg-white/5">ESC</div>
            </div>
            <div class="p-2" id="cmd-palette-results">
                <div class="px-4 py-3 text-xs font-mono text-slate-500 uppercase tracking-widest">Suggested Actions</div>
                <a href="terminal" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                    <i class="fas fa-map text-blue-400 group-hover:scale-110 transition-transform"></i>
                    <span class="text-slate-300 font-mono text-sm">Launch Terminal App</span>
                </a>
                <div class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group" onclick="if(window.toggleAbout) { toggleAbout(true); toggleCmdPalette(false); } else { window.location.href='terminal' }">
                    <i class="fas fa-microchip text-emerald-400 group-hover:scale-110 transition-transform"></i>
                    <span class="text-slate-300 font-mono text-sm">View System Telemetry</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group" onclick="if(document.getElementById('cli-input')) { document.getElementById('cli-input').focus(); toggleCmdPalette(false); } else { window.location.href='terminal' }">
                    <i class="fas fa-terminal text-cyan-400 group-hover:scale-110 transition-transform"></i>
                    <span class="text-slate-300 font-mono text-sm">Execute AI Action Query</span>
                </div>
            </div>
          </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cmdPaletteHtml);

        window.toggleCmdPalette = (show) => {
            const container = document.getElementById('cmd-palette-container');
            const modal = document.getElementById('cmd-palette-modal');
            const input = document.getElementById('cmd-palette-input');
            if (show) {
                container.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('scale-95', 'opacity-0');
                    modal.classList.add('scale-100', 'opacity-100');
                    input.focus();
                }, 10);
            } else {
                modal.classList.remove('scale-100', 'opacity-100');
                modal.classList.add('scale-95', 'opacity-0');
                setTimeout(() => container.classList.add('hidden'), 200);
            }
        }

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                window.toggleCmdPalette(true);
            }
            if (e.key === 'Escape') {
                window.toggleCmdPalette(false);
            }
        });
    }
});
