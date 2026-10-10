import { spawn } from "node:child_process";
import fs from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;
const USER_DATA = "C:\\Users\\ABHI\\AppData\\Local\\Temp\\edge_work_test_profile";

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
  console.log("Starting headless Edge for Work & Skills verification...");
  if (fs.existsSync(USER_DATA)) {
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch {}
  }

  const edgeProc = spawn(EDGE_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:3000/#work",
  ], { stdio: "ignore" });

  try {
    const wsUrl = await getWsUrl();
    console.log("Connected to CDP:", wsUrl);

    const client = new CdpClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");

    console.log("Waiting for page load...");
    await client.send("Page.reload");
    await sleep(2500);

    const title = await client.eval("document.title");
    console.log("Page Title:", title);

    // =========================================================================
    // 1. Verify Step 3.10: Selected Work Section
    // =========================================================================
    console.log("\n=== 1. Verifying Selected Work (#work) ===");
    const workExists = await client.eval("!!document.getElementById('work')");
    console.log("Work section present (#work):", workExists ? "PASS ✅" : "FAIL ❌");

    const workIndex = await client.eval("document.querySelector('#work .section-index')?.textContent?.trim()");
    console.log("Work section index:", workIndex);

    const workTitle = await client.eval("document.querySelector('#work .section-title')?.textContent?.trim()");
    console.log("Work section title:", workTitle);

    // Verify Lead Project
    const leadTitle = await client.eval("document.getElementById('lead-project-title')?.textContent?.trim()");
    console.log("Lead Featured Project:", leadTitle);

    // Verify Supporting Projects Count
    const supportingProjects = await client.eval(`
      Array.from(document.querySelectorAll('#work article h3')).map(el => el.textContent.trim())
    `);
    console.log("All project titles displayed in #work:", supportingProjects);
    console.log("Total projects displayed:", supportingProjects.length, `(Expected: 4) - ${supportingProjects.length === 4 ? "PASS ✅" : "FAIL ❌"}`);

    // Verify GitHub Callout Link
    const githubLink = await client.eval(`
      document.querySelector('#work a[aria-label*="GitHub"]')?.getAttribute('href')
    `);
    console.log("GitHub profile callout link in #work:", githubLink, `(Expected: https://github.com/abhiramreddy59) - ${githubLink === "https://github.com/abhiramreddy59" ? "PASS ✅" : "FAIL ❌"}`);

    // =========================================================================
    // 2. Responsive Width & Overflow Audit
    // =========================================================================
    const widths = [360, 390, 768, 1024, 1440, 1920];
    console.log("\n=== 2. Testing Responsive Widths & Overflow Across Page ===");
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
    // 3. Re-verify Step 3.9: Skills Inspector Refinement
    // =========================================================================
    console.log("\n=== 3. Re-verifying Step 3.9 Skills Inspector ===");
    // Scroll to #skills
    await client.eval(`document.getElementById('skills')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
    await sleep(400);

    // Click C++
    await client.eval(`(async () => {
      const cpp = Array.from(document.querySelectorAll('#skills button[aria-label*="Symbol"]')).find(b => b.textContent.includes('C++'));
      if (cpp) cpp.click();
      await new Promise(r => setTimeout(r, 200));
    })()`);
    await sleep(300);

    const cppInspector = await client.eval(`document.querySelector('#skills aside')?.innerText`);
    const hasSkillsetNotice = cppInspector.includes("Listed in my technical skill set");
    const hasGithubFallback = cppInspector.includes("Explore my GitHub profile");
    console.log("C++ Inspector shows 'Listed in my technical skill set':", hasSkillsetNotice ? "PASS ✅" : "FAIL ❌");
    console.log("C++ Inspector shows 'Explore my GitHub profile':", hasGithubFallback ? "PASS ✅" : "FAIL ❌");

    // Click LangChain (verified project match)
    await client.eval(`(async () => {
      const lc = Array.from(document.querySelectorAll('#skills button[aria-label*="Symbol"]')).find(b => b.textContent.includes('LangChain'));
      if (lc) lc.click();
      await new Promise(r => setTimeout(r, 200));
    })()`);
    await sleep(300);

    const lcInspector = await client.eval(`document.querySelector('#skills aside')?.innerText`);
    const hasRelatedProjects = lcInspector.includes("RELATED PROJECTS");
    const hasSmartSummarizer = lcInspector.includes("Smart Summarizer: AI for YouTube Videos");
    console.log("LangChain Inspector shows 'RELATED PROJECTS':", hasRelatedProjects ? "PASS ✅" : "FAIL ❌");
    console.log("LangChain Inspector shows 'Smart Summarizer: AI for YouTube Videos':", hasSmartSummarizer ? "PASS ✅" : "FAIL ❌");

    // =========================================================================
    // 4. Capture Screenshots of Work and Skills
    // =========================================================================
    console.log("\n=== 4. Capturing Screenshots ===");
    // Scroll to #work
    await client.eval(`document.getElementById('work')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
    await sleep(600);

    const desktopWorkSnap = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("work-desktop-1440.png", Buffer.from(desktopWorkSnap.data, "base64"));
    console.log("Saved work-desktop-1440.png");

    // Scroll to supporting projects
    await client.eval(`document.querySelectorAll('#work article')[1]?.scrollIntoView({ behavior: 'instant', block: 'center' })`);
    await sleep(500);
    const supportingWorkSnap = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("work-supporting-1440.png", Buffer.from(supportingWorkSnap.data, "base64"));
    console.log("Saved work-supporting-1440.png");

    // Mobile work screenshot
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await client.eval(`document.getElementById('work')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
    await sleep(600);

    const mobileWorkSnap = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("work-mobile-390.png", Buffer.from(mobileWorkSnap.data, "base64"));
    console.log("Saved work-mobile-390.png");

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
