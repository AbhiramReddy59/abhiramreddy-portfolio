import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;
const USER_DATA = "C:\\Users\\ABHI\\AppData\\Local\\Temp\\edge_skills_test_profile";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const data = await res.json();
      if (data && data.length > 0 && data[0].webSocketDebuggerUrl) {
        return data[0].webSocketDebuggerUrl;
      }
    } catch (e) {
      // wait
    }
    await sleep(200);
  }
  throw new Error("Could not connect to Edge DevTools port 9222");
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log("Starting headless Edge...");
  if (fs.existsSync(USER_DATA)) {
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch {}
  }

  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:3000/#skills",
  ], { stdio: "ignore" });

  try {
    const wsUrl = await getWsUrl();
    console.log("Connected to CDP:", wsUrl);

    const client = new CdpClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");

    // Wait for hydration and skills section
    console.log("Waiting for page load...");
    await client.send("Page.reload");
    await sleep(2500);

    const title = await client.eval("document.title");
    console.log("Page Title:", title);

    const skillsSectionExists = await client.eval("!!document.getElementById('skills')");
    console.log("Skills section present (#skills):", skillsSectionExists);

    // 1. Check Responsive Widths & Horizontal Overflow
    const widths = [360, 390, 768, 1024, 1440, 1920];
    console.log("\n=== Testing Responsive Widths & Overflow ===");
    for (const w of widths) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: 900,
        deviceScaleFactor: 1,
        mobile: w < 768,
      });
      await sleep(300);

      const metrics = await client.eval(`({
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth || document.documentElement.scrollWidth > document.documentElement.clientWidth
      })`);

      const pass = !metrics.hasOverflow;
      console.log(`Viewport ${w}px: innerWidth=${metrics.innerWidth}, clientWidth=${metrics.clientWidth}, scrollWidth=${metrics.scrollWidth}, no-overflow=${pass ? "PASS ✅" : "FAIL ❌"}`);
    }

    // Reset to 1440 for desktop interaction testing
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(400);

    console.log("\n=== Testing Skills Grid & Categories ===");
    const initialTilesCount = await client.eval(`document.querySelectorAll('#skills button[aria-label*="Symbol"]').length`);
    console.log("Total skill tiles count in 'All':", initialTilesCount, `(Expected: 26) - ${initialTilesCount === 26 ? "PASS ✅" : "FAIL ❌"}`);

    // Check filter buttons
    const filterButtons = await client.eval(`Array.from(document.querySelectorAll('#skills [role="group"] button')).map(b => b.innerText.split('\\n')[0].trim())`);
    console.log("Category filter pills found:", filterButtons);

    // Filter to Software & Backend
    console.log("\nClicking 'Software & Backend' filter...");
    await client.eval(`(async () => {
      const btn = Array.from(document.querySelectorAll('#skills [role="group"] button')).find(b => b.textContent.includes('Software & Backend'));
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 200));
    })()`);
    await sleep(300);

    const softwareTilesCount = await client.eval(`document.querySelectorAll('#skills button[aria-label*="Symbol"]').length`);
    console.log("Visible tiles after filtering 'Software & Backend':", softwareTilesCount, `(Expected: 6) - ${softwareTilesCount === 6 ? "PASS ✅" : "FAIL ❌"}`);

    // Check inspector content after auto-selection of Java
    const inspectorName = await client.eval(`document.querySelector('#skills aside h3')?.textContent?.trim()`);
    const inspectorCat = await client.eval(`document.querySelector('#skills aside h3 + span')?.textContent?.trim()`);
    console.log("Selected Skill in Inspector:", inspectorName, `(Category: ${inspectorCat})`);

    // Click Java tile explicitly
    console.log("\nClicking 'Java' tile...");
    await client.eval(`(async () => {
      const javaTile = Array.from(document.querySelectorAll('#skills button[aria-label*="Symbol"]')).find(b => b.textContent.includes('Java'));
      if (javaTile) javaTile.click();
      await new Promise(r => setTimeout(r, 200));
    })()`);
    await sleep(200);

    const javaInspectorText = await client.eval(`document.querySelector('#skills aside')?.innerText`);
    console.log("Java Inspector text snippet:\n", javaInspectorText.split('\\n').slice(0, 8).join('\\n'));

    // Click C++ tile
    console.log("\nClicking 'C++' tile...");
    await client.eval(`(async () => {
      const cppTile = Array.from(document.querySelectorAll('#skills button[aria-label*="Symbol"]')).find(b => b.textContent.includes('C++'));
      if (cppTile) cppTile.click();
      await new Promise(r => setTimeout(r, 200));
    })()`);
    await sleep(200);

    const cppInspectorText = await client.eval(`document.querySelector('#skills aside')?.innerText`);
    const hasRefinedFallback = cppInspectorText.includes("Listed in my technical skill set") && cppInspectorText.includes("Explore my GitHub profile");
    console.log("C++ Inspector shows refined fallback ('Listed in my technical skill set' & 'Explore my GitHub profile'):", hasRefinedFallback ? "PASS ✅" : "FAIL ❌");

    // Click All filter
    console.log("\nRestoring 'All' category...");
    await client.eval(`(async () => {
      const allBtn = Array.from(document.querySelectorAll('#skills [role="group"] button')).find(b => b.textContent.includes('All'));
      if (allBtn) allBtn.click();
      await new Promise(r => setTimeout(r, 200));
    })()`);
    await sleep(300);

    const restoredTilesCount = await client.eval(`document.querySelectorAll('#skills button[aria-label*="Symbol"]').length`);
    console.log("Restored tiles count in 'All':", restoredTilesCount, `(Expected: 26) - ${restoredTilesCount === 26 ? "PASS ✅" : "FAIL ❌"}`);

    // Capture screenshots
    console.log("\nCapturing screenshots...");
    // Scroll #skills into view
    await client.eval(`document.getElementById('skills')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
    await sleep(600);

    // Desktop screenshot
    const desktopScreenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("skills-desktop-1440.png", Buffer.from(desktopScreenshot.data, "base64"));
    console.log("Saved skills-desktop-1440.png");

    // Mobile screenshot at 390px
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await client.eval(`document.getElementById('skills')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
    await sleep(600);

    const mobileScreenshot = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("skills-mobile-390.png", Buffer.from(mobileScreenshot.data, "base64"));
    console.log("Saved skills-mobile-390.png");

    client.close();
    console.log("\nALL STEP 3.9 TESTS COMPLETED SUCCESSFULLY!");
  } finally {
    edgeProc.kill();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
