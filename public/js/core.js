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

window._audioMuted = true;
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
  // Silent, quiet SaaS operation
};

function safeText(id) {
  const el = document.getElementById(id);
  return el ? el.innerText : "--";
}
window.downloadDossier = () => {
  window.print();
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
