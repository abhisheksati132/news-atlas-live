class CustomCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);

        this.dot = document.createElement('div');
        this.dot.className = 'custom-cursor-dot';
        document.body.appendChild(this.dot);

        this.mouse = { x: 0, y: 0 };
        this.pos = { x: 0, y: 0 };
        this.speed = 0.15; // smooth tracking speed

        this.init();
    }

    init() {
        // Add basic CSS dynamically so we don't have to strictly modify existing CSS files
        const style = document.createElement('style');
        style.innerHTML = `
            body {
               cursor: none !important; /* hide default cursor */
            }
            .custom-cursor {
                position: fixed;
                top: 0; left: 0;
                width: 32px; height: 32px;
                border-radius: 50%;
                border: 1px solid rgba(59, 130, 246, 0.5); /* Blue */
                pointer-events: none;
                z-index: 10000;
                transform: translate(-50%, -50%);
                transition: width 0.3s, height 0.3s, border-color 0.3s;
                mix-blend-mode: screen;
            }
            .custom-cursor-dot {
                position: fixed;
                top: 0; left: 0;
                width: 6px; height: 6px;
                background: #06b6d4; /* Cyan */
                border-radius: 50%;
                pointer-events: none;
                z-index: 10001;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
            }
            .custom-cursor.hovering {
                width: 60px;
                height: 60px;
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(16, 185, 129, 0.6); /* Emerald on hover */
                backdrop-filter: blur(2px);
            }
            .custom-cursor-dot.hovering {
                background: #10b981;
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.9);
            }
            
            /* Mapbox specific overrides so we can interact but keep custom cursor */
            .mapboxgl-canvas-container {
                cursor: none !important;
            }
        `;
        document.head.appendChild(style);

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // Dot follows instantly
            this.dot.style.left = this.mouse.x + 'px';
            this.dot.style.top = this.mouse.y + 'px';
        });

        // Hover states for links and buttons
        this.addHoverEvents();

        this.render();
    }

    addHoverEvents() {
        const attachHovers = () => {
            document.querySelectorAll('a, button, input-[type="submit"], .glass-panel, .feat-card, .country').forEach(el => {
                if (!el.dataset.cursorAttached) {
                    el.addEventListener('mouseenter', () => {
                        this.cursor.classList.add('hovering');
                        this.dot.classList.add('hovering');
                    });
                    el.addEventListener('mouseleave', () => {
                        this.cursor.classList.remove('hovering');
                        this.dot.classList.remove('hovering');
                    });
                    el.dataset.cursorAttached = 'true';
                }
            });
        };

        attachHovers();
        // Mutation observer to handle dynamically injected content (like map tooltips)
        const observer = new MutationObserver(attachHovers);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    render() {
        // Lerp for smooth ring follow
        this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
        this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

        this.cursor.style.left = this.pos.x + 'px';
        this.cursor.style.top = this.pos.y + 'px';

        requestAnimationFrame(() => this.render());
    }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    // Only init on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        new CustomCursor();
    }
});
