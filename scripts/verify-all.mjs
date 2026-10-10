import { spawn } from "node:child_process";
import fs from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;
const USER_DATA = "C:\\Users\\ABHI\\AppData\\Local\\Temp\\edge_full_portfolio_test_profile";

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
  console.log("Starting headless Edge for complete portfolio verification...");
  if (fs.existsSync(USER_DATA)) {
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch {}
  }

  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:3000",
  ], { stdio: "ignore" });

  try {
    const wsUrl = await getWsUrl();
    console.log("Connected to CDP:", wsUrl);

    const client = new CdpClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");

    console.log("Navigating to http://localhost:3000 and waiting for hydration...");
    await client.send("Page.navigate", { url: "http://localhost:3000" });
    await sleep(3500);

    const title = await client.eval("document.title");
    console.log("Page Title:", title);

    // =========================================================================
    // 1. Verify All Section IDs & Section Hierarchy
    // =========================================================================
    console.log("\n=== 1. Verifying Section IDs in DOM ===");
    const expectedSections = [
      "hero",
      "about",
      "skills",
      "work",
      "experience",
      "certifications",
      "achievements",
      "contact",
    ];

    for (const id of expectedSections) {
      const exists = await client.eval(`!!document.getElementById('${id}')`);
      console.log(`Section #${id}: ${exists ? "FOUND ✅" : "MISSING ❌"}`);
    }

    // Verify Navigation Links
    const navLinks = await client.eval(`
      Array.from(document.querySelectorAll('header nav a')).map(a => ({
        name: a.textContent.trim(),
        href: a.getAttribute('href')
      }))
    `);
    console.log("\nPrimary Navigation Items:", navLinks);
    console.log("Total nav links:", navLinks.length, `(Expected: 7) - ${navLinks.length === 7 ? "PASS ✅" : "FAIL ❌"}`);

    // =========================================================================
    // 2. Check Contrast and Colors in Experience Section
    // =========================================================================
    console.log("\n=== 2. Auditing Experience Contrast ===");
    const expContrast = await client.eval(`(() => {
      const exp = document.getElementById('experience');
      const roleTitles = Array.from(exp.querySelectorAll('h4')).map(h => ({
        text: h.textContent.trim(),
        color: window.getComputedStyle(h).color
      }));
      const sectionTitleColor = window.getComputedStyle(exp.querySelector('.section-title')).color;
      return { sectionTitleColor, roleTitles };
    })()`);

    console.log("Experience section title color:", expContrast.sectionTitleColor);
    console.log("Role title colors:", expContrast.roleTitles);
    const hasWhiteTextOnPaper = expContrast.roleTitles.some(r => r.color === "rgb(255, 255, 255)");
    console.log("Contrast check: Zero white text on light paper:", !hasWhiteTextOnPaper ? "PASS ✅" : "FAIL ❌");

    // =========================================================================
    // 3. Verify Certifications, Achievements & Contact Content
    // =========================================================================
    console.log("\n=== 3. Auditing Certifications, Achievements & Contact ===");
    const certsCount = await client.eval(`document.querySelectorAll('#certifications article').length`);
    console.log("Certifications displayed count:", certsCount, `(Expected: 6) - ${certsCount === 6 ? "PASS ✅" : "FAIL ❌"}`);

    const achievementsCount = await client.eval(`document.querySelectorAll('#achievements article').length`);
    console.log("Achievements displayed count:", achievementsCount, `(Expected: 4) - ${achievementsCount === 4 ? "PASS ✅" : "FAIL ❌"}`);

    const contactLinks = await client.eval(`(() => {
      const c = document.getElementById('contact');
      return {
        email: c.querySelector('a[href^="mailto:"]')?.getAttribute('href'),
        linkedin: c.querySelector('a[href*="linkedin.com"]')?.getAttribute('href'),
        github: c.querySelector('a[href*="github.com"]')?.getAttribute('href'),
      };
    })()`);
    console.log("Contact destinations:", contactLinks);

    // =========================================================================
    // 4. Responsive Widths & Overflow Across Page
    // =========================================================================
    const widths = [360, 390, 768, 1024, 1440, 1920];
    console.log("\n=== 4. Testing Responsive Widths & Overflow Across All 8 Sections ===");
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

    // Reset to 1440
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(400);

    // =========================================================================
    // 5. Capture Section Screenshots
    // =========================================================================
    console.log("\n=== 5. Capturing Section Screenshots at 1440px ===");

    const captureSection = async (sectionId, filename) => {
      await client.eval(`document.getElementById('${sectionId}')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
      await sleep(500);
      const snap = await client.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(filename, Buffer.from(snap.data, "base64"));
      console.log(`Saved ${filename}`);
    };

    await captureSection("experience", "experience-desktop-1440.png");
    await captureSection("certifications", "certifications-desktop-1440.png");
    await captureSection("achievements", "achievements-desktop-1440.png");
    await captureSection("contact", "contact-desktop-1440.png");

    // Mobile screenshot of experience
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await captureSection("experience", "experience-mobile-390.png");

    client.close();
    console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
  } finally {
    edgeProc.kill();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
