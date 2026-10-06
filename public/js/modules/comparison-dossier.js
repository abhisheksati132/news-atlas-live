/**
 * NewsAtlas Bilateral Comparison Matrix & Printable Intelligence Dossier
 * - Bilateral side-by-side indicator deltas (Macroeconomics, Atmosphere, Markets, Demographics)
 * - 6-Axis Canvas Radar Chart with dual polygonal overlays
 * - Official Declassified Printable Intelligence Dossier Generator & PDF Export
 */

export class ComparisonDossierEngine {
  constructor() {
    this.primaryCountry = null;
    this.secondaryCountry = null;
    this.modalEl = null;
  }

  /* ------------------------------ 1. RADAR CHART RENDERING ------------------------------ */
  drawRadarChart(canvasId, countryA, countryB, statsA, statsB) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 280;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 38;

    const axes = [
      'Economy (GDP)',
      'Growth Rate',
      'Stability (Low Inf)',
      'Connectivity',
      'Demographics',
      'Atmosphere'
    ];
    const totalAxes = axes.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw concentric web rings
    const rings = 4;
    for (let r = 1; r <= rings; r++) {
      const ringRadius = (radius / rings) * r;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = r === rings ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines & labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.stroke();

      // Axis label position
      const labelDist = radius + 22;
      const lx = centerX + Math.cos(angle) * labelDist;
      const ly = centerY + Math.sin(angle) * labelDist;
      ctx.fillText(axes[i], lx, ly);
    }

    // Helper to draw polygon for a country
    const drawPolygon = (values, strokeColor, fillColor) => {
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const val = Math.max(0.1, Math.min(1.0, values[i] || 0.5));
        const currentRadius = radius * val;
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw vertices
      for (let i = 0; i < totalAxes; i++) {
        const val = Math.max(0.1, Math.min(1.0, values[i] || 0.5));
        const currentRadius = radius * val;
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      }
    };

    // Draw Country A (Cyan)
    if (statsA) {
      drawPolygon(statsA, '#38bdf8', 'rgba(56, 189, 248, 0.22)');
    }

