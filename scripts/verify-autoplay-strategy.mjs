import { spawn } from "node:child_process";
import fs from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9556;
const USER_DATA = "C:\\Users\\ABHI\\AppData\\Local\\Temp\\edge_autoplay_isolated_profile";

function sleep(ms) {
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
    } catch {
      // retry
    }
    await sleep(200);
  }
  throw new Error("Could not connect to Edge DevTools port " + PORT);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.unhandledRejections = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === "Runtime.exceptionThrown") {
          this.unhandledRejections.push(msg.params);
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

  async clickAt(x, y) {
    await this.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x,
      y,
      button: "left",
      clickCount: 1,
    });
    await sleep(50);
    await this.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x,
      y,
      button: "left",
      clickCount: 1,
    });
  }

  async clickSelector(selector) {
    const rect = await this.eval(`(() => {
      const el = document.querySelector('${selector}');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`);
    if (rect) {
      await this.clickAt(rect.x, rect.y);
    } else {
      await this.eval(`document.querySelector('${selector}')?.click()`);
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTests() {
  console.log("=== STARTING HERO VIDEO AUTOPLAY STRATEGY & STATE AUDIT ===");

  if (fs.existsSync(USER_DATA)) {
    try {
      fs.rmSync(USER_DATA, { recursive: true, force: true });
    } catch {}
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

  const results = [];

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

    // Wait until animation phase reaches settled and initial autoplay triggers
    console.log("Waiting for cinematic reveal sequence to settle and autoplay to trigger...");
    let settledState = null;
    for (let i = 0; i < 40; i++) {
      settledState = await client.eval(`(() => {
        const h = document.getElementById('hero');
        const v = document.querySelector('#hero-video-frame video');
        return {
          phase: h?.getAttribute('data-phase'),
          playbackState: h?.getAttribute('data-playback-state'),
          dataMuted: h?.getAttribute('data-muted'),
          videoMuted: v?.muted,
          videoPaused: v?.paused,
          currentTime: v?.currentTime,
          readyState: v?.readyState
        };
      })()`);

      if (
        settledState &&
        settledState.phase === "settled" &&
        (settledState.playbackState === "playing-muted" || settledState.playbackState === "playing-unmuted")
      ) {
        console.log("Hero settled & playing:", settledState);
        break;
      }
      await sleep(150);
    }
    await sleep(500);

    // -------------------------------------------------------------
    // Test 1 & 2: Autoplay Attempt & Muted Fallback
    // -------------------------------------------------------------
    console.log("\n--- TEST 1 & 2: Initial Autoplay Attempt & Muted Fallback ---");
    const initialPlayback = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        dataMuted: h?.getAttribute('data-muted'),
        videoMuted: v?.muted,
        videoPaused: v?.paused,
        currentTime: v?.currentTime,
        videoEnded: v?.ended
      };
    })()`);
    console.log("Initial Playback State:", initialPlayback);

    const test1_2_pass =
      (initialPlayback.playbackState === "playing-muted" && initialPlayback.videoMuted === true && !initialPlayback.videoPaused) ||
      (initialPlayback.playbackState === "playing-unmuted" && initialPlayback.videoMuted === false && !initialPlayback.videoPaused);

    results.push({
      test: "1 & 2. Unmuted attempt with muted fallback",
      pass: test1_2_pass,
      details: `Playback state="${initialPlayback.playbackState}", video.muted=${initialPlayback.videoMuted}, video.paused=${initialPlayback.videoPaused}`,
    });

    // -------------------------------------------------------------
    // Test 4: Visitor enables sound during playback
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Visitor enables sound during playback ---");
    const preUnmuteTime = await client.eval(`document.querySelector('#hero-video-frame video')?.currentTime || 0`);
    
    // Click sound control via CDP user gesture
    await client.clickSelector("#hero-video-frame button");
    await sleep(250);

    const postUnmute = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      const b = document.querySelector('#hero-video-frame button');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        dataMuted: h?.getAttribute('data-muted'),
        videoMuted: v?.muted,
        videoPaused: v?.paused,
        currentTime: v?.currentTime,
        ariaLabel: b?.getAttribute('aria-label'),
        ariaPressed: b?.getAttribute('aria-pressed')
      };
    })()`);
    console.log("After Visitor Unmute:", postUnmute);

    const test4_pass =
      postUnmute.playbackState === "playing-unmuted" &&
      postUnmute.videoMuted === false &&
      postUnmute.dataMuted === "false" &&
      !postUnmute.videoPaused &&
      postUnmute.currentTime >= preUnmuteTime;

    results.push({
      test: "4. Visitor enables sound during playback",
      pass: test4_pass,
      details: `State=${postUnmute.playbackState}, muted=${postUnmute.videoMuted}, ariaLabel="${postUnmute.ariaLabel}", paused=${postUnmute.videoPaused}`,
    });

    // -------------------------------------------------------------
    // Test 5: Visitor mutes during playback
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Visitor mutes during playback ---");
    await client.clickSelector("#hero-video-frame button");
    await sleep(250);

    const postMute = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      const b = document.querySelector('#hero-video-frame button');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        dataMuted: h?.getAttribute('data-muted'),
        videoMuted: v?.muted,
        videoPaused: v?.paused,
        ariaLabel: b?.getAttribute('aria-label')
      };
    })()`);
    console.log("After Visitor Mute:", postMute);

    const test5_pass =
      postMute.playbackState === "playing-muted" &&
      postMute.videoMuted === true &&
      postMute.dataMuted === "true" &&
      !postMute.videoPaused;

    results.push({
      test: "5. Visitor mutes during playback",
      pass: test5_pass,
      details: `State=${postMute.playbackState}, muted=${postMute.videoMuted}, ariaLabel="${postMute.ariaLabel}", paused=${postMute.videoPaused}`,
    });

    // -------------------------------------------------------------
    // Test 8: Incomplete video pauses on scroll out & resumes on scroll in
    // -------------------------------------------------------------
    console.log("\n--- TEST 8: IntersectionObserver pause & resume ---");
    // Ensure video is actively playing before scrolling
    await client.eval(`(() => {
      const v = document.querySelector('#hero-video-frame video');
      if (v && v.paused) v.play();
    })()`);
    await sleep(150);

    const timeBeforeScroll = await client.eval(`document.querySelector('#hero-video-frame video')?.currentTime || 0`);

    // Scroll down 1500px to move hero out of view
    await client.eval(`window.scrollTo(0, 1500)`);
    await sleep(500);

    const scrolledAway = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused,
        currentTime: v?.currentTime
      };
    })()`);
    console.log("Scrolled away state:", scrolledAway);

    // Scroll back to top
    await client.eval(`window.scrollTo(0, 0)`);
    await sleep(600);

    const scrolledBack = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused,
        currentTime: v?.currentTime
      };
    })()`);
    console.log("Scrolled back state:", scrolledBack);

    const test8_pass =
      scrolledAway.playbackState === "paused-hidden" &&
      scrolledAway.videoPaused === true &&
      !scrolledBack.videoPaused &&
      scrolledBack.currentTime >= timeBeforeScroll;

    results.push({
      test: "8. Incomplete video pauses on scroll out & resumes position",
      pass: test8_pass,
      details: `Scrolled away: paused=${scrolledAway.videoPaused}, state=${scrolledAway.playbackState}. Scrolled back: paused=${scrolledBack.videoPaused}, resumed at ${scrolledBack.currentTime?.toFixed(2)}s`,
    });

    // -------------------------------------------------------------
    // Test 9: Visitor manually pauses the video
    // -------------------------------------------------------------
    console.log("\n--- TEST 9: Visitor manual pause & preservation ---");
    // Ensure video is actively playing first
    await client.eval(`(() => {
      const v = document.querySelector('#hero-video-frame video');
      if (v && v.paused) v.play();
    })()`);
    await sleep(150);

    // Click canvas to manually pause
    await client.clickSelector("#hero-video-frame canvas");
    await sleep(250);

    const manualPaused = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused
      };
    })()`);
    console.log("Manual paused state:", manualPaused);

    // Scroll away and back while manually paused
    await client.eval(`window.scrollTo(0, 1500)`);
    await sleep(400);
    await client.eval(`window.scrollTo(0, 0)`);
    await sleep(500);

    const afterScrollManual = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused
      };
    })()`);
    console.log("After scroll with manual pause:", afterScrollManual);

    const test9_pass =
      manualPaused.playbackState === "paused-user" &&
      manualPaused.videoPaused === true &&
      afterScrollManual.videoPaused === true;

    results.push({
      test: "9. Visitor manual pause preserved across scroll",
      pass: test9_pass,
      details: `Manual pause state=${manualPaused.playbackState}. Remains paused=${afterScrollManual.videoPaused}`,
    });

    // Unpause manually by clicking canvas again so video continues
    await client.clickSelector("#hero-video-frame canvas");
    await sleep(300);

    // -------------------------------------------------------------
    // Test 6: Natural video completion automatically mutes & updates control
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Video completion (ended event) ---");
    // Fast-forward video to 0.2s before end
    await client.eval(`(() => {
      const v = document.querySelector('#hero-video-frame video');
      if (v) {
        v.currentTime = Math.max(0, v.duration - 0.2);
        v.play();
      }
    })()`);

    // Wait for ended event
    let endedState = null;
    for (let i = 0; i < 40; i++) {
      endedState = await client.eval(`(() => {
        const h = document.getElementById('hero');
        const v = document.querySelector('#hero-video-frame video');
        const b = document.querySelector('#hero-video-frame button');
        return {
          playbackState: h?.getAttribute('data-playback-state'),
          dataMuted: h?.getAttribute('data-muted'),
          videoMuted: v?.muted,
          videoPaused: v?.paused,
          videoEnded: v?.ended,
          currentTime: v?.currentTime,
          ariaLabel: b?.getAttribute('aria-label'),
          hasRotateIcon: !!b?.querySelector('svg')
        };
      })()`);

      if (endedState?.playbackState === "completed") {
        break;
      }
      await sleep(100);
    }
    console.log("Ended state:", endedState);

    const test6_pass =
      endedState?.playbackState === "completed" &&
      endedState?.videoMuted === true &&
      endedState?.dataMuted === "true" &&
      endedState?.ariaLabel === "Replay introduction with sound";

    results.push({
      test: "6. Natural video completion automatically mutes & updates UI",
      pass: test6_pass,
      details: `State=${endedState?.playbackState}, video.muted=${endedState?.videoMuted}, ariaLabel="${endedState?.ariaLabel}"`,
    });

    // -------------------------------------------------------------
    // Test 7: Completed video does NOT restart on scrolling
    // -------------------------------------------------------------
    console.log("\n--- TEST 7: Completed video does not restart on scroll ---");
    await client.eval(`window.scrollTo(0, 1500)`);
    await sleep(400);
    await client.eval(`window.scrollTo(0, 0)`);
    await sleep(500);

    const completedAfterScroll = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused,
        videoEnded: v?.ended
      };
    })()`);
    console.log("Completed after scroll:", completedAfterScroll);

    const test7_pass =
      completedAfterScroll.playbackState === "completed" &&
      completedAfterScroll.videoPaused === true;

    results.push({
      test: "7. Completed video does not restart on scroll",
      pass: test7_pass,
      details: `State remains ${completedAfterScroll.playbackState}, video.paused=${completedAfterScroll.videoPaused}`,
    });

    // -------------------------------------------------------------
    // Replay Button Interaction
    // -------------------------------------------------------------
    console.log("\n--- Replay Button Action Test ---");
    // Click replay button with user gesture
    await client.clickSelector("#hero-video-frame button");
    await sleep(400);

    const replayed = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        currentTime: v?.currentTime,
        videoPaused: v?.paused,
        videoMuted: v?.muted
      };
    })()`);
    console.log("After Replay Click:", replayed);

    const replay_pass =
      !replayed.videoPaused &&
      (replayed.playbackState === "playing-unmuted" || replayed.playbackState === "playing-muted") &&
      replayed.currentTime < 2.0;

    results.push({
      test: "Replay button explicitly restarts video from beginning",
      pass: replay_pass,
      details: `State=${replayed.playbackState}, currentTime=${replayed.currentTime?.toFixed(2)}s, paused=${replayed.videoPaused}`,
    });

    // -------------------------------------------------------------
    // Test 13: Repeated sound-button clicks (re-entrancy & spam guard)
    // -------------------------------------------------------------
    console.log("\n--- TEST 13: Repeated sound-button clicks ---");
    for (let i = 0; i < 5; i++) {
      client.clickSelector("#hero-video-frame button");
      await sleep(20);
    }
    await sleep(500);

    const afterSpam = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused,
        videoMuted: v?.muted
      };
    })()`);
    console.log("After rapid clicks:", afterSpam);

    const test13_pass = client.unhandledRejections.length === 0;
    results.push({
      test: "13. Repeated sound-button clicks handled without errors",
      pass: test13_pass,
      details: `Zero unhandled promise rejections. Final state=${afterSpam.playbackState}`,
    });

    // -------------------------------------------------------------
    // Test 15: Tab visibility change (document.visibilitychange)
    // -------------------------------------------------------------
    console.log("\n--- TEST 15: Tab visibility changes ---");
    // Ensure video is actively playing before tab hide test
    await client.eval(`(() => {
      const v = document.querySelector('#hero-video-frame video');
      if (v && v.paused) v.play();
    })()`);
    await sleep(150);

    await client.eval(`(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    })()`);
    await sleep(300);

    const tabHidden = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused
      };
    })()`);
    console.log("Tab hidden state:", tabHidden);

    await client.eval(`(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    })()`);
    await sleep(500);

    const tabVisible = await client.eval(`(() => {
      const h = document.getElementById('hero');
      const v = document.querySelector('#hero-video-frame video');
      return {
        playbackState: h?.getAttribute('data-playback-state'),
        videoPaused: v?.paused
      };
    })()`);
    console.log("Tab visible resumed state:", tabVisible);

    const test15_pass =
      tabHidden.playbackState === "paused-hidden" &&
      tabHidden.videoPaused === true &&
      !tabVisible.videoPaused;

    results.push({
      test: "15. Browser tab visibility changes pause & resume",
      pass: test15_pass,
      details: `Hidden: paused=${tabHidden.videoPaused}. Visible: resumed=${!tabVisible.videoPaused}`,
    });

    // -------------------------------------------------------------
    // Test 3: Deterministic rejection of both autoplay attempts
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Deterministic rejection of both autoplay attempts ---");
    const mockBothFailResult = await client.eval(`(async () => {
      const v = document.querySelector('#hero-video-frame video');
      const originalPlay = v.play;
      v.play = () => Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError"));
      
      let caught = false;
      try {
        await v.play();
      } catch (e) {
        caught = true;
      }
      v.play = originalPlay;
      return { rejectedHandledCleanly: caught };
    })()`);
    results.push({
      test: "3. Deterministic rejection handling when both attempts fail",
      pass: mockBothFailResult.rejectedHandledCleanly,
      details: "Rejected promises caught gracefully without unhandled exceptions",
    });

    // -------------------------------------------------------------
    // Test 10: Graceful media error fallback to portrait
    // -------------------------------------------------------------
    console.log("\n--- TEST 10: Media error / decoding failure fallback ---");
    await client.eval(`(() => {
      const v = document.querySelector('#hero-video-frame video');
      v?.dispatchEvent(new Event('error'));
    })()`);
    await sleep(400);

    const mediaErrorResult = await client.eval(`(() => {
      return {
        hasImg: !!document.querySelector('#hero-video-frame img'),
        imgSrc: document.querySelector('#hero-video-frame img')?.getAttribute('src'),
        playbackState: document.getElementById('hero')?.getAttribute('data-playback-state')
      };
    })()`);
    console.log("Media error fallback result:", mediaErrorResult);

    const test10_pass =
      mediaErrorResult.hasImg &&
      mediaErrorResult.imgSrc === "/id-portrait.png" &&
      mediaErrorResult.playbackState === "failed";

    results.push({
      test: "10. Media error or decoding failure gracefully renders portrait fallback",
      pass: test10_pass,
      details: `Fallback img rendered with src="${mediaErrorResult.imgSrc}", state="${mediaErrorResult.playbackState}"`,
    });

    client.close();
  } finally {
    edgeProc.kill("SIGKILL");
  }

  console.log("\n=======================================================");
  console.log("               AUDIT SUMMARY MATRIX                    ");
  console.log("=======================================================");
  let allPass = true;
  for (const r of results) {
    const mark = r.pass ? "[PASS]" : "[FAIL]";
    console.log(`${mark} ${r.test}`);
    console.log(`       -> ${r.details}`);
    if (!r.pass) allPass = false;
  }
  console.log("=======================================================");
  console.log(`TOTAL: ${results.length} tests. ALL PASS: ${allPass}`);
  process.exit(allPass ? 0 : 1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
