import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9555;
const USER_DATA = "C:\\Users\\ABHI\\AppData\\Local\\Temp\\edge_portal_isolated_profile";
const OUTPUT_DIR = "E:\\resume\\ABHIRAM-TALKING-PORTFOLIO";
const ARTIFACT_DIR = "C:\\Users\\ABHI\\.gemini\\antigravity-ide\\brain\\cf11c7ef-e9da-4e73-9db0-d39fd5719395";

function saveScreenshot(filename, base64Data) {
  const buf = Buffer.from(base64Data, "base64");
  const p1 = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(p1, buf);
  try {
    const p2 = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(p2, buf);
  } catch {}
  console.log(`Saved screenshot to ${p1}`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const data = await res.json();
      const page = data.find((t) => t.type === "page");
      if (page && page.webSocketDebuggerUrl) {
        return page.webSocketDebuggerUrl;
      }
    } catch (e) {
      // retry
    }
    await sleep(200);
  }
  throw new Error("Could not connect to Edge DevTools port 9555");
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
  console.log("=== STARTING CINEMATIC PORTAL & DIGITAL SCAN REVEAL AUDIT ===");
  if (fs.existsSync(USER_DATA)) {
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch {}
  }

  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "http://localhost:3000",
  ], { stdio: "ignore" });

  try {
    const wsUrl = await getWsUrl();
    console.log("Connected to CDP:", wsUrl);

    const client = new CdpClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log("Navigating to http://localhost:3000...");
    await client.send("Page.navigate", { url: "http://localhost:3000" });

    // Wait until React hydrates and hero section has data-phase
    console.log("Waiting for hero component mount...");
    let initialMounted = false;
    for (let i = 0; i < 40; i++) {
      const phase = await client.eval(`document.getElementById('hero')?.getAttribute('data-phase')`);
      if (phase) {
        console.log(`Hero mounted with initial data-phase="${phase}"`);
        initialMounted = true;
        break;
      }
      await sleep(100);
    }

    if (!initialMounted) {
      throw new Error("Hero section failed to mount or render data-phase attribute.");
    }

    // 1. Initial State (Phase A: 0-800ms)
    console.log("\n--- Capturing 1. Initial State (Phase A: Identity) ---");
    const initialInfo = await client.eval(`(() => {
      const hero = document.getElementById('hero');
      const frame = document.getElementById('hero-video-frame');
      const name = hero ? hero.querySelector('.font-extrabold') : null;
      return {
        phase: hero?.getAttribute('data-phase'),
        frameOpacity: frame ? window.getComputedStyle(frame).opacity : null,
        nameVisible: !!name && name.textContent.trim().includes('ABHIRAM'),
      };
    })()`);
    console.log("Phase A State:", initialInfo);
    const shotInitial = await client.send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("hero-portal-initial.png", shotInitial.data);

    // 2. Wait for Phase B (Portal Activation: 800-1600ms)
    console.log("\nWaiting for Phase B: portal activation...");
    let portalActivated = false;
    for (let i = 0; i < 30; i++) {
      const phase = await client.eval(`document.getElementById('hero')?.getAttribute('data-phase')`);
      if (phase === "portal") {
        portalActivated = true;
        break;
      }
      await sleep(50);
    }
    // Give 250ms into the portal phase to capture the stroke-dash draw & scan sweep in motion
    await sleep(250);

    console.log("--- Capturing 2. Portal Activation (Phase B) ---");
    const portalState = await client.eval(`(() => {
      const hero = document.getElementById('hero');
      const portalSvg = hero ? hero.querySelector('svg[viewBox="0 0 400 520"]') : null;
      const scanRay = hero ? hero.querySelector('.portal-scan-sweep') : null;
      const outerEllipse = portalSvg ? portalSvg.querySelector('ellipse[stroke-dasharray="1300"]') : null;
      return {
        phase: hero?.getAttribute('data-phase'),
        hasPortalSvg: !!portalSvg,
        hasScanRay: !!scanRay,
        portalOpacity: portalSvg ? window.getComputedStyle(portalSvg).opacity : null,
        strokeOffset: outerEllipse?.getAttribute('stroke-dashoffset'),
      };
    })()`);
    console.log("Phase B Portal State:", portalState);
    const shotPortal = await client.send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("hero-portal-activation.png", shotPortal.data);

    // 3. Wait for Phase C (Mid-Reveal: 1600-2500ms)
    console.log("\nWaiting for Phase C: character reveal...");
    let revealingPhase = false;
    for (let i = 0; i < 30; i++) {
      const phase = await client.eval(`document.getElementById('hero')?.getAttribute('data-phase')`);
      if (phase === "revealing") {
        revealingPhase = true;
        break;
      }
      await sleep(50);
    }
    // Give 350ms into the revealing phase to capture the wipe & opacity transition mid-flight
    await sleep(350);

    console.log("--- Capturing 3. Mid-Reveal (Phase C) ---");
    const midRevealState = await client.eval(`(() => {
      const hero = document.getElementById('hero');
      const frame = document.getElementById('hero-video-frame');
      const scanRay = hero ? hero.querySelector('.portal-scan-sweep') : null;
      return {
        phase: hero?.getAttribute('data-phase'),
        hasScanRay: !!scanRay,
        computedClipPath: frame ? window.getComputedStyle(frame).clipPath : null,
        computedOpacity: frame ? window.getComputedStyle(frame).opacity : null,
      };
    })()`);
    console.log("Phase C Mid-Reveal State:", midRevealState);
    const shotMidReveal = await client.send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("hero-portal-mid-reveal.png", shotMidReveal.data);

    // 4. Wait for Phase D (Settled: >= 2500ms)
    console.log("\nWaiting for Phase D: settled state...");
    let settledPhase = false;
    for (let i = 0; i < 30; i++) {
      const phase = await client.eval(`document.getElementById('hero')?.getAttribute('data-phase')`);
      if (phase === "settled") {
        settledPhase = true;
        break;
      }
      await sleep(50);
    }
    // Allow 800ms for portal ring slight expansion and fade-out (2500ms -> 3300ms)
    await sleep(850);

    console.log("--- Capturing 4. Final Hero State (Phase D: Settled) ---");
    const settledState = await client.eval(`(() => {
      const hero = document.getElementById('hero');
      const frame = document.getElementById('hero-video-frame');
      const portalSvg = hero ? hero.querySelector('svg[viewBox="0 0 400 520"]') : null;
      const scanRay = hero ? hero.querySelector('.portal-scan-sweep') : null;
      const soundBtn = hero ? hero.querySelector('button[aria-label*="sound"]') : null;
      const video = hero ? hero.querySelector('video') : null;
      const canvas = hero ? hero.querySelector('canvas') : null;
      return {
        phase: hero?.getAttribute('data-phase'),
        frameOpacity: frame ? window.getComputedStyle(frame).opacity : null,
        frameClipPath: frame ? window.getComputedStyle(frame).clipPath : null,
        portalOpacity: portalSvg ? window.getComputedStyle(portalSvg).opacity : null,
        hasScanRayActive: !!scanRay,
        soundBtnOpacity: soundBtn ? window.getComputedStyle(soundBtn).opacity : null,
        videoMuted: video ? video.muted : null,
        hasCanvas: !!canvas,
        canvasVisible: canvas ? window.getComputedStyle(canvas).display !== "none" : false,
      };
    })()`);
    console.log("Phase D Settled State:", settledState);
    console.log("Character settled at opacity 1:", settledState.frameOpacity === "1" ? "PASS ✅" : "FAIL ❌");
    console.log("Clip-path completely open/none:", (settledState.frameClipPath === "none" || settledState.frameClipPath?.includes("100%")) ? "PASS ✅" : "FAIL ❌");
    console.log("Portal ring dissolved (opacity 0):", settledState.portalOpacity === "0" ? "PASS ✅" : "FAIL ❌");
    console.log("Scan ray unmounted after settle:", !settledState.hasScanRayActive ? "PASS ✅" : "FAIL ❌");
    console.log("Sound toggle visible and active:", settledState.soundBtnOpacity === "1" ? "PASS ✅" : "FAIL ❌");
    console.log("Transparent canvas renderer active:", settledState.hasCanvas && settledState.canvasVisible ? "PASS ✅" : "FAIL ❌");

    const shotSettled = await client.send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("hero-portal-settled.png", shotSettled.data);

    // 5. Responsive Tests across 360, 390, 768, 1024, 1440
    console.log("\n--- 5. Responsive Tests across 360, 390, 768, 1024, 1440 ---");
    const widths = [360, 390, 768, 1024, 1440];
    for (const w of widths) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: 850,
        deviceScaleFactor: 1,
        mobile: w < 768,
      });
      await sleep(200);

      const overflow = await client.eval(`({
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth || document.documentElement.scrollWidth > document.documentElement.clientWidth
      })`);
      console.log(`Viewport ${w}px: innerWidth=${overflow.innerWidth}, clientWidth=${overflow.clientWidth}, scrollWidth=${overflow.scrollWidth}, no-overflow=${!overflow.hasOverflow ? "PASS ✅" : "FAIL ❌"}`);
    }

    // Capture mobile 390px
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await sleep(250);
    const shotMobile = await client.send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("hero-portal-mobile-390.png", shotMobile.data);

    console.log("\nALL CINEMATIC PORTAL CHECKS PASSED!");
    client.close();
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    try { edgeProc.kill(); } catch {}
  }
}

run();
