const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const publicDir = path.join(__dirname, "public");
const uploadDir = path.join(publicDir, "uploads");
const dataDir = path.join(__dirname, "data");
const comptesPath = path.join(dataDir, "comptes.json");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(comptesPath)) {
  fs.writeFileSync(comptesPath, "{}");
}

app.use(express.static(publicDir));
app.use(express.json({ limit: '10mb' }));

// 🔐 Enregistrement d'un compte
app.post("/api/register", (req, res) => {
  const { pseudo, password, role } = req.body;

  if (!pseudo || !password || !role) {
    return res.json({ success: false, message: "Champs manquants." });
  }

  let comptes = {};
  try {
    comptes = JSON.parse(fs.readFileSync(comptesPath, "utf-8"));
  } catch {
    comptes = {};
  }

  if (comptes[pseudo]) {
    return res.json({ success: false, message: "Ce pseudo est déjà pris." });
  }

  comptes[pseudo] = { password, role };
  fs.writeFileSync(comptesPath, JSON.stringify(comptes, null, 2), "utf-8");

  res.json({ success: true });
});

// 🔍 Récupérer tous les comptes
app.get("/api/comptes", (req, res) => {
  try {
    const comptes = JSON.parse(fs.readFileSync(comptesPath, "utf-8"));
    res.json({ success: true, comptes });
  } catch {
    res.json({ success: false, message: "Impossible de lire les comptes." });
  }
});

// ❌ Supprimer un compte
app.delete("/api/comptes/:pseudo", (req, res) => {
  const pseudo = req.params.pseudo;

  try {
    const comptes = JSON.parse(fs.readFileSync(comptesPath, "utf-8"));
    if (!comptes[pseudo]) {
      return res.json({ success: false, message: "Compte introuvable." });
    }

    delete comptes[pseudo];
    fs.writeFileSync(comptesPath, JSON.stringify(comptes, null, 2), "utf-8");

    res.json({ success: true });
  } catch {
    res.json({ success: false, message: "Erreur suppression compte." });
  }
});

// ------------------- WEBSOCKET ET LOGIQUE DE JEU ------------------

let joueurs = [];
let des = [];
let playerActive = null;
let fondActif = "";
let images = [];

images.push({
  nom: "Image par défaut",
  url: "/uploads/default.jpg"
});

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error("Message JSON invalide :", message);
      return;
    }

    switch (data.type) {
      case "getInitialState":
        ws.send(JSON.stringify({
          type: "initialState",
          joueurs,
          des,
          playerActive,
          fondActif
        }));
        break;

      case "setPlayerActive":
        if (!isMJ(ws)) break;
        playerActive = data.playerActive;
        broadcast({ type: "updatePlayers", joueurs, playerActive });
        break;

      case "addDice":
        const newDice = {
          type: data.diceType,
          couleur: data.couleur || "noir",
          valeur: Math.floor(Math.random() * getMax(data.diceType)) + 1
        };
        des.push(newDice);
        broadcast({ type: "updateDice", des });
        break;

      case "rollDice":
        des = des.map(d => ({
          type: d.type,
          couleur: d.couleur,
          valeur: Math.floor(Math.random() * getMax(d.type)) + 1
        }));
        broadcast({ type: "updateDice", des });
        break;

      case "removeDice":
        if (data.index >= 0 && data.index < des.length) {
          des.splice(data.index, 1);
          broadcast({ type: "updateDice", des });
        }
        break;

      case "removeAllDice":
        des = [];
        broadcast({ type: "updateDice", des });
        break;

      case "setFond":
        fondActif = data.fondActif;
        broadcast({ type: "updateFond", fondActif });
        break;

      case "uploadImage":
        if (!isMJ(ws)) break;
        saveImage(data.name, data.data)
          .then(url => {
            images.push({ nom: data.name, url });
            broadcast({ type: "imagesList", images });
          })
          .catch(() => {
            ws.send(JSON.stringify({ type: "error", message: "Erreur upload image." }));
          });
        break;

      case "getImages":
        ws.send(JSON.stringify({ type: "imagesList", images }));
        break;

      case "renameImage":
        if (!isMJ(ws)) break;
        if (images[data.index]) {
          images[data.index].nom = data.newName;
          broadcast({ type: "imagesList", images });
        }
        break;

      case "deleteImage":
        if (!isMJ(ws)) break;
        if (images[data.index]) {
          const img = images.splice(data.index, 1)[0];
          const filePath = path.join(uploadDir, path.basename(img.url));
          fs.unlink(filePath, err => {
            if (err) console.error("Erreur suppression image :", err);
          });
          broadcast({ type: "imagesList", images });
        }
        break;

      default:
        console.warn("Message inconnu :", data);
    }
  });
});

function getMax(type) {
  switch (type) {
    case "D4": return 4;
    case "D6": return 6;
    case "D8": return 8;
    case "D10": return 10;
    case "D12": return 12;
    case "D20": return 20;
    default: return 6;
  }
}

function isMJ(ws) {
  return true; // à sécuriser plus tard
}

function sanitizeFilename(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // supprimer accents
             .replace(/[^a-zA-Z0-9.-]/g, '_');                 // remplacer espaces et autres par _
}

function saveImage(filename, base64Data) {
  return new Promise((resolve, reject) => {
    const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return reject(new Error("Format base64 invalide"));
    const ext = matches[1].split("/")[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");
    const safeName = sanitizeFilename(filename);
    const uniqueName = `${Date.now()}-${safeName}`;
    const filepath = path.join(uploadDir, uniqueName);
    fs.writeFile(filepath, buffer, (err) => {
      if (err) return reject(err);
      resolve(`/uploads/${uniqueName}`);
    });
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});
