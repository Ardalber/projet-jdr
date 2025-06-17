// public/js/zone.js

const ws = new WebSocket(`ws://${window.location.host}`);

const zoneJeu = document.getElementById("fond-image"); // ton div fond-image
const playerList = document.getElementById("player-list"); // ajoute dans zone.html si besoin
const diceList = document.getElementById("liste-des");
const btnToggleDice = document.getElementById("toggle-dice-btn");

let joueurs = [];
let des = [];
let currentUser = localStorage.getItem("currentUser");
let currentRole = localStorage.getItem("currentRole");
let playerActive = null;
let fondActif = ""; // URL de l'image de fond

// Connexion WebSocket ouverte
ws.addEventListener("open", () => {
  // Demande l'état initial (joueurs, dés, fond)
  ws.send(JSON.stringify({ type: "getInitialState" }));
});

// Réception des messages
ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "initialState":
      joueurs = data.joueurs;
      des = data.des;
      playerActive = data.playerActive;
      fondActif = data.fondActif;
      majListeJoueurs();
      majListeDes();
      setBackgroundImage(fondActif);
      break;

    case "updatePlayers":
      joueurs = data.joueurs;
      playerActive = data.playerActive;
      majListeJoueurs();
      break;

    case "updateDice":
      des = data.des;
      majListeDes();
      break;

    case "updateFond":
      fondActif = data.fondActif;
      setBackgroundImage(fondActif);
      break;

    default:
      console.warn("Message inconnu:", data);
  }
});

// Met à jour la liste des joueurs à afficher
function majListeJoueurs() {
  // Si tu n'as pas d'élément player-list dans ton HTML, tu peux l'ajouter ou enlever cette fonction
  if (!playerList) return;

  playerList.innerHTML = "";
  joueurs.forEach((joueur) => {
    if (joueur.role === "MJ") return; // Ne pas afficher le MJ

    const li = document.createElement("li");
    li.textContent = joueur.pseudo;

    if (joueur.pseudo === playerActive) {
      li.style.color = "green";
      li.style.fontWeight = "bold";
    }

    if (currentRole === "MJ") {
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        let nouveauActif = joueur.pseudo === playerActive ? null : joueur.pseudo;
        ws.send(JSON.stringify({ type: "setPlayerActive", playerActive: nouveauActif }));
      });
    }

    playerList.appendChild(li);
  });
}

// Met à jour la liste des dés affichés
function majListeDes() {
  diceList.innerHTML = "";

  des.forEach((de, index) => {
    const li = document.createElement("li");
    li.textContent = `Dé ${de.type} : ${de.valeur}`;

    // Si joueur actif, ajout bouton supprimer
    if (currentUser === playerActive) {
      const btnSuppr = document.createElement("button");
      btnSuppr.textContent = "Supprimer";
      btnSuppr.style.marginLeft = "10px";
      btnSuppr.addEventListener("click", () => {
        supprimerDe(index);
      });
      li.appendChild(btnSuppr);
    }

    diceList.appendChild(li);
  });
}

// Change le fond
function setBackgroundImage(url) {
  if (!url) {
    zoneJeu.style.backgroundImage = "";
    return;
  }
  zoneJeu.style.backgroundImage = `url(${url})`;
  zoneJeu.style.backgroundSize = "contain";
  zoneJeu.style.backgroundRepeat = "no-repeat";
  zoneJeu.style.backgroundPosition = "center";
}

// Ajoute un dé, appelé par les boutons dans zone.html
function ajouterDe(type) {
  if (currentUser !== playerActive) {
    alert("Seul le joueur actif peut ajouter un dé.");
    return;
  }
  ws.send(JSON.stringify({ type: "addDice", diceType: type }));
}

// Lance les dés, appelé par bouton
function lancerDes() {
  if (currentUser !== playerActive) {
    alert("Seul le joueur actif peut lancer les dés.");
    return;
  }
  ws.send(JSON.stringify({ type: "rollDice" }));
}

// Supprime un dé, appelé par bouton dans la liste
function supprimerDe(index) {
  if (currentUser !== playerActive) {
    alert("Seul le joueur actif peut supprimer un dé.");
    return;
  }
  ws.send(JSON.stringify({ type: "removeDice", index }));
}

// Réduire/agrandir zone dés
btnToggleDice.addEventListener("click", () => {
  const zoneDes = document.getElementById("zone-des");
  if (zoneDes.style.display === "none") {
    zoneDes.style.display = "block";
    btnToggleDice.textContent = "Réduire";
  } else {
    zoneDes.style.display = "none";
    btnToggleDice.textContent = "Agrandir";
  }
});
