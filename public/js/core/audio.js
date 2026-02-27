let audioCtx;
let ambienceOscillators = [];
let ambienceGain = null;
window.isAmbiencePlaying = false;
function initAudio() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}
window.toggleAmbience = () => {
  initAudio();
  if (window.isAmbiencePlaying || window._audioMuted) {
    if (window.isAmbiencePlaying) {
      ambienceOscillators.forEach((osc) => {
        try { osc.stop(); osc.disconnect(); } catch (e) { }
      });
      if (ambienceGain) {
        ambienceGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        setTimeout(() => ambienceGain.disconnect(), 1000);
      }
      ambienceOscillators = [];
      window.isAmbiencePlaying = false;
    }
    const el = document.getElementById("ambience-text");
    if (el) { el.innerText = "OFF"; el.classList.remove("text-blue-400"); }
    const btn = document.getElementById("ambience-toggle-btn");
    if (btn) btn.classList.remove("active");
  } else {
    ambienceGain = audioCtx.createGain();
    ambienceGain.gain.value = 0; // Fade in
    ambienceGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 2); // Smooth 2s fade in

    // Add a dark cinematic low-pass filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400; // Deep muffled sound

    // Slowly modulate the filter cutoff for a "breathing" effect
    const lfo = audioCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.05; // Very slow (20s cycle)
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 150;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    ambienceOscillators.push(lfo);

    filter.connect(ambienceGain);
    ambienceGain.connect(audioCtx.destination);

    // Create a rich sub-bass and sci-fi drone chord
    // Base frequency (G1), Fifth (D2), Octave (G2), plus a detuned sub
    const freqs = [49.00, 73.42, 98.00, 48.5];

    freqs.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      // Mix of sine (deep bass) and triangle (some harmonics)
      osc.type = i === 1 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, audioCtx.currentTime);

      // Add subtle stereo spread
      const panner = audioCtx.createStereoPanner();
      panner.pan.value = (i % 2 === 0 ? 1 : -1) * 0.4;

      osc.connect(panner);
      panner.connect(filter);
      osc.start();
      ambienceOscillators.push(osc);
    });

    window.isAmbiencePlaying = true;
    const el = document.getElementById("ambience-text");
    if (el) { el.innerText = "ON"; el.classList.add("text-blue-400"); }
    const btn = document.getElementById("ambience-toggle-btn");
    if (btn) btn.classList.add("active");
  }
};
window.playTacticalSound = (type) => {
  initAudio();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    if (type === "tab") {
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === "click") {
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.05,
      );
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === "hover") {
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.006, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.02,
      );
      osc.start();
      osc.stop(audioCtx.currentTime + 0.02);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        1100,
        audioCtx.currentTime + 0.25,
      );
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) { }
};
function safeText(id) {
  const el = document.getElementById(id);
  return el ? el.innerText : "--";
}
window.downloadDossier = () => {
  window.playTacticalSound("success");
  const cName = window.selectedCountry
    ? window.selectedCountry.properties.name
    : "GLOBAL_CONTEXT";
  const date = new Date().toISOString().split("T")[0];
  const intelEl = document.getElementById("ai-briefing-text");
  const intelText = intelEl ? intelEl.innerText : "No Intel Loaded";
  const content = `
████████████████████████████████████████████████████████████
CLASSIFIED INTELLIGENCE DOSSIER
SECTOR: ${cName.toUpperCase()}
DATE: ${date}
GENERATED BY: NEWSATLAS TERMINAL v3.7.1
████████████████████████████████████████████████████████████
[TACTICAL BRIEFING]
${intelText}
[ECONOMIC TELEMETRY]
Population: ${safeText("fact-pop")}
Currency: ${safeText("fact-currency")}
Capital: ${safeText("fact-cap")}
[MARKET DATA]
Gold: ${safeText("price-gold")}
Silver: ${safeText("price-silver")}
[ATMOSPHERIC CONDITIONS]
Temp: ${safeText("atmo-temp")}
Wind: ${safeText("atmo-wind-speed")} KM/H
-- END OF TRANSMISSION --
    `;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `INTEL_${cName.toUpperCase()}_${date}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};