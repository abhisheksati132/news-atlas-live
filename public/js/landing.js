const phrases = [
    "Aggregating 4,700+ global intelligence feeds...",
    "Cross-referencing market signals with geopolitical events...",
    "AI briefing ready: 14 active incidents detected.",
    "All systems nominal. Uplink established.",
];
let pIdx = 0,
    cIdx = 0,
    deleting = false;
const typedEl = document.getElementById("typed-text");

function type() {
    const phrase = phrases[pIdx];
    if (!deleting) {
        typedEl.textContent = phrase.slice(0, ++cIdx);
        if (cIdx === phrase.length) {
            deleting = true;
            setTimeout(type, 2200);
            return;
        }
    } else {
        typedEl.textContent = phrase.slice(0, --cIdx);
        if (cIdx === 0) {
            deleting = false;
            pIdx = (pIdx + 1) % phrases.length;
        }
    }
    setTimeout(type, deleting ? 28 : 55);
}
type();

const cmds = [
    "query --region EU --threat-level HIGH",
    "fetch-market --exchange NYSE,NASDAQ --interval 1m",
    "run-intel-brief --model gpt4o --depth EXECUTIVE",
    "plot-globe --layer GEOINT --zoom 3",
];
let ci = 0,
    cc = 0,
    cd = false;
const cmdEl = document.getElementById("cmd-text");

function typeCmd() {
    const cmd = cmds[ci];
    if (!cd) {
        cmdEl.textContent = cmd.slice(0, ++cc);
        if (cc === cmd.length) {
            cd = true;
            setTimeout(typeCmd, 1800);
            return;
        }
    } else {
        cmdEl.textContent = cmd.slice(0, --cc);
        if (cc === 0) {
            cd = false;
            ci = (ci + 1) % cmds.length;
        }
    }
    setTimeout(typeCmd, cd ? 30 : 65);
}
setTimeout(typeCmd, 2000);

function updateClock() {
    const el = document.getElementById("hero-time");
    if (!el) return;
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, "0");
    const mm = String(now.getUTCMinutes()).padStart(2, "0");
    const ss = String(now.getUTCSeconds()).padStart(2, "0");
    el.textContent = `UTC: ${hh}:${mm}:${ss}`;
}
updateClock();
setInterval(updateClock, 1000);

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(0)";
                observer.unobserve(e.target);
            }
        });
    },
    { threshold: 0.1 },
);

document.querySelectorAll(".feat-card, .glass").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {


    const viewBriefingBtn = document.getElementById('view-briefing-btn');
    if (viewBriefingBtn) {
        viewBriefingBtn.addEventListener('click', () => {
            const target = document.getElementById('ai-briefing');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a temporary glow effect to highlight the section
                target.classList.add('box-glow-cyan');
                setTimeout(() => target.classList.remove('box-glow-cyan'), 2000);
            }
        });
    }
});
