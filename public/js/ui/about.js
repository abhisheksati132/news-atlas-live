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

// --- Real-time Sparkline Charts Logic ---
function drawSparkline(ctx, data, color) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (data.length < 2) return;

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.lineJoin = "round";

  // Calculate step size based on data points
  // We want the last point to be at x=w
  const step = w / (Math.max(data.length, 2) - 1);

  // Using fixed 0-100 scale here as percentages
  const yScale = h / 100;

  for (let i = 0; i < data.length; i++) {
    const x = i * step;
    const val = Math.max(0, Math.min(100, data[i])); // Clamp 0-100
    const y = h - (val * yScale); // Invert Y
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Gradient fill area under line
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color.replace(")", ", 0.15)").replace("rgb", "rgba");
  ctx.fill();
}

const historyLen = 30; // 30 seconds of history
const cpuHistory = new Array(historyLen).fill(0);
const memHistory = new Array(historyLen).fill(0);
const netHistory = new Array(historyLen).fill(0);

function startAboutStats() {
  const bioText =
    "Welcome to NewsAtlas Intelligence Terminal. System active. Aggregating synchronous real-time telemetry across multi-vector global data—from deep atmospheric metrics to live conflict zone analysis. Authorized access only.";
  const bioEl = document.getElementById("bio-text");
  if (bioEl) {
    bioEl.textContent = "";
    let i = 0;
    const type = setInterval(() => {
      if (i < bioText.length) {
        bioEl.textContent += bioText.charAt(i);
        i++;
      } else clearInterval(type);
    }, 30);
  }

  if (aboutStatsInterval) clearInterval(aboutStatsInterval);

  aboutStatsInterval = setInterval(() => {
    // 1. Generate new data points
    // CPU: random 10-60% w/ slight variation
    const cpu = Math.floor(Math.random() * 50) + 10;

    // Mem: random 4-12GB (converted to % of 16GB)
    const memRaw = parseFloat((Math.random() * 4 + 6).toFixed(1));
    const memPct = (memRaw / 16) * 100;

    // Net: random 20-90%
    const net = Math.floor(Math.random() * 70) + 20;

    // 2. Update Charts History
    cpuHistory.shift(); cpuHistory.push(cpu);
    memHistory.shift(); memHistory.push(memPct);
    netHistory.shift(); netHistory.push(net);

    // 3. Draw Charts & Update Text
    const cpuCanvas = document.getElementById("cpu-chart");
    if (cpuCanvas) {
      drawSparkline(cpuCanvas.getContext("2d"), cpuHistory, "rgba(59, 130, 246, 1)"); // Blue
      const cpuVal = document.getElementById("cpu-val");
      if (cpuVal) cpuVal.innerText = cpu + "%";
    }

    const memCanvas = document.getElementById("mem-chart");
    if (memCanvas) {
      drawSparkline(memCanvas.getContext("2d"), memHistory, "rgba(16, 185, 129, 1)"); // Emerald
      const memVal = document.getElementById("mem-val");
      if (memVal) memVal.innerText = memRaw + "GB";
    }

    const netCanvas = document.getElementById("net-chart");
    if (netCanvas) {
      drawSparkline(netCanvas.getContext("2d"), netHistory, "rgba(6, 182, 212, 1)"); // Cyan
      const netVal = document.getElementById("net-load-val");
      if (netVal) netVal.innerText = net + "%";
    }
  }, 1000);
}

window.toggleAbout = (show) => {
  if (window.playTacticalSound) window.playTacticalSound(show ? "success" : "click");
  const overlay = document.getElementById("about-overlay");
  if (overlay) {
    overlay.classList.toggle("hidden", !show);
    if (show) {
      initTrafficCanvas();
      startAboutStats();
    } else {
      if (aboutStatsInterval) clearInterval(aboutStatsInterval);
      stopTrafficCanvas();
    }
  }
};

const cliInput = document.getElementById("cli-input");
const cliOutput = document.getElementById("cli-output");

function appendLog(text, colorClass) {
  if (!cliOutput) return;
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
      if (window.playTacticalSound) window.playTacticalSound("click");
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
        if (window.playTacticalSound) window.playTacticalSound("success");
      } catch (err) {
        appendLog(`> ERROR: UPLINK FAILED.`, "text-red-500");
      }
    }
  });
}
window.appendLog = appendLog;