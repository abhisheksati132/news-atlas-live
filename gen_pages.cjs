const fs = require('fs');

const layout = (title, category, color, content) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — NewsAtlas</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/landing.css" />
</head>
<body class="grid-bg h-screen w-screen overflow-hidden flex flex-col">
  <nav class="fixed top-4 left-4 right-4 max-w-7xl mx-auto z-50 apple-glass rounded-[1rem] sm:rounded-[2rem]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <a href="index.html" class="flex items-center gap-3">
          <div class="relative w-8 h-8 sm:w-10 sm:h-10">
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center transition-transform hover:rotate-6">
              <i class="fas fa-satellite-dish text-white text-sm sm:text-base"></i>
            </div>
          </div>
          <span class="font-black text-lg sm:text-xl tracking-tighter text-white">NEWS<span class="text-blue-400">ATLAS</span></span>
        </a>
        <div class="flex items-center gap-2 sm:gap-3">
          <a href="index.html" class="text-[9px] sm:text-[10px] font-mono text-slate-400 hover:text-white transition-all tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/5 bg-white/[0.02] shadow-sm flex items-center gap-2">← BACK</a>
        </div>
      </div>
    </div>
  </nav>

  <main class="flex-grow pt-24 pb-8 px-4 sm:px-6 relative flex flex-col items-center justify-center h-full">
    <div class="absolute top-1/4 left-1/4 w-[400px] h-[400px] radial-${color} pointer-events-none opacity-20"></div>
    <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] radial-${color === 'blue' ? 'cyan' : 'blue'} pointer-events-none opacity-20"></div>

    <div class="w-full max-w-3xl apple-glass rounded-[2rem] border border-${color}-500/20 box-glow-${color} p-6 sm:p-10 relative z-10 flex flex-col max-h-full overflow-y-auto">
      <div class="inline-flex items-center gap-2 glass-${color} rounded-full px-3 py-1 mb-4 w-fit">
        <div class="w-1.5 h-1.5 rounded-full bg-${color}-400 status-dot"></div>
        <span class="text-[10px] font-mono text-${color}-400 tracking-widest uppercase">${category}</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 sm:mb-6">${title}</h1>
      
      <div class="space-y-4 text-slate-400 font-mono text-xs sm:text-sm leading-relaxed max-w-prose">
        ${content}
      </div>
    </div>
  </main>
