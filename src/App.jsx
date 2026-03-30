import { useEffect } from 'react';
import './styles/terminal.css';

const TerminalDashboard = () => {
  useEffect(() => {
    // We import the original app logic from your JS folder
    // Since it's a module, it will execute and bind to the IDs we render below
    import('/public/js/app.js');
  }, []);

  return (
    <div className="flex flex-col night-theme">
      {/* ── TOOLTIPS & OVERLAYS (STAY FIXED) ────────────────────── */}
      <div id="map-tooltip" className="fixed hidden text-white rounded-xl border-l-4 border-l-emerald-500 overflow-hidden" 
           style={{ background: 'rgba(4, 10, 25, 0.95)', border: '1px solid rgba(16, 185, 129, 0.2)', borderLeft: '4px solid #10b981', minWidth: '160px' }}>
        <div className="flex items-center gap-2.5 px-3 pt-2.5 pb-2 border-b border-white/5">
          <img id="tooltip-flag" src="" alt="" className="hidden w-8 h-5 object-cover rounded shadow" />
          <span id="tooltip-name" className="text-[11px] font-black text-white uppercase tracking-wider font-mono"></span>
        </div>
        <div className="px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-mono">
            <span id="tooltip-label-1" className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">Capital</span>
            <span id="tooltip-capital" className="text-sm text-cyan-400 font-bold"></span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span id="tooltip-label-2" className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">Pop.</span>
            <span id="tooltip-pop" className="text-sm text-emerald-400 font-bold"></span>
          </div>
        </div>
      </div>

      <div id="about-overlay" className="fixed inset-0 hidden flex items-center justify-center p-6 z-[200]">
        <div className="glass-panel-enhanced w-full max-w-4xl p-0.5 relative">
          {/* Content will be filled by app.js / original HTML logic */}
          <div className="p-8 text-center text-slate-500">About Intelligence Target Display...</div>
        </div>
      </div>

      {/* ── SEARCH OVERLAY ────────────────────────────────────────── */}
      <div id="search-overlay" className="fixed inset-0 hidden flex items-center justify-center z-[100] px-6">
        <div className="glass-panel max-w-xl w-full border-blue-500/20 flex flex-col max-h-[75vh] overflow-hidden p-0">
          <div className="flex items-center p-6 gap-6 shrink-0 border-b border-white/8">
            <i className="fas fa-crosshairs text-[#3b82f6] text-2xl"></i>
            <input type="text" id="country-search" autoComplete="off" placeholder="Search countries..." 
                   className="w-full bg-transparent border-none outline-none text-[22px] font-black text-white placeholder-slate-800 tracking-tighter" />
            <button className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">ESC</span>
            </button>
          </div>
          <div id="search-results" className="flex-1 overflow-y-auto"></div>
        </div>
      </div>

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0d1117] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
            <i className="fas fa-satellite-dish text-sm text-white"></i>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-white leading-none">
            News<span className="text-[#3b82f6]">Atlas</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div id="map-search-container" className="flex items-center gap-3 px-4 h-8 rounded-lg transition-all header-widget" 
               style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <i className="fas fa-search text-[10px] text-slate-500"></i>
            <input id="map-search-input" className="bg-transparent border-none outline-none text-[11px] text-white w-32 placeholder-slate-700 font-mono" placeholder="Sector scan..." />
          </div>
          <div id="ist-time" className="px-3 h-8 flex items-center border-l border-white/5 text-[11px] font-mono text-slate-500">
            --:-- IST
          </div>
        </div>
      </header>

      {/* ── MAIN ──────────────────────────────────────────────────── */}
      <main className="main-content p-6 flex flex-col gap-6 flex-1 min-h-0 bg-[#0d1117]">
        <div id="map-box-id" className="map-box border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between gap-2 flex-shrink-0 bg-blue-500/[0.03]">
            <div id="map-status-area" className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04]">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest font-mono">Map Active</span>
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              {/* All the map control buttons go here (IDs MUST match app.js) */}
              <button id="style-toggle-btn" className="map-ctrl-btn text-slate-400"><i className="fas fa-layer-group text-sm"></i></button>
              <button id="projection-toggle-btn" className="map-ctrl-btn text-slate-400"><i className="fas fa-globe text-sm"></i></button>
              <button id="theme-toggle-btn" className="map-ctrl-btn text-slate-400"><i className="fas fa-moon text-sm"></i></button>
            </div>
          </div>
          
          <div className="flex-1 relative w-full h-full overflow-hidden">
            <div id="map-container" className="absolute inset-0 w-full h-full"></div>
            <div className="crt-overlay pointer-events-none absolute inset-0"></div>
            <div className="crt-vignette pointer-events-none absolute inset-0"></div>
          </div>
        </div>

        <div id="sidebar" className="intel-sidebar glass-panel border border-white/5 rounded-2xl flex flex-col overflow-hidden bg-white/[0.01]">
          {/* Re-implementing the Tab groups */}
          <nav className="flex border-b border-white/5 w-full bg-white/[0.02]">
             <button id="tab-btn-intel" className="nav-tab active flex-1 p-3 text-[11px] font-bold uppercase tracking-widest">Intel</button>
             <button id="tab-btn-news" className="nav-tab flex-1 p-3 text-[11px] font-bold uppercase tracking-widest">News</button>
             <button id="tab-btn-markets" className="nav-tab flex-1 p-3 text-[11px] font-bold uppercase tracking-widest">Markets</button>
          </nav>
          
          <div id="sidebar-content" className="flex-1 overflow-hidden p-6">
             <div id="tab-intel" className="tab-content active">
                <div id="ai-briefing-box" className="apple-glass p-5 rounded-xl border border-white/5">
                   <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                     <span className="text-[11px] text-blue-400 uppercase font-black tracking-widest font-mono">Signal Digest</span>
                   </div>
                   <div id="ai-briefing-text" className="text-slate-400 font-mono text-[11px] leading-relaxed">
                     Awaiting target uplink...
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TerminalDashboard;
