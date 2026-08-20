document.addEventListener('DOMContentLoaded', () => {

    const glowSelector = '.glass-glow-track, .apple-glass, .glass-panel, div.rounded-2xl, div.rounded-3xl, footer, nav [class*="glass"]';

    // 1. High Performance Delegated Mousemove Glow Tracker
    document.addEventListener('mousemove', (e) => {
        const bgX = (e.clientX / window.innerWidth - 0.5) * -20;
        const bgY = (e.clientY / window.innerHeight - 0.5) * -20;
        document.documentElement.style.setProperty('--bg-mouse-x', bgX);
        document.documentElement.style.setProperty('--bg-mouse-y', bgY);

        const target = e.target.closest(glowSelector);
        if (target) {
            if (!target.classList.contains('glass-glow-track')) {
                target.classList.add('glass-glow-track');
            }
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            target.style.setProperty('--mouse-x', x + 'px');
            target.style.setProperty('--mouse-y', y + 'px');
        }
    });

    const interactiveSelectors = 'a, button, input, .nav-tab, .map-box, .glass-glow-track, .shortcut-item, [onclick]';

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

    // 2. Audio Context state handler (optional feedback)
    const resumeAudio = () => {
        const ctx = window.getAudioContext ? window.getAudioContext() : null;
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);

    // 3. Boot Sequence Logic
    const initBoot = async () => {};
    // Boot sequence overlay removed
});
