window.fetchWithRetry = function (url, options, config) {
  const retries = (config && config.retries) ?? 1;
  const timeoutMs = (config && config.timeoutMs) ?? 12000;
  function attempt(n) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
    })
      .then((res) => {
        clearTimeout(id);
        if (!res.ok && res.status >= 429 && n < retries) return attempt(n + 1);
        return res;
      })
      .catch((err) => {
        clearTimeout(id);
        if (n < retries) return attempt(n + 1);
        throw err;
      });
  }
  return attempt(0);
};

window._audioMuted = false;
window.isAmbiencePlaying = false;
window.audioCtx = null;

window.getAudioContext = function () {
  if (!window.audioCtx) {
    try {
      window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("[AUDIO] Failed to initialize AudioContext:", e);
    }
  }
  return window.audioCtx;
};

let ambienceOsc = null;
let ambienceGain = null;

window.toggleGlobalAudio = function () {
  window._audioMuted = !window._audioMuted;
  console.log(`[AUDIO] Global audio state: ${window._audioMuted ? "MUTED" : "UNMUTED"}`);
  
  const ctx = window.getAudioContext();
  if (!ctx) return window._audioMuted;

  if (window._audioMuted) {
    // If we muted, suppress ambience hum
    if (ambienceGain) {
      try {
        ambienceGain.gain.setValueAtTime(0, ctx.currentTime);
      } catch (e) {}
    }
  } else if (window.isAmbiencePlaying) {
    // If we unmuted and ambience was active, bring it back
    if (ambienceGain) {
      try {
        if (ctx.state === 'suspended') ctx.resume();
        ambienceGain.gain.setValueAtTime(0.003, ctx.currentTime);
      } catch (e) {}
    }
  }
  return window._audioMuted;
};

window.toggleAmbience = function () {
  const ctx = window.getAudioContext();
  if (!ctx) return false;

  if (window.isAmbiencePlaying) {
    // Turn off
    if (ambienceGain) {
      try {
        ambienceGain.gain.setValueAtTime(0, ctx.currentTime);
      } catch (e) {}
    }
    window.isAmbiencePlaying = false;
  } else {
    // Turn on
    if (window._audioMuted) {
      window._audioMuted = false; // Auto unmute if they specifically toggle ambience
    }
    try {
      if (ctx.state === 'suspended') ctx.resume();
      if (!ambienceOsc) {
        ambienceOsc = ctx.createOscillator();
        ambienceGain = ctx.createGain();
        ambienceOsc.type = 'sine';
        ambienceOsc.frequency.setValueAtTime(45, ctx.currentTime); // Low hum
        ambienceGain.gain.setValueAtTime(0.003, ctx.currentTime);
        ambienceOsc.connect(ambienceGain);
        ambienceGain.connect(ctx.destination);
        ambienceOsc.start();
      } else {
        ambienceGain.gain.setValueAtTime(0.003, ctx.currentTime);
      }
      window.isAmbiencePlaying = true;
    } catch (e) {
      console.warn("[AUDIO] Failed to start ambience:", e);
    }
  }
  return window.isAmbiencePlaying;
};

window.playTacticalSound = function (type) {
  if (window._audioMuted) return;
  const ctx = window.getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      // In suspended state, attempt to resume if we are inside a user gesture
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
      
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } 
    else if (type === "success") {
      // Satisfying sci-fi multi-tone success chime
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        
        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.006, now + idx * 0.07 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.14);
      });
    } 
    else if (type === "tab") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
      
      gain.gain.setValueAtTime(0.006, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (err) {
    // Fail silently to prevent interrupting application flows
  }
};

function safeText(id) {
  const el = document.getElementById(id);
  return el ? el.innerText : "--";
}
window.downloadDossier = () => {
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
Capital: ${safeText("fact-cap")}
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

window.firebaseCore = {
  initializeApp,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot
};
