// One-off local audit: runs axe-core (same engine as Lighthouse a11y)
// against the production build served by `vite preview`.
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { execSync, spawn } from "child_process";

const axeSource = readFileSync(
  new URL("../node_modules/axe-core/axe.min.js", import.meta.url),
  "utf8"
);

const preview = spawn("npx", ["vite", "preview", "--port", "5198", "--strictPort"], {
  stdio: "ignore",
  shell: true
});
await new Promise((r) => setTimeout(r, 4000));

const browser = await chromium.launch();
const results = {};
try {
  for (const path of ["/", "/country/india/"]) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:5198${path}`, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run({ resultTypes: ["violations"] });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        sample: v.nodes.slice(0, 3).map((n) => n.target.join(" "))
      }));
    });
    results[path] = res;
    await page.close();
  }
} finally {
  await browser.close();
  preview.kill();
}

console.log(JSON.stringify(results, null, 2));
const total = Object.values(results).flat().length;
console.log(`\nTOTAL VIOLATIONS: ${total}`);
process.exit(0);