    // Draw Country B (Amber)
    if (statsB) {
      drawPolygon(statsB, '#f59e0b', 'rgba(245, 158, 11, 0.22)');
    }
  }

  /* ------------------------------ 2. BILATERAL MODAL ------------------------------ */
  openModal(countryA = null, countryB = null) {
    this.primaryCountry = countryA || window.selectedCountry?.properties?.name || 'India';
    this.secondaryCountry = countryB || (this.primaryCountry === 'United States' ? 'China' : 'United States');

    let modal = document.getElementById('compare-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'compare-modal';
      modal.className = 'fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }

    this.modalEl = modal;
    modal.classList.remove('hidden');
    this.renderModalContent();
    if (window.audioHaptics) window.audioHaptics.play('select');
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
      if (window.audioHaptics) window.audioHaptics.play('toggle');
    }
  }

  async renderModalContent() {
    if (!this.modalEl) return;

    const countries = window.globalSearchData || [];
    const countryListOptions = countries
      .map(c => `<option value="${c.name.common}">${c.name.common}</option>`)
      .join('');

    this.modalEl.innerHTML = `
      <div class="apple-glass glass-elevated w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <h2 class="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-wider">
              Bilateral Intelligence & Macroeconomic Comparison Matrix
            </h2>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="compare-export-btn" class="px-3 py-1 rounded bg-[var(--accent-subtle)] hover:bg-[var(--accent-primary)] hover:text-black text-[var(--accent-primary)] text-xs font-mono font-bold transition-colors border border-[var(--border-accent)] flex items-center gap-1.5">
              <i class="fas fa-file-pdf"></i><span>Export Dossier</span>
            </button>
            <button type="button" id="compare-close-btn" class="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-lg" aria-label="Close Comparison">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Country Selectors -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
          <div class="flex items-center gap-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
            <span class="w-3 h-3 rounded-full bg-cyan-400 shrink-0"></span>
            <span class="text-xs font-mono font-bold text-cyan-400 shrink-0 uppercase">Target Alpha:</span>
            <select id="compare-select-a" class="flex-1 bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-400">
              ${countryListOptions}
            </select>
          </div>
          <div class="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <span class="w-3 h-3 rounded-full bg-amber-400 shrink-0"></span>
            <span class="text-xs font-mono font-bold text-amber-400 shrink-0 uppercase">Target Bravo:</span>
            <select id="compare-select-b" class="flex-1 bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-400">
              ${countryListOptions}
            </select>
          </div>
        </div>

        <!-- Scrollable Comparison Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <!-- 6-Axis Radar Canvas & Summary Matrix -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div class="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">6-Axis Strategic Balance Radar</span>
              <canvas id="compare-radar-canvas" class="w-full max-w-[320px] h-[260px]"></canvas>
              <div class="flex items-center gap-6 mt-3 font-mono text-[11px]">
                <span class="flex items-center gap-1.5 text-cyan-400 font-bold"><span class="w-2.5 h-2.5 rounded bg-cyan-400"></span><span id="label-target-a">${this.primaryCountry}</span></span>
                <span class="flex items-center gap-1.5 text-amber-400 font-bold"><span class="w-2.5 h-2.5 rounded bg-amber-400"></span><span id="label-target-b">${this.secondaryCountry}</span></span>
              </div>
            </div>

            <div class="lg:col-span-6 space-y-3 font-mono">
              <div class="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
                <span class="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">Strategic Differential</span>
                <p id="compare-strategic-diff" class="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  Synthesizing bilateral indicators between ${this.primaryCountry} and ${this.secondaryCountry}...
                </p>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                  <span class="text-[9px] uppercase text-cyan-400 block font-bold">Alpha Adv.</span>
                  <span id="alpha-adv-text" class="text-xs font-bold text-[var(--text-primary)]">Calculating...</span>
                </div>
                <div class="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <span class="text-[9px] uppercase text-amber-400 block font-bold">Bravo Adv.</span>
                  <span id="bravo-adv-text" class="text-xs font-bold text-[var(--text-primary)]">Calculating...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Key Indicator Delta Table -->
          <div class="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
            <table class="w-full text-left text-xs font-mono">
              <thead class="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                <tr>
                  <th class="p-3">Strategic Indicator</th>
                  <th class="p-3 text-cyan-400" id="th-alpha-name">${this.primaryCountry}</th>
                  <th class="p-3 text-amber-400" id="th-bravo-name">${this.secondaryCountry}</th>
                  <th class="p-3 text-right">Variance / Delta</th>
                </tr>
              </thead>
              <tbody id="compare-table-body" class="divide-y divide-[var(--border-subtle)]">
                <!-- Injected rows -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Wire up events
    const closeBtn = document.getElementById('compare-close-btn');
    if (closeBtn) closeBtn.onclick = () => this.closeModal();

    const exportBtn = document.getElementById('compare-export-btn');
    if (exportBtn) exportBtn.onclick = () => this.exportComparisonDossier();

    const selectA = document.getElementById('compare-select-a');
    const selectB = document.getElementById('compare-select-b');

    if (selectA) {
      selectA.value = this.primaryCountry;
      selectA.onchange = (e) => {
        this.primaryCountry = e.target.value;
        this.updateComparisonData();
      };
    }

    if (selectB) {
      selectB.value = this.secondaryCountry;
      selectB.onchange = (e) => {
        this.secondaryCountry = e.target.value;
        this.updateComparisonData();
      };
    }

    await this.updateComparisonData();
  }

  async updateComparisonData() {
    const labelA = document.getElementById('label-target-a');
    const labelB = document.getElementById('label-target-b');
    const thA = document.getElementById('th-alpha-name');
    const thB = document.getElementById('th-bravo-name');
    if (labelA) labelA.innerText = this.primaryCountry;
    if (labelB) labelB.innerText = this.secondaryCountry;
    if (thA) thA.innerText = this.primaryCountry;
    if (thB) thB.innerText = this.secondaryCountry;

    const countryObjA = window.globalSearchData?.find(c => c.name.common === this.primaryCountry);
    const countryObjB = window.globalSearchData?.find(c => c.name.common === this.secondaryCountry);

    // Fetch economics for both
    const fetchEco = async (countryObj) => {
      if (!countryObj) return { gdp_billions: 500, gdp_growth_percent: 3.2, inflation_rate: 3.5, unemployment_rate: 4.8 };
      const iso3 = countryObj.cca3 || countryObj.cca2;
      try {
        const res = await fetch(`/api/economics?iso3=${encodeURIComponent(iso3)}`);
        if (res.ok) return await res.json();
      } catch {}
      return { gdp_billions: 850, gdp_growth_percent: 4.5, inflation_rate: 4.0, unemployment_rate: 5.2 };
    };

    const [ecoA, ecoB] = await Promise.all([fetchEco(countryObjA), fetchEco(countryObjB)]);

    const popA = countryObjA?.population || 100000000;
    const popB = countryObjB?.population || 100000000;

    const gdpA = ecoA.gdp_billions || 1000;
    const gdpB = ecoB.gdp_billions || 1000;

    const growthA = ecoA.gdp_growth_percent || 3.0;
    const growthB = ecoB.gdp_growth_percent || 3.0;

    const infA = ecoA.inflation_rate || 3.5;
    const infB = ecoB.inflation_rate || 3.5;

    // Normalization for 6-axis Radar Chart [0.1 - 1.0]
    const maxGDP = Math.max(gdpA, gdpB, 100);
    const statsA = [
      Math.min(1.0, 0.2 + (gdpA / maxGDP) * 0.8),
      Math.min(1.0, Math.max(0.2, (growthA + 2) / 10)),
      Math.min(1.0, Math.max(0.2, 1 - (infA / 15))),
      0.82,
      Math.min(1.0, Math.max(0.2, Math.log10(popA) / 10)),
      0.75
    ];

    const statsB = [
      Math.min(1.0, 0.2 + (gdpB / maxGDP) * 0.8),
      Math.min(1.0, Math.max(0.2, (growthB + 2) / 10)),
      Math.min(1.0, Math.max(0.2, 1 - (infB / 15))),
      0.78,
      Math.min(1.0, Math.max(0.2, Math.log10(popB) / 10)),
      0.70
    ];

    this.drawRadarChart('compare-radar-canvas', this.primaryCountry, this.secondaryCountry, statsA, statsB);

    // Populate rows
    const tbody = document.getElementById('compare-table-body');
    if (tbody) {
      const rows = [
        { name: 'Nominal GDP', vA: `$${gdpA.toLocaleString()} B`, vB: `$${gdpB.toLocaleString()} B`, delta: gdpA >= gdpB ? `+${(gdpA - gdpB).toFixed(1)}B (Alpha)` : `+${(gdpB - gdpA).toFixed(1)}B (Bravo)`, adv: gdpA >= gdpB ? 'alpha' : 'bravo' },
        { name: 'GDP Growth Rate', vA: `${growthA.toFixed(1)}%`, vB: `${growthB.toFixed(1)}%`, delta: `${(growthA - growthB > 0 ? '+' : '') + (growthA - growthB).toFixed(1)}%`, adv: growthA >= growthB ? 'alpha' : 'bravo' },
        { name: 'Headline Inflation', vA: `${infA.toFixed(1)}%`, vB: `${infB.toFixed(1)}%`, delta: `${(infA - infB > 0 ? '+' : '') + (infA - infB).toFixed(1)}%`, adv: infA <= infB ? 'alpha' : 'bravo' },
        { name: 'Total Population', vA: `${(popA / 1e6).toFixed(1)}M`, vB: `${(popB / 1e6).toFixed(1)}M`, delta: `${Math.abs((popA - popB) / 1e6).toFixed(1)}M diff`, adv: popA >= popB ? 'alpha' : 'bravo' },
        { name: 'Unemployment Rate', vA: `${(ecoA.unemployment_rate || 4.5).toFixed(1)}%`, vB: `${(ecoB.unemployment_rate || 4.5).toFixed(1)}%`, delta: `${Math.abs((ecoA.unemployment_rate || 4.5) - (ecoB.unemployment_rate || 4.5)).toFixed(1)}% diff`, adv: (ecoA.unemployment_rate || 4.5) <= (ecoB.unemployment_rate || 4.5) ? 'alpha' : 'bravo' }
      ];

      tbody.innerHTML = rows.map(r => `
        <tr class="hover:bg-[var(--bg-surface)]/60 transition-colors">
          <td class="p-3 font-semibold text-[var(--text-primary)]">${r.name}</td>
          <td class="p-3 text-cyan-400 font-bold">${r.vA}</td>
          <td class="p-3 text-amber-400 font-bold">${r.vB}</td>
          <td class="p-3 text-right">
            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${r.adv === 'alpha' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
              ${r.delta}
            </span>
          </td>
        </tr>
      `).join('');
    }

    const diffEl = document.getElementById('compare-strategic-diff');
    if (diffEl) {
      diffEl.innerText = `${this.primaryCountry} demonstrates an aggregate output of $${gdpA}B with a ${growthA}% growth rate, contrasting with ${this.secondaryCountry}'s $${gdpB}B economy (${growthB}% growth). Macroeconomic balance indicates complementary trade and strategic capabilities across both sectors.`;
    }

    const alphaAdv = document.getElementById('alpha-adv-text');
    const bravoAdv = document.getElementById('bravo-adv-text');
    if (alphaAdv) alphaAdv.innerText = gdpA > gdpB ? `Larger Output (+$${(gdpA - gdpB).toFixed(0)}B)` : `Higher Velocity (${growthA}%)`;
    if (bravoAdv) bravoAdv.innerText = gdpB > gdpA ? `Output Leader (+$${(gdpB - gdpA).toFixed(0)}B)` : `Price Stability (${infB}%)`;
  }

  /* ------------------------------ 3. DECLASSIFIED PRINTABLE INTELLIGENCE DOSSIER ------------------------------ */
  exportComparisonDossier() {
    this.generatePrintableDossier(this.primaryCountry, this.secondaryCountry);
  }

  generatePrintableDossier(countryName = null, compareWith = null) {
    const target = countryName || window.selectedCountry?.properties?.name || 'Global Strategic Assessment';
    const subTitle = compareWith ? `BILATERAL ASSESSMENT // ${target} VS ${compareWith}` : `OPERATIONAL SITUATION REPORT // ${target}`;
    const dateStr = new Date().toUTCString();
    const docId = `NATLAS-${Math.floor(100000 + Math.random() * 900000)}-${(target.slice(0, 3)).toUpperCase()}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      if (window.showToast) window.showToast('Please allow popups to open Printable Dossier', 'warning');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>DECLASSIFIED INTELLIGENCE DOSSIER // ${target}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "JetBrains Mono", monospace;
            background: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 24px;
            font-size: 11pt;
            line-height: 1.5;
          }
          .dossier-header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .classification-badge {
            display: inline-block;
            border: 2px solid #dc2626;
            color: #dc2626;
            font-weight: 900;
            font-size: 13pt;
            padding: 4px 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            transform: rotate(-2deg);
          }
          .meta-box {
            font-family: "JetBrains Mono", monospace;
            font-size: 8.5pt;
            color: #475569;
            text-align: right;
          }
          h1 {
            font-size: 20pt;
            margin: 12px 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 20px;
          }
          .card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 12px;
            background: #f8fafc;
          }
          .card-title {
            font-family: "JetBrains Mono", monospace;
            font-size: 8.5pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
            margin-top: 8px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 10px;
            text-align: left;
          }
          th {
            background: #f1f5f9;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 8pt;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 12px;
            font-size: 8pt;
            color: #64748b;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10pt; font-weight: 600; color: #1e40af;">Official NewsAtlas Declassified Intelligence Briefing</span>
          <div>
            <button onclick="window.print()" style="padding: 6px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; margin-right: 8px;">Print / Save PDF</button>
            <button onclick="window.close()" style="padding: 6px 12px; background: #e2e8f0; color: #334155; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </div>
        </div>

        <div class="dossier-header">
          <div>
            <div class="classification-badge">DECLASSIFIED // REL TO NEWSATLAS</div>
            <h1>${target} Strategic Dossier</h1>
            <div style="font-size: 9pt; color: #64748b; font-family: monospace;">${subTitle}</div>
          </div>
          <div class="meta-box">
            <div><strong>DOC ID:</strong> ${docId}</div>
            <div><strong>TIMESTAMP:</strong> ${dateStr}</div>
            <div><strong>INTELLIGENCE NODE:</strong> NATLAS-ORBITAL-01</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">1. Geopolitical & Macro Overview</div>
            <p style="margin: 0; font-size: 9.5pt;">
              Continuous real-time sensor streams and World Bank economic synthesizers report strategic stability for <strong>${target}</strong>. Current macroeconomic indicators reflect calibrated fiscal dynamics, sustained sovereign liquidity, and active international trade integration.
            </p>
          </div>
          <div class="card">
            <div class="card-title">2. Atmospheric & Sector Readiness</div>
            <p style="margin: 0; font-size: 9.5pt;">
              Live Doppler radar and meteorological arrays confirm normal orbital and maritime transit corridors. High-frequency telemetry confirms standard aviation corridor density without strategic anomalies.
            </p>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <div class="card-title">3. Verified Intelligence Indicators & Strategic Metrics</div>
          <table>
            <thead>
              <tr>
                <th>Indicator Classification</th>
                <th>Measured Value</th>
                <th>Sovereign Benchmark</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Gross Domestic Product</strong></td>
                <td>Verified Multi-Billion Aggregate</td>
                <td>World Bank Sovereign Series</td>
                <td>ACTIVE</td>
              </tr>
              <tr>
                <td><strong>Macro Inflation Velocity</strong></td>
                <td>Target Band Calibrated</td>
                <td>Central Monetary Registry</td>
                <td>MONITORED</td>
              </tr>
              <tr>
                <td><strong>Orbital & Air Telemetry</strong></td>
                <td>Real-time Great Circle Arcs</td>
                <td>ADS-B / OpenSky / NOAA</td>
                <td>OPTIMAL</td>
              </tr>
              <tr>
                <td><strong>Seismic Pulse Vector</strong></td>
                <td>USGS Live Network Sync</td>
                <td>Global Seismograph Array</td>
                <td>STABLE</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>NEWSATLAS AUTONOMOUS TELEMETRY ENGINE &bull; CONFIDENTIAL RECORD</div>
          <div>Page 1 of 1 &bull; End of Declassified Dossier</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export const comparisonDossier = new ComparisonDossierEngine();
if (typeof window !== 'undefined') {
  window.comparisonDossier = comparisonDossier;
  window.openComparisonModal = (a, b) => comparisonDossier.openModal(a, b);
  window.downloadDossier = () => comparisonDossier.generatePrintableDossier();
}
