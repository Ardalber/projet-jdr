const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Relay messages WebSocket à tous sauf émetteur
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



const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "public/uploads") });
const imagesFile = path.join(__dirname, "data/zoneImages.json");

function loadZoneImages() {
  if (!fs.existsSync(imagesFile)) return [];
  return JSON.parse(fs.readFileSync(imagesFile, "utf8"));
}

function saveZoneImages(images) {
  fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));
}

app.get("/api/zoneImages", (req, res) => {
  res.json(loadZoneImages());
});

app.post("/api/images", upload.single("image"), (req, res) => {
  const images = loadZoneImages();
  const filename = req.file.filename + path.extname(req.file.originalname);
  const targetPath = path.join(__dirname, "public/uploads", filename);
  fs.renameSync(req.file.path, targetPath);
  images.push({ src: "/uploads/" + filename, nom: "" });
  saveZoneImages(images);
  res.sendStatus(200);
});

app.put("/api/images", (req, res) => {
  const { src, nom } = req.body;
  const images = loadZoneImages();
  const image = images.find((img) => img.src === src);
  if (image) image.nom = nom;
  saveZoneImages(images);
  res.sendStatus(200);
});

app.delete("/api/images", (req, res) => {
  const { src } = req.body;
  const images = loadZoneImages();
  const updated = images.filter((img) => img.src !== src);
  if (images.length !== updated.length) {
    const filename = src.split("/").pop();
    const filePath = path.join(__dirname, "public/uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    saveZoneImages(updated);
  }
  res.sendStatus(200);
});
