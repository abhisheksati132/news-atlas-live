/**
 * NewsAtlas Omnibox Command Palette & Tactical Hotkeys HUD
 * - Command Palette (Cmd+K / Ctrl+K / /): Instant search across countries, spatial layers, view presets, basemaps, and actions.
 * - Tactical Hotkeys HUD (? / Shift+/): Mission control keyboard shortcuts cheat sheet.
 */

export class CommandPaletteEngine {
  constructor() {
    this.isOpen = false;
    this.selectedIndex = 0;
    this.commands = [];
    this.filteredCommands = [];
    this.modalEl = null;
    this.hotkeysModalEl = null;
    this._initKeyboardShortcuts();
  }

  _initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore when focused inside an input or textarea unless it's the command palette itself
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Cmd+K, Ctrl+K, or Slash (when not in input)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault();
        this.toggle();
        return;
      }

      // Hotkeys Cheat Sheet: '?' (Shift + /)
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        this.toggleHotkeysHUD();
        return;
      }

      // Single Key Tactical Shortcuts (when not inside an input)
      if (!isInput && !this.isOpen) {
        switch (e.key.toLowerCase()) {
          case 'v':
            e.preventDefault();
            this._cycleViewPreset();
            break;
          case 'p':
            e.preventDefault();
            if (window.togglePerformanceMode) window.togglePerformanceMode();
            break;
          case 'm':
            e.preventDefault();
            if (window.toggleAudioHaptics) window.toggleAudioHaptics();
            break;
          case 's':
            e.preventDefault();
            if (window.orbitalSpatial) window.orbitalSpatial.toggleSatellites();
            break;
          case 'f':
            e.preventDefault();
            if (window.orbitalSpatial) window.orbitalSpatial.toggleFlights();
            break;
          case 'e':
            e.preventDefault();
            if (window.orbitalSpatial) window.orbitalSpatial.toggleSeismic();
            break;
          case 'c':
            e.preventDefault();
            if (window.comparisonDossier) window.comparisonDossier.openModal();
            break;
          case 'd':
            e.preventDefault();
            if (window.downloadDossier) window.downloadDossier();
            break;
          case '1':
            e.preventDefault();
            if (window.switchTab) window.switchTab('intel');
            break;
          case '2':
            e.preventDefault();
            if (window.switchTab) window.switchTab('news');
            break;
          case '3':
            e.preventDefault();
            if (window.switchTab) window.switchTab('markets');
            break;
          case '4':
            e.preventDefault();
            if (window.switchTab) window.switchTab('atmosphere');
            break;
          case '5':
            e.preventDefault();
            if (window.switchTab) window.switchTab('economic');
            break;
        }
      }

      // Inside Command Palette navigation
      if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
          this._highlightSelected();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
          this._highlightSelected();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this._executeSelected();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        }
      }
    });
  }

  _cycleViewPreset() {
    const presets = ['cockpit', 'tactical', 'split', 'zen'];
    const current = window.activeViewPreset || 'cockpit';
    const nextIdx = (presets.indexOf(current) + 1) % presets.length;
    const next = presets[nextIdx];
    if (window.switchViewPreset) window.switchViewPreset(next);
  }

  _buildCommandsList() {
    const list = [
      // View Presets
      { id: 'preset-cockpit', group: 'View Layout', title: 'Cockpit View (Balanced 3D Globe + Sidebar)', icon: 'fa-desktop', action: () => window.switchViewPreset?.('cockpit') },
      { id: 'preset-tactical', group: 'View Layout', title: 'Tactical HUD View (Expanded Globe + Telemetry)', icon: 'fa-crosshairs', action: () => window.switchViewPreset?.('tactical') },
      { id: 'preset-split', group: 'View Layout', title: 'Split View (50/50 Dual Column Matrix)', icon: 'fa-columns', action: () => window.switchViewPreset?.('split') },
      { id: 'preset-zen', group: 'View Layout', title: 'Zen View (Pure Immersion Map)', icon: 'fa-expand', action: () => window.switchViewPreset?.('zen') },

      // Spatial & Orbital Telemetry Layers
      { id: 'layer-satellites', group: 'Spatial Layers', title: 'Toggle ISS & Orbital Satellite Tracking', icon: 'fa-satellite', action: () => window.orbitalSpatial?.toggleSatellites() },
      { id: 'layer-flights', group: 'Spatial Layers', title: 'Toggle Global Aviation Flight Corridors', icon: 'fa-plane', action: () => window.orbitalSpatial?.toggleFlights() },
      { id: 'layer-seismic', group: 'Spatial Layers', title: 'Toggle Real-Time USGS Seismic Shockwaves', icon: 'fa-wave-square', action: () => window.orbitalSpatial?.toggleSeismic() },
      { id: 'layer-radar', group: 'Spatial Layers', title: 'Toggle Doppler Precipitation Radar', icon: 'fa-cloud-rain', action: () => document.getElementById('mtb-radar')?.click() },
      { id: 'layer-arcs', group: 'Spatial Layers', title: 'Toggle 3D Telemetry Arcs', icon: 'fa-satellite-dish', action: () => document.getElementById('mtb-arcs')?.click() },
      { id: 'layer-terminator', group: 'Spatial Layers', title: 'Toggle Day / Night Shadow Line', icon: 'fa-adjust', action: () => document.getElementById('mtb-terminator')?.click() },

      // Intelligence & Actions
      { id: 'act-compare', group: 'Strategic Intel', title: 'Bilateral Country Comparison Matrix & Radar', icon: 'fa-chart-pie', action: () => window.comparisonDossier?.openModal() },
      { id: 'act-dossier', group: 'Strategic Intel', title: 'Generate Declassified Intelligence Dossier (PDF)', icon: 'fa-file-pdf', action: () => window.downloadDossier?.() },
      { id: 'act-ai', group: 'Strategic Intel', title: 'Toggle Sovereign AI Strategic Assistant', icon: 'fa-brain', action: () => window.toggleCLI?.() },
      { id: 'act-hotkeys', group: 'Strategic Intel', title: 'Open Tactical Hotkeys HUD (?)', icon: 'fa-keyboard', action: () => this.openHotkeysHUD() },

      // Navigation Tabs
      { id: 'tab-intel', group: 'Telemetry Tabs', title: 'Switch to Intelligence Summary Tab (Key 1)', icon: 'fa-chart-pie', action: () => window.switchTab?.('intel') },
      { id: 'tab-news', group: 'Telemetry Tabs', title: 'Switch to Live News Intelligence Tab (Key 2)', icon: 'fa-newspaper', action: () => window.switchTab?.('news') },
      { id: 'tab-markets', group: 'Telemetry Tabs', title: 'Switch to Financial Markets & Forex Tab (Key 3)', icon: 'fa-chart-line', action: () => window.switchTab?.('markets') },
      { id: 'tab-atmo', group: 'Telemetry Tabs', title: 'Switch to Atmosphere & Climate Tab (Key 4)', icon: 'fa-cloud-sun', action: () => window.switchTab?.('atmosphere') },
      { id: 'tab-econ', group: 'Telemetry Tabs', title: 'Switch to World Bank Macroeconomics Tab (Key 5)', icon: 'fa-coins', action: () => window.switchTab?.('economic') },

      // System Controls
      { id: 'sys-perf', group: 'System Controls', title: 'Toggle Performance Mode (Low FX)', icon: 'fa-bolt', action: () => window.togglePerformanceMode?.() },
      { id: 'sys-audio', group: 'System Controls', title: 'Toggle Tactical Audio & Drone Feedback', icon: 'fa-volume-high', action: () => window.toggleAudioHaptics?.() },
      { id: 'sys-locate', group: 'System Controls', title: 'Fly to My Current Geolocation', icon: 'fa-location-crosshairs', action: () => document.getElementById('mtb-locate')?.click() },
      { id: 'sys-reset', group: 'System Controls', title: 'Reset Map to Global Coordinates', icon: 'fa-compress-arrows-alt', action: () => window.resetToGlobalCenter?.(true) }
    ];

    // Add Top Countries from search registry
    if (window.globalSearchData && window.globalSearchData.length > 0) {
      window.globalSearchData.forEach(c => {
        list.push({
          id: `country-${c.cca3 || c.name.common}`,
          group: 'Global Countries',
          title: `Fly to ${c.name.common} (${c.capital?.[0] || 'Capital'}, ${c.region || ''})`,
          icon: 'fa-globe',
          flag: c.flags?.svg,
          action: () => window.selectFromSearch?.(c.name.common)
        });
      });
    }

    this.commands = list;
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.selectedIndex = 0;
    this._buildCommandsList();

    let modal = document.getElementById('command-palette-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'command-palette-modal';
      modal.className = 'fixed inset-0 z-[3200] flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }
    this.modalEl = modal;
    modal.classList.remove('hidden');

    this._renderPaletteUI();
    const input = document.getElementById('palette-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this._filter('');
    if (window.audioHaptics) window.audioHaptics.play('select');
  }

  close() {
    this.isOpen = false;
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  _renderPaletteUI() {
    if (!this.modalEl) return;
    this.modalEl.innerHTML = `
      <div class="apple-glass glass-elevated w-full max-w-2xl flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
          <i class="fas fa-terminal text-cyan-400 text-sm"></i>
          <input type="text" id="palette-search-input" placeholder="Type a command, country, spatial layer, or view preset..." 
            class="w-full bg-transparent border-none text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none font-mono" autocomplete="off" />
          <kbd class="px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border-subtle)] text-[var(--text-tertiary)] bg-[var(--bg-surface)]">ESC</kbd>
        </div>
        <div id="palette-results-list" class="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <!-- Results injected here -->
        </div>
        <div class="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
          <div class="flex items-center gap-3">
            <span><kbd class="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)]">↑</kbd> <kbd class="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)]">↓</kbd> Navigate</span>
            <span><kbd class="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)]">↵</kbd> Execute</span>
          </div>
          <span>NewsAtlas Tactical Omnibox</span>
        </div>
      </div>
    `;

    const input = document.getElementById('palette-search-input');
    if (input) {
      input.oninput = (e) => this._filter(e.target.value);
    }
  }

  _filter(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      this.filteredCommands = this.commands.slice(0, 30);
    } else {
      this.filteredCommands = this.commands.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
      ).slice(0, 30);
    }
    this.selectedIndex = 0;
    this._renderResults();
  }

  _renderResults() {
    const listEl = document.getElementById('palette-results-list');
    if (!listEl) return;

    if (this.filteredCommands.length === 0) {
      listEl.innerHTML = `<div class="p-8 text-center text-xs font-mono text-[var(--text-tertiary)]">No matching command or country found.</div>`;
      return;
    }

    listEl.innerHTML = this.filteredCommands.map((cmd, idx) => `
      <div class="palette-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${idx === this.selectedIndex ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--border-accent)]' : 'hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-transparent'}" data-index="${idx}">
        ${cmd.flag ? `<img src="${cmd.flag}" class="w-5 h-3.5 object-cover rounded shadow-sm shrink-0 border border-[var(--border-subtle)]">` : `<i class="fas ${cmd.icon} w-5 text-center text-xs opacity-75 shrink-0"></i>`}
        <div class="flex-1 min-w-0">
          <span class="text-xs font-medium truncate block font-sans">${cmd.title}</span>
        </div>
        <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-surface-subtle)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">${cmd.group}</span>
      </div>
    `).join('');

    listEl.querySelectorAll('.palette-item').forEach(item => {
      item.onclick = () => {
        this.selectedIndex = parseInt(item.dataset.index, 10);
        this._executeSelected();
      };
    });
  }

  _highlightSelected() {
    const items = document.querySelectorAll('.palette-item');
    items.forEach((item, idx) => {
      const isSel = idx === this.selectedIndex;
      item.className = `palette-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${isSel ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--border-accent)]' : 'hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-transparent'}`;
      if (isSel) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
    if (window.audioHaptics) window.audioHaptics.play('tick');
  }

  _executeSelected() {
    const cmd = this.filteredCommands[this.selectedIndex];
    if (cmd && typeof cmd.action === 'function') {
      this.close();
      if (window.audioHaptics) window.audioHaptics.play('preset');
      cmd.action();
    }
  }

  /* ------------------------------ TACTICAL HOTKEYS HUD MODAL ------------------------------ */
  toggleHotkeysHUD() {
    let modal = document.getElementById('hotkeys-hud-modal');
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    } else {
      this.openHotkeysHUD();
    }
  }

  openHotkeysHUD() {
    let modal = document.getElementById('hotkeys-hud-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hotkeys-hud-modal';
      modal.className = 'fixed inset-0 z-[3300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }
    this.hotkeysModalEl = modal;
    modal.classList.remove('hidden');

    modal.innerHTML = `
      <div class="apple-glass glass-elevated w-full max-w-xl flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <i class="fas fa-keyboard text-cyan-400"></i>
            <h2 class="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
              Mission Control Tactical Keyboard Shortcuts
            </h2>
          </div>
          <button type="button" id="hotkeys-close-btn" class="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg" aria-label="Close Hotkeys HUD">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[75vh] space-y-4 font-mono text-xs custom-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-2">
              <span class="text-[9px] uppercase tracking-wider text-cyan-400 font-bold block">Navigation & Layout</span>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Command Palette</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">Cmd/Ctrl+K or /</kbd></div>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Cycle View Presets</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">V</kbd></div>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Telemetry Tabs</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">1 – 5</kbd></div>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Escape / Exit Zen</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">ESC</kbd></div>
            </div>

            <div class="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-2">
              <span class="text-[9px] uppercase tracking-wider text-amber-400 font-bold block">Spatial Layers</span>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">ISS & Satellites</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">S</kbd></div>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Aviation Corridors</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">F</kbd></div>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">USGS Seismic Pulses</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">E</kbd></div>
              <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Performance Mode</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">P</kbd></div>
            </div>

            <div class="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-2 sm:col-span-2">
              <span class="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">Strategic Actions</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Bilateral Compare</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">C</kbd></div>
                <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Print / Export Dossier</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">D</kbd></div>
                <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Toggle Tactical Audio</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">M</kbd></div>
                <div class="flex justify-between items-center"><span class="text-[var(--text-secondary)]">Hotkeys Cheat Sheet</span><kbd class="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">?</kbd></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('hotkeys-close-btn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    if (window.audioHaptics) window.audioHaptics.play('select');
  }
}

export const commandPalette = new CommandPaletteEngine();
if (typeof window !== 'undefined') {
  window.commandPalette = commandPalette;
  window.toggleCommandPalette = () => commandPalette.toggle();
}
