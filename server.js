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
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.static(publicDir));
app.use(express.json({ limit: '10mb' })); // Pour réception base64 images

// Données partagées en mémoire
let joueurs = []; // { pseudo, role }
let des = [];     // { type: "D6", valeur: 4 }
let playerActive = null;
let fondActif = "";
let images = [];  // { nom, url }

// Diffuser message à tous les clients
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
        if (!canModifyDice(ws)) break;
        const newDice = { type: data.diceType, valeur: Math.floor(Math.random() * getMax(data.diceType)) + 1 };
        des.push(newDice);
        broadcast({ type: "updateDice", des });
        break;

      case "rollDice":
        if (!canModifyDice(ws)) break;
        des = des.map(d => ({
          type: d.type,
          valeur: Math.floor(Math.random() * getMax(d.type)) + 1
        }));
        broadcast({ type: "updateDice", des });
        break;

      case "removeDice":
        if (!canModifyDice(ws)) break;
        if (data.index >= 0 && data.index < des.length) {
          des.splice(data.index, 1);
          broadcast({ type: "updateDice", des });
        }
        break;

      case "uploadImage":
        if (!isMJ(ws)) break;
        saveImage(data.name, data.data)
          .then(url => {
            images.push({ nom: data.name, url });
            broadcast({ type: "imagesList", images });
          })
          .catch(err => {
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

  // Ici, il faudrait aussi gérer l'ajout et suppression des joueurs selon connexion/déconnexion, rôle, etc.
  // Pour l'instant, c'est simulé.

});

// Fonctions utilitaires

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

// Pour l'instant, on identifie le MJ par un flag simple :
// Ici, tu peux améliorer en stockant les ws dans joueurs avec leurs rôles
function isMJ(ws) {
  // TODO : implémenter authentification / rôle réel
  // Par exemple, stocker ws dans joueurs et vérifier role === "MJ"
  return true; // provisoire, autorise tout pour tester
}

// Vérifier que le client peut modifier les dés
function canModifyDice(ws) {
  // TODO : vérifier si c'est le joueur actif
  return true; // provisoire, autorise tout pour tester
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Envoi du fichier index.html en GET / si besoin
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Fonction pour sauvegarder une image reçue en base64
function saveImage(filename, base64Data) {
  return new Promise((resolve, reject) => {
    const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return reject(new Error("Format base64 invalide"));
    const ext = matches[1].split("/")[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");
    // Générer un nom unique pour éviter écrasement
    const uniqueName = `${Date.now()}-${filename}`;
    const filepath = path.join(uploadDir, uniqueName);
    fs.writeFile(filepath, buffer, (err) => {
      if (err) return reject(err);
      resolve(`/uploads/${uniqueName}`);
    });
  });
}
