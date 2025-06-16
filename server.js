// 1. server.js

const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware : servir les fichiers statiques depuis public/
app.use(express.static(path.join(__dirname, 'public')));

// Redirection de la racine vers index.html
app.get('/', (req, res) => {
  res.redirect('/html/index.html');
});

// Exemple : gestion WebSocket de base
wss.on('connection', (ws) => {
  console.log('Client WebSocket connecté.');

  ws.on('message', (message) => {
    console.log('Message reçu :', message);

    // Diffuser à tous les autres clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client WebSocket déconnecté.');
  });
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur en ligne : http://localhost:${PORT}`);
});
