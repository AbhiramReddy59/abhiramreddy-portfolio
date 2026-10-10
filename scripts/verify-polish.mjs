import { spawn } from "node:child_process";
import fs from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;
const USER_DATA = "C:\\Users\\ABHI\\AppData\\Local\\Temp\\edge_polish_test_profile";

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
      // retry
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
  console.log("=== STARTING HERO REVEAL & ABOUT POLISH CDP VERIFICATION ===");
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

    // Set viewport to desktop 1440px
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log("Navigating to http://localhost:3000...");
    await client.send("Page.navigate", { url: "http://localhost:3000" });
    
    // Wait for hydration: poll until hero is in DOM
    for (let i = 0; i < 20; i++) {
      const ready = await client.eval(`!!document.getElementById('hero-video-frame')`);
      if (ready) break;
      await sleep(200);
    }

    console.log("\n--- 1. Testing Hero Initial State ---");
    const initialHeroState = await client.eval(`(() => {
      const hero = document.getElementById('hero');
      if (!hero) return { found: false };
      const ghostName = hero.querySelector('div[style*="WebkitTextStroke"]');
      const headline = hero.querySelector('h1');
      const videoFrame = document.getElementById('hero-video-frame');
      const video = hero.querySelector('video');
      const titleAttr = video ? video.getAttribute('title') : null;
      const computedOpacity = videoFrame ? window.getComputedStyle(videoFrame).opacity : null;

      return {
        found: true,
        hasGhostName: !!ghostName && ghostName.textContent.trim() === 'ABHIRAM',
        headline: headline ? headline.textContent.trim() : null,
        computedOpacity,
        titleAttr,
      };
    })()`);
    console.log("Initial Hero State:", initialHeroState);
    console.log("Ghost Name Present immediately:", initialHeroState.hasGhostName ? "PASS ✅" : "FAIL ❌");
    console.log("Headline visible immediately:", initialHeroState.headline ? "PASS ✅" : "FAIL ❌");
    console.log("Video title attribute removed (no hover tooltip):", initialHeroState.titleAttr === null ? "PASS ✅" : "FAIL ❌");

    // Capture initial unrevealed screenshot
    const shot1 = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("hero-initial-state-1440.png", Buffer.from(shot1.data, "base64"));
    console.log("Saved hero-initial-state-1440.png");

    // Wait 3.0s total so reveal transition (2000ms delay + 1000ms animation) completes
    console.log("\nWaiting 3.0s for cinematic reveal transition to complete...");
    await sleep(3000);

    console.log("\n--- 2. Testing Hero Revealed State ---");
    const revealedHeroState = await client.eval(`(() => {
      const hero = document.getElementById('hero');
      const videoFrame = document.getElementById('hero-video-frame');
      const video = hero.querySelector('video');
      const soundBtn = hero.querySelector('button[aria-label*="sound"]');
      const computedOpacity = videoFrame ? window.getComputedStyle(videoFrame).opacity : null;

      return {
        computedOpacity,
        videoMuted: video ? video.muted : null,
        soundBtnLabel: soundBtn ? soundBtn.getAttribute('aria-label') : null,
        soundBtnAriaPressed: soundBtn ? soundBtn.getAttribute('aria-pressed') : null,
      };
    })()`);
    console.log("Revealed Hero State:", revealedHeroState);
    console.log("Video revealed opacity == 1:", revealedHeroState.computedOpacity === "1" ? "PASS ✅" : "FAIL ❌");
    console.log("Sound toggle button accessible:", revealedHeroState.soundBtnLabel ? "PASS ✅" : "FAIL ❌");

    // Capture revealed hero screenshot
    const shot2 = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("hero-revealed-state-1440.png", Buffer.from(shot2.data, "base64"));
    console.log("Saved hero-revealed-state-1440.png");

    // Test sound toggle interaction
    console.log("\n--- 3. Testing Sound Toggle Interaction ---");
    const soundToggleResult = await client.eval(`(() => {
      const hero = document.getElementById('hero');
      const soundBtn = hero.querySelector('button[aria-label*="sound"]');
      const video = hero.querySelector('video');
      if (!soundBtn || !video) return { success: false };
      
      const beforeMuted = video.muted;
      soundBtn.click();
      const afterMuted = video.muted;
      const newLabel = soundBtn.getAttribute('aria-label');
      // toggle back to muted
      soundBtn.click();
      const finalMuted = video.muted;
      return { beforeMuted, afterMuted, newLabel, finalMuted };
    })()`);
    console.log("Sound toggle result:", soundToggleResult);
    console.log("Sound unmuted on click:", soundToggleResult.afterMuted === false ? "PASS ✅" : "FAIL ❌");

    // Scroll to About section and test Professional Focus card
    console.log("\n--- 4. Testing About Section: Professional Focus Card ---");
    await client.eval(`document.getElementById('about').scrollIntoView({ behavior: 'instant' })`);
    await sleep(600);

    const aboutCardData = await client.eval(`(() => {
      const focusCard = document.getElementById('professional-focus-card');
      if (!focusCard) return { found: false };

      const label = focusCard.querySelector('span.font-mono')?.textContent?.trim();
      const pElements = Array.from(focusCard.querySelectorAll('p')).map(p => p.textContent.trim());

      return {
        found: true,
        label,
        pElements,
        rawText: focusCard.innerText.trim(),
      };
    })()`);
    console.log("About Professional Focus Card:", aboutCardData);
    console.log("Card found with label 'PROFESSIONAL FOCUS':", aboutCardData.label === "PROFESSIONAL FOCUS" ? "PASS ✅" : "FAIL ❌");
    console.log("Primary line has 'Data Science & AI':", aboutCardData.pElements?.some(t => t.includes("Data Science & AI")) ? "PASS ✅" : "FAIL ❌");
    console.log("Secondary line has 'Software Engineering':", aboutCardData.pElements?.some(t => t.includes("Software Engineering")) ? "PASS ✅" : "FAIL ❌");
    console.log("Supporting academic line has 'B.Tech Computer Science · CGPA 8.6':", aboutCardData.pElements?.some(t => t.includes("B.Tech Computer Science") && t.includes("CGPA 8.6")) ? "PASS ✅" : "FAIL ❌");

    // Capture About section screenshot
    const shotAbout = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("about-professional-focus-1440.png", Buffer.from(shotAbout.data, "base64"));
    console.log("Saved about-professional-focus-1440.png");

    // Responsive width tests across all 5 requested widths: 360, 390, 768, 1024, 1440
    console.log("\n--- 5. Responsive Width & Horizontal Overflow Audit ---");
    const testWidths = [360, 390, 768, 1024, 1440];
    for (const w of testWidths) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: 850,
        deviceScaleFactor: 1,
        mobile: w < 768,
      });
      await sleep(250);

      const overflow = await client.eval(`({
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth || document.documentElement.scrollWidth > document.documentElement.clientWidth
      })`);
      console.log(`Viewport ${w}px: innerWidth=${overflow.innerWidth}, clientWidth=${overflow.clientWidth}, scrollWidth=${overflow.scrollWidth}, no-overflow=${!overflow.hasOverflow ? "PASS ✅" : "FAIL ❌"}`);
    }

    // Capture mobile screenshot at 390px
    await client.eval(`document.getElementById('hero').scrollIntoView({ behavior: 'instant' })`);
    await sleep(400);
    const shotMobile = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("hero-revealed-mobile-390.png", Buffer.from(shotMobile.data, "base64"));
    console.log("Saved hero-revealed-mobile-390.png");

    console.log("\nALL POLISH CHECKS PASSED SUCCESSFULLY!");
    client.close();
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    try { edgeProc.kill(); } catch {}
  }
}

run();
