import Lenis from 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm';

// We wait for the DOM to load to init
document.addEventListener('DOMContentLoaded', () => {
    // only initialize on the landing page, terminal page needs native scroll for nested UI elements
    const isTerminal = window.location.pathname.includes('terminal');

    if (!isTerminal) {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        console.log("🌊 Smooth Scrolling Engine: Online");
    }
});
