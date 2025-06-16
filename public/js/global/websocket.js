// public/js/global/websocket.js

let socket;

function initWebSocket() {
  socket = new WebSocket(`ws://${window.location.host}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connecté");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (typeof handleMessage === 'function') {
      handleMessage(data); // délégué à zone.js, mj.js, etc.
    }
  };

  socket.onclose = () => {
    console.log("❌ WebSocket déconnecté");
  };

  socket.onerror = (err) => {
    console.error("Erreur WebSocket :", err);
  };
}

function sendMessage(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

function onMessage(callback) {
  window.handleMessage = callback;
}

export { initWebSocket, sendMessage, onMessage };
