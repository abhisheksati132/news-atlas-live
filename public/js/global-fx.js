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
        trackers.forEach((el) => {
            if (el.dataset.glowPointerBound === 'true') return;
            if (!el.classList.contains('glass-glow-track')) el.classList.add('glass-glow-track');
            el.dataset.glowPointerBound = 'true';
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


    let audioCtx = null;


    const playTacticalHover = () => {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                // Start ambient Terminal Hum
                const hum = audioCtx.createOscillator();
                const humGain = audioCtx.createGain();
                hum.type = 'sine';
                hum.frequency.setValueAtTime(45, audioCtx.currentTime); 
                humGain.gain.setValueAtTime(0.003, audioCtx.currentTime);
                hum.connect(humGain);
                humGain.connect(audioCtx.destination);
                hum.start();
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

    // Boot Sequence Logic
    const initBoot = async () => {
        const sequence = [
            { msg: "Loading System Kernel...", wait: 400, percent: 15, status: "KERNEL LOADED" },
            { msg: "Initializing Neural Map Network...", wait: 600, percent: 35, status: "MAP_NET READY" },
            { msg: "Authenticating Satellite Uplink...", wait: 800, percent: 55, status: "UPLINK_SECURE" },
            { msg: "Ingesting Global Intelligence Feed (GDELT)...", wait: 500, percent: 75, status: "INGESTION_START" },
            { msg: "Calibrating Economic Analysis Engine...", wait: 400, percent: 90, status: "CALIBRATION_OK" },
            { msg: "Terminal Online.", wait: 300, percent: 100, status: "READY" }
        ];

        const logEl = document.getElementById('boot-log');
        const progressEl = document.getElementById('boot-progress');
        const statusEl = document.getElementById('boot-status');
        const percentEl = document.getElementById('boot-percent');
        const bootOverlay = document.getElementById('boot-sequence');

        if (!logEl) return;

        for (const step of sequence) {
            const row = document.createElement('div');
            row.innerHTML = `<span class="text-blue-400">[ OK ]</span> ${step.msg}`;
            logEl.appendChild(row);
            logEl.scrollTop = logEl.scrollHeight;

            progressEl.style.width = step.percent + '%';
            percentEl.innerText = step.percent + '%';
            statusEl.innerText = step.status;

            // Play sound for each step
            try {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(400 + (step.percent * 2), audioCtx.currentTime);
                g.gain.setValueAtTime(0.01, audioCtx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
                osc.connect(g);
                g.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.1);
            } catch(e) {}

            await new Promise(r => setTimeout(r, step.wait));
        }

        // Complete sequence
        setTimeout(() => {
            bootOverlay.style.opacity = '0';
            bootOverlay.style.transition = 'opacity 0.8s ease-in-out';
            setTimeout(() => bootOverlay.remove(), 800);
            if (window.playTacticalSound) window.playTacticalSound("success");
        }, 500);
    };

    if (document.getElementById('boot-sequence')) {
        setTimeout(initBoot, 300);
    }
});
