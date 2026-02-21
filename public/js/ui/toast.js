/**
 * Toast / snackbar for user feedback (replaces alert for non-critical messages).
 */
const TOAST_DURATION = 4000;
let toastQueue = [];
let toastEl = null;
let toastTimeout = null;

function ensureToastContainer() {
  if (toastEl) return toastEl;
  toastEl = document.getElementById("toast-container");
  if (toastEl) return toastEl;
  toastEl = document.createElement("div");
  toastEl.id = "toast-container";
  toastEl.setAttribute("aria-live", "polite");
  toastEl.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 pointer-events-none max-w-[90vw]";
  document.body.appendChild(toastEl);
  return toastEl;
}

function showNextToast() {
  if (toastQueue.length === 0) return;
  const container = ensureToastContainer();
  const { message, type } = toastQueue.shift();
  const div = document.createElement("div");
  div.className =
    "toast-item px-4 py-3 rounded-xl border font-mono text-xs font-bold tracking-widest shadow-lg pointer-events-auto animate-toast-in " +
    (type === "success"
      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
      : type === "error"
        ? "bg-red-500/15 border-red-500/40 text-red-300"
        : type === "info"
          ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
          : "bg-slate-700/90 border-white/20 text-slate-200");
  div.innerText = message;
  div.setAttribute("role", "status");
  container.appendChild(div);
  toastTimeout = setTimeout(() => {
    div.classList.add("animate-toast-out");
    setTimeout(() => div.remove(), 300);
    toastTimeout = null;
    showNextToast();
  }, TOAST_DURATION);
}

window.showToast = function (message, type = "info") {
  toastQueue.push({ message, type });
  if (!toastTimeout) showNextToast();
};
