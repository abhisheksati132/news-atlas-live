// Simple native smooth scrolling — no library needed.
// CSS handles it via: html { scroll-behavior: smooth; }
// This file just ensures anchor links work correctly.

document.addEventListener('DOMContentLoaded', () => {
    // Native smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
