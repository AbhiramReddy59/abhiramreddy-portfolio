import { spawn } from "node:child_process";
import fs from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9557;
const USER_DATA = "C:\\Users\\ABHI\\AppData\\Local\\Temp\\edge_security_audit_profile";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const data = await res.json();
      const page = data.find((t) => t.type === "page");
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Could not connect to Edge DevTools port " + PORT);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.cspViolations = [];
    this.consoleErrors = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === "Security.securityStateChanged") {
          // security event
        }
        if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
          this.consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(" "));
        }
        if (msg.method === "Log.entryAdded" && msg.params.entry?.source === "security") {
          this.cspViolations.push(msg.params.entry.text);
        }
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
  console.log("=== RUNNING BROWSER SECURITY & CSP COMPATIBILITY AUDIT ===");

  if (fs.existsSync(USER_DATA)) {
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch {}
  }

  const edgeProc = spawn(
    EDGE_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${USER_DATA}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "http://localhost:3000",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getWsUrl();
    const client = new CdpClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Log.enable");

    console.log("Navigating to http://localhost:3000...");
    await client.send("Page.navigate", { url: "http://localhost:3000" });

    await sleep(3000);

    const auditState = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      const c = document.querySelector('#hero-video-frame canvas');
      const resumeLink = document.querySelector('a[href*="resume.pdf"]');
      return {
        heroMounted: !!h,
        videoSrc: v?.currentSrc || v?.src,
        videoReadyState: v?.readyState,
        canvasWidth: c?.width,
        canvasHeight: c?.height,
        resumeHref: resumeLink?.getAttribute('href'),
        resumeRel: resumeLink?.getAttribute('rel'),
        resumeTarget: resumeLink?.getAttribute('target'),
      };
    })()`);

    console.log("Audit State:", auditState);
    console.log("CSP Violations Detected:", client.cspViolations);
    console.log("Console Errors:", client.consoleErrors);

    client.close();
    edgeProc.kill("SIGKILL");

    const pass = client.cspViolations.length === 0 && auditState.heroMounted;
    console.log(`CSP Compliance Check: ${pass ? "PASS" : "FAIL"}`);
    process.exit(pass ? 0 : 1);
  } catch (err) {
    edgeProc.kill("SIGKILL");
    console.error("Audit error:", err);
    process.exit(1);
  }
}

run();
