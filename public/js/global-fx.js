document.addEventListener('DOMContentLoaded', () => {

    /* Parallax effect for background */
    document.addEventListener('mousemove', (e) => {
        const bgX = (e.clientX / window.innerWidth - 0.5) * -10;
        const bgY = (e.clientY / window.innerHeight - 0.5) * -10;
        document.documentElement.style.setProperty('--bg-mouse-x', bgX);
        document.documentElement.style.setProperty('--bg-mouse-y', bgY);
    });

    /* Utilities for the UI */
    window.scrambleText = function (element, finalString) {
        if (!element) return;
        element.innerText = finalString;
    };

    window.playTacticalSound = () => {}; // Disabled for professional news tone
});
