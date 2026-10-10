async function checkDevIndicator() {
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

  await send("Page.navigate", { url: "http://localhost:3000" });
  await new Promise(r => setTimeout(r, 2500));

  const check = await send("Runtime.evaluate", {
    expression: `(() => {
      // Check for Next.js dev indicator in shadow DOM or main DOM
      const indicator = document.querySelector('nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-indicator]');
      const nButton = Array.from(document.querySelectorAll('button, div')).find(el => {
        const text = el.textContent.trim();
        const rect = el.getBoundingClientRect();
        return (rect.bottom > window.innerHeight - 80 && rect.left < 80 && rect.width < 50 && rect.height < 50 && text === 'N');
      });
      return {
        hasPortal: !!indicator,
        hasNButton: !!nButton,
      };
    })()`,
    returnByValue: true
  });

  console.log("Indicator Check:", check?.result?.value);
  ws.close();
  process.exit(0);
}

checkDevIndicator();