</body>
</html>`;

const pages = [
  {
    path: './public/about.html',
    title: 'About NewsAtlas',
    category: 'COMPANY',
    color: 'blue',
    content: `
      <p>NewsAtlas is the premier Global Intelligence Terminal designed for professionals who require real-time situational awareness. By aggregating over 4,700 live sources, including geospatial, economic, and geopolitical feeds, we provide a unified common operating picture.</p>
      <p>Our mission is to decode the world's signal from the noise, empowering decision-makers, analysts, and operators with unprecedented clarity and speed.</p>
      <p>Built on a zero-trust architecture with decentralized telemetry pipelines, NewsAtlas ensures that your intelligence is not just fast, but secure and incontrovertible.</p>
    `
  },
  {
    path: './public/careers.html',
    title: 'Careers / Deployment',
    category: 'COMPANY',
    color: 'cyan',
    content: `
      <p>Join the Vanguard. NewsAtlas is actively recruiting top-tier engineers, intelligence analysts, and security architects to scale our global platform.</p>
      <div class="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
        <h3 class="text-white font-bold mb-2">OPEN POSITIONS</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Geospatial Systems Engineer</strong> - Global Remote</li>
          <li><strong>AI Threat Analysis Lead</strong> - NYC / Remote</li>
          <li><strong>Security Infrastructure Architect</strong> - London</li>
        </ul>
      </div>
      <p>Send encrypted dossiers (resumes) to <strong>recruitment@newsatlas.net</strong>.</p>
    `
  },
  {
    path: './public/security.html',
    title: 'Security Architecture',
    category: 'COMPANY',
    color: 'emerald',
    content: `
      <p>Security is not a feature at NewsAtlas; it is the foundation of our entire infrastructure.</p>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Zero-Trust Network Access:</strong> Every node, uplink, and transmission is mutually authenticated.</li>
        <li><strong>End-to-End Encryption:</strong> AES-256 for data at rest, and TLS 1.3 with forward secrecy for data in transit.</li>
        <li><strong>Live Intrustion Detection:</strong> Proprietary AI heuristics monitoring all endpoint analytics.</li>
      </ul>
      <p>We undergo strict penetration testing on a bi-weekly basis. Report vulnerabilities to our Bug Bounty program.</p>
    `
  },
  {
    path: './public/contact.html',
    title: 'Contact / Secure Line',
    category: 'COMPANY',
    color: 'blue',
    content: `
      <p>Establish a direct uplink with our support and operations teams.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <div class="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <div class="text-white font-bold mb-1 text-xs">GENERAL INQUIRIES</div>
          <div class="text-blue-400 text-xs">comms@newsatlas.net</div>
        </div>
        <div class="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <div class="text-white font-bold mb-1 text-xs">ENTERPRISE DEPLOYMENT</div>
          <div class="text-blue-400 text-xs">enterprise@newsatlas.net</div>
        </div>
      </div>
      <p class="mt-3">For urgent technical disruptions, terminal operators can use the embedded "SOS" protocol within their dashboard.</p>
    `
  },
  {
    path: './public/privacy.html',
    title: 'Privacy Directive',
    category: 'LEGAL',
    color: 'purple',
    content: `
      <h3 class="text-white font-bold text-lg mb-2">1. DATA MINIMIZATION</h3>
      <p>We collect only the telemetry strictly necessary to maintain your uplink and terminal session. We do not track cross-site behavior or sell operator data to third parties.</p>
      <h3 class="text-white font-bold text-lg mt-6 mb-2">2. ENCRYPTED PROFILES</h3>
      <p>Your search history, intelligence queries, and map views are heavily encrypted. Even NewsAtlas administrators cannot decode your specific watchlist matrices.</p>
      <h3 class="text-white font-bold text-lg mt-6 mb-2">3. COMPLIANCE</h3>
      <p>We are fully compliant with GDPR, CCPA, and international data privacy frameworks.</p>
    `
  },
  {
    path: './public/terms.html',
    title: 'Terms of Service',
    category: 'LEGAL',
    color: 'purple',
    content: `
      <p>By accessing the NewsAtlas Terminal, you agree to the following operational parameters:</p>
      <ul class="list-disc pl-5 space-y-2 mt-4">
        <li><strong>Authorized Use:</strong> The platform is intended for legitimate intelligence gathering, research, and situational awareness.</li>
        <li><strong>API Limits:</strong> Excessive scraping or automated pinging of the GraphQL/REST APIs without enterprise authorization is strictly prohibited.</li>
        <li><strong>Data Integrity:</strong> While we aim for 99.4% accuracy, NewsAtlas is an aggregator; we are not liable for actions taken based on third-party intel streams.</li>
      </ul>
      <p class="mt-4">Violation of these terms will result in immediate API key revocation and IP blacklisting.</p>
    `
  },
  {
    path: './public/compliance.html',
    title: 'Regulatory Compliance',
    category: 'LEGAL',
    color: 'emerald',
    content: `
      <p>NewsAtlas adheres strictly to global technological compliance networks.</p>
      <div class="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div class="p-3 bg-white/[0.02] border border-emerald-500/20 rounded-xl">
          <div class="text-emerald-400 font-bold text-xs">SOC 2 TYPE II</div>
          <div class="text-[10px] mt-1">Certified since 2024</div>
        </div>
        <div class="p-3 bg-white/[0.02] border border-emerald-500/20 rounded-xl">
          <div class="text-emerald-400 font-bold text-xs">ISO 27001</div>
          <div class="text-[10px] mt-1">Information Security Management</div>
        </div>
      </div>
      <p class="mt-3">Full audit reports are available for Enterprise-tier clients upon request via their dedicated account liaison.</p>
    `
  },
  {
    path: './public/sla.html',
    title: 'Service Level Agreement (SLA)',
    category: 'LEGAL',
    color: 'cyan',
    content: `
      <h3 class="text-white font-bold text-lg mb-2">UPTIME GUARANTEE</h3>
      <p>NewsAtlas guarantees a 99.9% uptime for the Terminal interface and core market/geoint ingestion feeds.</p>
      <h3 class="text-white font-bold text-lg mt-6 mb-2">LATENCY THRESHOLDS</h3>
      <p>We commit to an average latency of under 100ms for High-Priority incident alerts and financial telemetry delivery.</p>
      <h3 class="text-white font-bold text-lg mt-6 mb-2">COMPENSATION</h3>
      <p>If uptime drops below 99.9% in a given month, affected Enterprise operators are entitled to prorated credits towards their active subscription cycle.</p>
    `
  }
];

for (const page of pages) {
  const html = layout(page.title, page.category, page.color, page.content);
  fs.writeFileSync(page.path, html, 'utf8');
}

console.log('Pages generated successfully!');
