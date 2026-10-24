const container = document.getElementById('landing-globe-3d');

if (container) {
  const loadGlobe = () => import('./landing-3d.js');

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadGlobe, { timeout: 1200 });
  } else {
    window.setTimeout(loadGlobe, 200);
  }
}
