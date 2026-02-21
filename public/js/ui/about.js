let aboutStatsInterval;
let trafficRafId = null;
function initTrafficCanvas() {
  const canvas = document.getElementById("traffic-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = (canvas.width = canvas.offsetWidth);
  let h = (canvas.height = canvas.offsetHeight);
  let offset = 0;
  function draw() {
    trafficRafId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin((x + offset) * 0.05) * 20 * Math.sin(x * 0.01);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    offset += 2;
  }
  draw();
}
function stopTrafficCanvas() {
  if (trafficRafId != null) {
    cancelAnimationFrame(trafficRafId);
    trafficRafId = null;
  }
}
function startAboutStats() {
  const bioText =
    "Engineering high-fidelity command terminals that synchronize high-frequency global data with real-time geospatial telemetry.";
  const bioEl = document.getElementById("bio-text");
  bioEl.innerText = "";
  let i = 0;
  const type = setInterval(() => {
    if (i < bioText.length) {
      bioEl.innerText += bioText.charAt(i);
      i++;
    } else clearInterval(type);
  }, 30);
  if (aboutStatsInterval) clearInterval(aboutStatsInterval);
  let sec = 0;
  const uptimeEl = document.getElementById("uptime-counter");
  aboutStatsInterval = setInterval(() => {
    const cpu = Math.floor(Math.random() * 40) + 10;
    const mem = (Math.random() * 4 + 4).toFixed(1);
    const cpuBar = document.getElementById("cpu-bar");
    if (cpuBar) cpuBar.style.width = cpu + "%";
    const cpuVal = document.getElementById("cpu-val");
    if (cpuVal) cpuVal.innerText = cpu + "%";
    const memBar = document.getElementById("mem-bar");
    if (memBar) memBar.style.width = (mem / 16) * 100 + "%";
    const memVal = document.getElementById("mem-val");
    if (memVal) memVal.innerText = mem + "GB";
    const netDown = document.getElementById("net-down");
    if (netDown) netDown.innerText = (Math.random() * 50 + 10).toFixed(1);
    const netUp = document.getElementById("net-up");
    if (netUp) netUp.innerText = (Math.random() * 20 + 2).toFixed(1);
    sec++;
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    if (uptimeEl) uptimeEl.innerText = `${h}:${m}:${s}`;
  }, 1000);
}
window.toggleAbout = (show) => {
  window.playTacticalSound(show ? "success" : "click");
  const overlay = document.getElementById("about-overlay");
  overlay.classList.toggle("hidden", !show);
  if (show) {
    initTrafficCanvas();
    startAboutStats();
  } else {
    if (aboutStatsInterval) clearInterval(aboutStatsInterval);
    stopTrafficCanvas();
  }
};
const cliInput = document.getElementById("cli-input");
const cliOutput = document.getElementById("cli-output");
function appendLog(text, colorClass) {
  const div = document.createElement("div");
  div.className = `log-entry ${colorClass} leading-relaxed`;
  div.innerText = text;
  cliOutput.appendChild(div);
  cliOutput.scrollTop = cliOutput.scrollHeight;
}
if (cliInput) {
  cliInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const query = cliInput.value.trim();
      if (!query) return;
      window.playTacticalSound("click");
      appendLog(`> ${query}`, "text-white");
      cliInput.value = "";
      const countryName = window.selectedCountry
        ? window.selectedCountry.properties.name
        : "Global Context";
      appendLog(
        `> Processing query for sector: [${countryName.toUpperCase()}]...`,
        "text-blue-400 animate-pulse",
      );
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Context: The user is looking at a dashboard for ${countryName}.
                        User Query: "${query}".
                        Task: Answer as a tactical AI computer (concise, data-driven, no fluff).
                        Limit response to 2 sentences.`,
          }),
        });
        const data = await res.json();
        const answer =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "DATA CORRUPTION. RETRY.";
        appendLog(`> ${answer}`, "text-emerald-400");
        window.playTacticalSound("success");
      } catch (err) {
        appendLog(`> ERROR: UPLINK FAILED.`, "text-red-500");
      }
    }
  });
}
window.appendLog = appendLog;