class ParticleNetwork {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;opacity:0.6';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.resize();
    this.init();
    this.animate();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
  }
  resize() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
  }
  init() {
    this.particles = [];
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }
  }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.vx += dx * force * 0.01;
          p.vy += dy * force * 0.01;
        }
      }
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      this.ctx.fill();
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      });
    });
    requestAnimationFrame(() => this.animate());
  }
  destroy() {
    this.canvas.remove();
  }
}
class MatrixRain {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.15';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.chars = '01ã‚¢ã‚¤ã‚¦ã‚¨ã‚ªã‚«ã‚­ã‚¯ã‚±ã‚³ã‚µã‚·ã‚¹ã‚»ã‚½ã‚¿ãƒãƒ„ãƒ†ãƒˆãƒŠãƒ‹ãƒŒãƒãƒŽãƒãƒ’ãƒ•ãƒ˜ãƒ›';
    this.fontSize = 14;
    this.resize();
    this.init();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.init();
  }
  init() {
    this.drops = Array(this.columns).fill(0).map(() => Math.random() * -100);
  }
  animate() {
    this.ctx.fillStyle = 'rgba(2, 6, 23, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#0f7';
    this.ctx.font = this.fontSize + 'px monospace';
    this.drops.forEach((y, i) => {
      const text = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      this.ctx.fillText(text, x, y * this.fontSize);
      if (y * this.fontSize > this.canvas.height && Math.random() > 0.98) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    });
    setTimeout(() => requestAnimationFrame(() => this.animate()), 50);
  }
  destroy() {
    this.canvas.remove();
  }
}
class HexGrid {
  constructor(svgId) {
    this.svg = d3.select(`#${svgId}`);
    this.group = this.svg.insert('g', ':first-child')
      .attr('class', 'hex-grid')
      .attr('opacity', 0.08);
    this.draw();
  }
  draw() {
    const width = parseInt(this.svg.style('width'));
    const height = parseInt(this.svg.style('height'));
    const hexRadius = 35;
    const hexHeight = hexRadius * 2;
    const hexWidth = Math.sqrt(3) * hexRadius;
    for (let row = 0; row < height / hexHeight + 1; row++) {
      for (let col = 0; col < width / hexWidth + 1; col++) {
        const x = col * hexWidth + (row % 2 === 0 ? 0 : hexWidth / 2);
        const y = row * hexHeight * 0.75;
        this.group.append('polygon')
          .attr('points', this.getHexPoints(x, y, hexRadius))
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 0.5)
          .attr('fill', 'none')
          .attr('class', 'hex-cell');
      }
    }
  }
  getHexPoints(cx, cy, radius) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push([
        cx + radius * Math.cos(angle),
        cy + radius * Math.sin(angle)
      ]);
    }
    return points.map(p => p.join(',')).join(' ');
  }
  destroy() {
    this.group.remove();
  }
}
class DataNodes {
  constructor(svgId, projection) {
    this.svg = d3.select(`#${svgId}`);
    this.projection = projection;
    this.group = this.svg.append('g').attr('class', 'data-nodes');
    this.cities = [
      { name: 'New York', coords: [-74.006, 40.7128] },
      { name: 'London', coords: [-0.1276, 51.5074] },
      { name: 'Tokyo', coords: [139.6917, 35.6895] },
      { name: 'Singapore', coords: [103.8198, 1.3521] },
      { name: 'Dubai', coords: [55.2708, 25.2048] },
      { name: 'Hong Kong', coords: [114.1694, 22.3193] },
      { name: 'San Francisco', coords: [-122.4194, 37.7749] },
      { name: 'Berlin', coords: [13.4050, 52.5200] },
      { name: 'Sydney', coords: [151.2093, -33.8688] },
      { name: 'Mumbai', coords: [72.8777, 19.0760] }
    ];
    this.draw();
  }
  draw() {
    const nodes = this.group.selectAll('.node')
      .data(this.cities)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => {
        const [x, y] = this.projection(d.coords);
        return `translate(${x},${y})`;
      });
    nodes.append('circle')
      .attr('class', 'pulse-ring')
      .attr('r', 0)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .call(this.pulsate);
    nodes.append('circle')
      .attr('r', 4)
      .attr('fill', '#10b981')
      .attr('filter', 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))');
    nodes.append('text')
      .attr('x', 0)
      .attr('y', -12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#10b981')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', 'bold')
      .attr('opacity', 0.7)
      .text(d => d.name);
  }
  pulsate(selection) {
    selection
      .transition()
      .duration(2000)
      .attr('r', 20)
      .attr('opacity', 0)
      .on('end', function () {
        d3.select(this)
          .attr('r', 0)
          .attr('opacity', 0.8)
          .call(function (s) {
            DataNodes.prototype.pulsate.call(this, s);
          }.bind(this));
      });
  }
  destroy() {
    this.group.remove();
  }
}
class DataFlows {
  constructor(svgId, projection) {
    this.svg = d3.select(`#${svgId}`);
    this.projection = projection;
    this.group = this.svg.append('g').attr('class', 'data-flows');
    const defs = this.svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'flow-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0);
    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 1);
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0);
  }
  showFlows(fromCoords, toCoordsList) {
    this.group.selectAll('*').remove();
    const from = this.projection(fromCoords);
    toCoordsList.forEach((toCoords, i) => {
      const to = this.projection(toCoords);
      const midX = (from[0] + to[0]) / 2;
      const midY = (from[1] + to[1]) / 2 - 100; // Arc upward
      const path = this.group.append('path')
        .attr('d', `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`)
        .attr('stroke', 'url(#flow-gradient)')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('opacity', 0)
        .attr('stroke-dasharray', '8,4');
      const length = path.node().getTotalLength();
      path
        .attr('stroke-dashoffset', length)
        .transition()
        .delay(i * 150)
        .duration(2000)
        .attr('opacity', 0.7)
        .attr('stroke-dashoffset', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 0)
        .remove();
    });
  }
  destroy() {
    this.group.remove();
  }
}
class HeatMap {
  constructor() {
    this.active = false;
    this.currentMetric = null;
    this.colorScale = null;
  }
  apply(countries, data, metric = 'gdp') {
    this.active = true;
    this.currentMetric = metric;
    const scales = {
      gdp: d3.scaleSequential(d3.interpolateViridis),
      population: d3.scaleSequential(d3.interpolatePlasma),
      temperature: d3.scaleDiverging(d3.interpolateRdBu).domain([-20, 15, 50])
    };
    this.colorScale = scales[metric] || scales.gdp;
    const values = Object.values(data).filter(v => v !== null);
    this.colorScale.domain(d3.extent(values));
    countries.transition()
      .duration(1500)
      .attr('fill', function () {
        const countryName = d3.select(this).datum().properties.name;
        const value = data[countryName];
        return value ? this.colorScale(value) : '#1e293b';
      }.bind(this));
  }
  remove(countries) {
    this.active = false;
    countries.transition()
      .duration(1000)
      .attr('fill', '#0f172a');
  }
}
function enhanceCountryStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .country {
      filter: drop-shadow(0 0 0 transparent);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .country:hover {
      filter: 
        drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))
        drop-shadow(0 0 16px rgba(59, 130, 246, 0.4))
        drop-shadow(0 0 24px rgba(59, 130, 246, 0.2));
      stroke-width: 2px !important;
      stroke: rgba(59, 130, 246, 0.9) !important;
      transform: translateY(-2px);
    }
    .country.active {
      filter: 
        drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))
        drop-shadow(0 0 24px rgba(16, 185, 129, 0.6))
        drop-shadow(0 0 36px rgba(16, 185, 129, 0.3)) !important;
      animation: pulse-glow 2s ease-in-out infinite;
    }
    @keyframes pulse-glow {
      0%, 100% { 
        filter: 
          drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))
          drop-shadow(0 0 24px rgba(16, 185, 129, 0.6));
      }
      50% { 
        filter: 
          drop-shadow(0 0 20px rgba(16, 185, 129, 1))
          drop-shadow(0 0 40px rgba(16, 185, 129, 0.8))
          drop-shadow(0 0 60px rgba(16, 185, 129, 0.4));
      }
    }
    .satellite-mode .country.active {
      filter: 
        drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))
        drop-shadow(0 0 24px rgba(16, 185, 129, 0.6))
        drop-shadow(0 0 36px rgba(16, 185, 129, 0.3)) !important;
    }
  `;
  document.head.appendChild(style);
}
class LiveStatsTicker {
  constructor() {
    this.createTicker();
    this.update();
    setInterval(() => this.update(), 5000);
  }
  createTicker() {
    const ticker = document.createElement('div');
    ticker.id = 'live-stats-ticker';
    ticker.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 32px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      overflow: hidden;
      z-index: 10;
      border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    `;
    ticker.innerHTML = `
      <div class="ticker-scroll" style="display:flex;gap:3rem;animation:ticker-scroll 30s linear infinite;white-space:nowrap;">
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#10b981;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          GLOBAL GDP: <span id="stat-gdp">$96.3T</span>
        </span>
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#3b82f6;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          ACTIVE MARKETS: <span id="stat-markets">127</span>
        </span>
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#f59e0b;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          CRYPTO MCAP: <span id="stat-crypto">$2.1T</span>
        </span>
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#06b6d4;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          GLOBAL TEMP: <span id="stat-temp">+1.2Â°C</span>
        </span>
        <!-- Duplicate for seamless loop -->
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#10b981;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          GLOBAL GDP: <span id="stat-gdp-2">$96.3T</span>
        </span>
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#3b82f6;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          ACTIVE MARKETS: <span id="stat-markets-2">127</span>
        </span>
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#f59e0b;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          CRYPTO MCAP: <span id="stat-crypto-2">$2.1T</span>
        </span>
        <span class="ticker-item" style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#06b6d4;">
          <i class="fas fa-circle" style="font-size:6px;margin-right:6px;animation:pulse 2s ease-in-out infinite;"></i>
          GLOBAL TEMP: <span id="stat-temp-2">+1.2Â°C</span>
        </span>
      </div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ticker-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
    document.getElementById('map-container').appendChild(ticker);
  }
  update() {
    const gdp = (96 + Math.random() * 0.5).toFixed(1);
    const markets = Math.floor(125 + Math.random() * 5);
    const crypto = (2.0 + Math.random() * 0.3).toFixed(1);
    const temp = (1.2 + Math.random() * 0.1).toFixed(1);
    ['', '-2'].forEach(suffix => {
      const gdpEl = document.getElementById(`stat-gdp${suffix}`);
      const marketsEl = document.getElementById(`stat-markets${suffix}`);
      const cryptoEl = document.getElementById(`stat-crypto${suffix}`);
      const tempEl = document.getElementById(`stat-temp${suffix}`);
      if (gdpEl) gdpEl.textContent = `$${gdp}T`;
      if (marketsEl) marketsEl.textContent = markets;
      if (cryptoEl) cryptoEl.textContent = `$${crypto}T`;
      if (tempEl) tempEl.textContent = `+${temp}Â°C`;
    });
  }
}
class SmoothCamera {
  constructor(mapElement) {
    this.element = mapElement;
    this.current = { zoom: 1, x: 0, y: 0, rotation: 0 };
    this.target = { zoom: 1, x: 0, y: 0, rotation: 0 };
    this.easing = 0.1;
    this.animate();
  }
  setTarget(props) {
    Object.assign(this.target, props);
  }
  animate() {
    this.current.zoom += (this.target.zoom - this.current.zoom) * this.easing;
    this.current.x += (this.target.x - this.current.x) * this.easing;
    this.current.y += (this.target.y - this.current.y) * this.easing;
    this.current.rotation += (this.target.rotation - this.current.rotation) * this.easing;
    this.element.style.transform = `
      translate(${this.current.x}px, ${this.current.y}px)
      scale(${this.current.zoom})
      rotate(${this.current.rotation}deg)
    `;
    requestAnimationFrame(() => this.animate());
  }
}
class GodTierMap {
  constructor() {
    this.effects = {};
    this.isInitialized = false;
  }
  init() {
    if (this.isInitialized) return;
    console.log('ðŸš€ Initializing God-Tier Map Effects...');
    enhanceCountryStyles();
    setTimeout(() => {
      try {
        this.effects.particles = new ParticleNetwork('map-container');
        this.effects.ticker = new LiveStatsTicker();
        if (window.projection) {
          this.effects.dataNodes = new DataNodes('world-map', window.projection);
        }
        this.isInitialized = true;
        console.log('âœ… God-Tier Map Effects Active');
        this.addControls();
      } catch (err) {
        console.error('Error initializing god-tier effects:', err);
      }
    }, 2000);
  }
  addControls() {
    const controlPanel = document.createElement('div');
    controlPanel.id = 'godtier-controls';
    controlPanel.style.cssText = `
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      display: flex;
      gap: 0.5rem;
      z-index: 100;
    `;
    const controls = [
      { id: 'toggle-particles', icon: 'fa-circle-nodes', title: 'Toggle Particles' },
    ];
    controls.forEach(ctrl => {
      const btn = document.createElement('button');
      btn.className = 'map-ctrl-btn';
      btn.title = ctrl.title;
      btn.innerHTML = `<i class="fas ${ctrl.icon} text-xs"></i>`;
      btn.onclick = () => this.toggleEffect(ctrl.id);
      controlPanel.appendChild(btn);
    });
    document.getElementById('map-container').appendChild(controlPanel);
  }
  toggleEffect(effectId) {
    const effectMap = {
      'toggle-particles': 'particles',
    };
    const effect = this.effects[effectMap[effectId]];
    if (!effect) return;
    if (effect.canvas || effect.group) {
      const element = effect.canvas || effect.group.node();
      const isVisible = element.style.opacity !== '0';
      element.style.opacity = isVisible ? '0' : '0.6';
    }
  }
  showDataFlows(fromCountry) {
    if (!this.effects.dataFlows) return;
    const majorHubs = [
      [-74.006, 40.7128],  // New York
      [-0.1276, 51.5074],  // London
      [139.6917, 35.6895], // Tokyo
      [103.8198, 1.3521]   // Singapore
    ];
    this.effects.dataFlows.showFlows(fromCountry, majorHubs);
  }
  destroy() {
    Object.values(this.effects).forEach(effect => {
      if (effect.destroy) effect.destroy();
    });
    this.effects = {};
    this.isInitialized = false;
  }
}
window.godTierMap = new GodTierMap();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.godTierMap.init());
} else {
  window.godTierMap.init();
}
const originalSelectCountry = window.selectCountry;
if (originalSelectCountry) {
  window.selectCountry = function (event, d) {
    originalSelectCountry.call(this, event, d);
    const centroid = d3.geoCentroid(d);
    window.godTierMap.showDataFlows(centroid);
  };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GodTierMap,
    ParticleNetwork,
    DataNodes,
    LiveStatsTicker,
    SmoothCamera
  };
}
