
// public/js/zone.js

const ws = new WebSocket(`ws://${window.location.host}`);

const zoneJeu = document.querySelector(".zone-jeu");
const playerList = document.getElementById("player-list");
const diceList = document.getElementById("dice-list");
const btnToggleDice = document.getElementById("toggle-dice-btn");

let joueurs = [];
let des = [];
let currentUser = localStorage.getItem("currentUser");
let currentRole = localStorage.getItem("currentRole");
let playerActive = null;
let fondActif = ""; // URL de l'image de fond

ws.addEventListener("open", () => {
  // Demander état initial (joueurs, dés, fond)
  ws.send(JSON.stringify({ type: "getInitialState" }));
});

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

function majListeJoueurs() {
  playerList.innerHTML = "";
  joueurs.forEach((joueur) => {
    if (joueur.role === "MJ") return; // Ne pas afficher le MJ dans la liste

    const li = document.createElement("li");
    li.textContent = joueur.pseudo;

    // Mettre en surbrillance si joueur actif
    if (joueur.pseudo === playerActive) {
      li.style.color = "green";
      li.style.fontWeight = "bold";
    }

    // Seul MJ peut changer joueur actif (clic)
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

function majListeDes() {
  diceList.innerHTML = "";

  des.forEach((de, index) => {
    const li = document.createElement("li");
    li.textContent = `Dé ${de.type} : ${de.valeur}`;
    diceList.appendChild(li);
  });
}

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

// Exemples de fonctions de gestion de dés (ajout, lancer, supprimer)
// Seulement joueur actif peut modifier
function ajouterDe(type) {
  if (currentUser !== playerActive) {
    alert("Seul le joueur actif peut ajouter un dé.");
    return;
  }
  ws.send(JSON.stringify({ type: "addDice", diceType: type }));
}

function lancerDes() {
  if (currentUser !== playerActive) {
    alert("Seul le joueur actif peut lancer les dés.");
    return;
  }
  ws.send(JSON.stringify({ type: "rollDice" }));
}

function supprimerDe(index) {
  if (currentUser !== playerActive) {
    alert("Seul le joueur actif peut supprimer un dé.");
    return;
  }
  ws.send(JSON.stringify({ type: "removeDice", index }));
}

// Gestion du bouton réduire/agrandir zone dés
btnToggleDice.addEventListener("click", () => {
  if (diceList.style.display === "none") {
    diceList.style.display = "block";
    btnToggleDice.textContent = "Réduire";
  } else {
    diceList.style.display = "none";
    btnToggleDice.textContent = "Agrandir";
  }
});
