const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

const dataDir = path.join(__dirname, "data");
const imagesFile = path.join(dataDir, "zoneImages.json");

function loadZoneImages() {
  if (!fs.existsSync(imagesFile)) return [];
  const data = fs.readFileSync(imagesFile, "utf-8");
  return JSON.parse(data);
}

function saveZoneImages(images) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2), "utf-8");
}

app.get("/api/zoneImages", (req, res) => {
  const images = loadZoneImages();
  res.json(images);
});

app.post("/api/zoneImages", (req, res) => {
  const images = req.body;
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: "Format attendu: tableau JSON" });
  }
  saveZoneImages(images);
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
