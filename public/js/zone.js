const ws = new WebSocket(`ws://${window.location.host}`);

const zoneJeu = document.getElementById("fond-image");
const diceList = document.getElementById("liste-des");

const selectType = document.getElementById("select-type-de");
const selectCouleur = document.getElementById("select-couleur-de");
const btnAjouter = document.getElementById("btn-ajouter-de");
const btnLancer = document.getElementById("btn-lancer-des");
const btnSupprimerTout = document.getElementById("btn-supprimer-tout");

let des = [];
let fondActif = "";

ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "getInitialState" }));
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "initialState":
      des = data.des || [];
      fondActif = data.fondActif || "";
      majListeDes();
      setBackgroundImage(fondActif);
      break;

    case "updateDice":
      des = data.des || [];
      majListeDes();
      break;

    case "updateFond":
      fondActif = data.fondActif || "";
      setBackgroundImage(fondActif);
      break;

    default:
      console.warn("Message inconnu:", data);
  }
});

function majListeDes() {
  diceList.innerHTML = "";

  des.forEach((de, index) => {
    const div = document.createElement("div");
    div.classList.add("de-item");

    if (de.couleur) {
      div.classList.add(`de-${de.couleur}`);
    }

    const spanType = document.createElement("span");
    spanType.textContent = de.type;

    const spanResult = document.createElement("span");
    spanResult.textContent = de.valeur;
    spanResult.classList.add("resultat-de");

    const btnSuppr = document.createElement("button");
    btnSuppr.textContent = "X";
    btnSuppr.title = "Supprimer ce dé";
    btnSuppr.addEventListener("click", () => {
      supprimerDe(index);
    });

    div.appendChild(spanType);
    div.appendChild(spanResult);
    div.appendChild(btnSuppr);

    diceList.appendChild(div);
  });
}

function setBackgroundImage(url) {
  zoneJeu.style.backgroundImage = url ? `url(${url})` : "";
  zoneJeu.style.backgroundSize = "contain";
  zoneJeu.style.backgroundRepeat = "no-repeat";
  zoneJeu.style.backgroundPosition = "center";
}

// === ACTIONS ===

btnAjouter.addEventListener("click", () => {
  const type = selectType.value;
  const couleur = selectCouleur.value;
  ws.send(JSON.stringify({ type: "addDice", diceType: type, couleur }));
});

btnLancer.addEventListener("click", () => {
  ws.send(JSON.stringify({ type: "rollDice" }));
});

btnSupprimerTout.addEventListener("click", () => {
  ws.send(JSON.stringify({ type: "removeAllDice" }));
});

function supprimerDe(index) {
  ws.send(JSON.stringify({ type: "removeDice", index }));
}
