async function check() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        const frame = document.getElementById("hero-video-frame");
        return {
          className: frame ? frame.className : null,
          style: frame ? window.getComputedStyle(frame).cssText : null,
          opacity: frame ? window.getComputedStyle(frame).opacity : null,
          transform: frame ? window.getComputedStyle(frame).transform : null,
        };
      })()`,
      returnByValue: true
    }
  }));

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log("Evaluation Result:", data.result?.result?.value);
    ws.close();
    process.exit(0);
  };
}

check();
