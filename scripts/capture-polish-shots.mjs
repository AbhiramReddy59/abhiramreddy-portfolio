import fs from "node:fs";

async function snap() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (e) => {
      const data = JSON.parse(e.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  // Set 1440 desktop
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Scroll to hero
  await send("Runtime.evaluate", {
    expression: "document.getElementById('hero').scrollIntoView({ behavior: 'instant' })"
  });
  await new Promise(r => setTimeout(r, 500));

  const shotHero = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("hero-revealed-state-1440.png", Buffer.from(shotHero.data, "base64"));
  console.log("Saved hero-revealed-state-1440.png");

  // Scroll to about
  await send("Runtime.evaluate", {
    expression: "document.getElementById('about').scrollIntoView({ behavior: 'instant' })"
  });
  await new Promise(r => setTimeout(r, 600));

  const shotAbout = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("about-professional-focus-1440.png", Buffer.from(shotAbout.data, "base64"));
  console.log("Saved about-professional-focus-1440.png");

  // Mobile 390
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await send("Runtime.evaluate", {
    expression: "document.getElementById('hero').scrollIntoView({ behavior: 'instant' })"
  });
  await new Promise(r => setTimeout(r, 500));

  const shotMobile = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("hero-revealed-mobile-390.png", Buffer.from(shotMobile.data, "base64"));
  console.log("Saved hero-revealed-mobile-390.png");

  ws.close();
  console.log("All screenshots captured successfully!");
}

snap();
