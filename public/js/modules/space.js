const BODIES = [
  {
    name: "sun",
    size: 64,
    left: "6%",
    top: "14%",
    glow: "radial-gradient(circle at 38% 38%, #fff7e0 0%, #ffd76a 32%, #f59e0b 58%, rgba(245, 158, 11, 0) 72%)",
    opacity: 0.85,
    drift: "space-drift-a",
    duration: "140s"
  },
  {
    name: "saturn",
    size: 34,
    left: "30%",
    top: "8%",
    glow: "radial-gradient(circle at 36% 36%, #e8d9b8 0%, #c9a86a 55%, #8a6f42 100%)",
    ring: true,
    opacity: 0.7,
    drift: "space-drift-b",
    duration: "180s"
  },
  {
    name: "mars",
    size: 20,
    left: "12%",
    top: "72%",
    glow: "radial-gradient(circle at 36% 36%, #f0a48a 0%, #d1603d 55%, #7c2d12 100%)",
    opacity: 0.7,
    drift: "space-drift-c",
    duration: "120s"
  },
  {
    name: "neptune",
    size: 16,
    left: "24%",
    top: "88%",
    glow: "radial-gradient(circle at 36% 36%, #93c5fd 0%, #3b82f6 55%, #1e3a8a 100%)",
    opacity: 0.6,
    drift: "space-drift-a",
    duration: "200s"
  },
  {
    name: "mercury",
    size: 9,
    left: "42%",
    top: "22%",
    glow: "radial-gradient(circle at 36% 36%, #d6d3d1 0%, #78716c 60%, #292524 100%)",
    opacity: 0.5,
    drift: "space-drift-c",
    duration: "90s"
  }
];

let container = null;

function build() {
  container = document.createElement("div");
  container.id = "space-decor";
  container.setAttribute("aria-hidden", "true");

  for (const b of BODIES) {
    const el = document.createElement("div");
    el.className = "space-body";
    el.dataset.body = b.name;
    el.style.cssText = [
      `width:${b.size}px`,
      `height:${b.size}px`,
      `left:${b.left}`,
      `top:${b.top}`,
      `background:${b.glow}`,
      `opacity:${b.opacity}`,
      `animation-name:${b.drift}`,
      `animation-duration:${b.duration}`
    ].join(";");
    if (b.ring) {
      const ring = document.createElement("span");
      ring.className = "space-ring";
      el.appendChild(ring);
    }
    container.appendChild(el);
  }
  return container;
}

function syncVisibility() {
  if (!container) return;
  const engine = window.mapEngine;
  const isGlobe = !engine || engine.getProjection() === "globe";
  container.classList.toggle("hidden-flat", !isGlobe);
}

export function initSpaceDecor() {
  if (container) return;
  const host = document.querySelector(".main-content");
  if (!host) return;
  container = build();
  host.appendChild(container);
  syncVisibility();
  window.addEventListener("resize", syncVisibility);
}

window.initSpaceDecor = initSpaceDecor;
window.syncSpaceDecor = syncVisibility;
