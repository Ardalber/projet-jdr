const ws = new WebSocket(`wss://${window.location.host}`);

const zoneJeu = document.getElementById("fond-image");
const diceList = document.getElementById("liste-des");

const selectType = document.getElementById("select-type-de");
const selectCouleur = document.getElementById("select-couleur-de");
const btnAjouter = document.getElementById("btn-ajouter-de");
const btnLancer = document.getElementById("btn-lancer-des");
const btnSupprimerTout = document.getElementById("btn-supprimer-tout");

const role = localStorage.getItem("currentRole");

// Affichage conditionnel des éléments MJ (insensible à la casse)
if (role && role.toLowerCase() === "mj") {
  document.getElementById("btn-mj-page").style.display = "inline-block";
  document.getElementById("selecteur-fond").style.display = "flex";
}

document.getElementById("btn-mj-page").addEventListener("click", () => {
  window.location.href = "mj.html";
});

document.getElementById("btn-fiche").addEventListener("click", () => {
  window.location.href = "fiche.html";
});

document.getElementById("btn-deconnexion").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentRole");
  window.location.href = "index.html";
});

let des = [];
let fondActif = "";

ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "getInitialState" }));
  if (role && role.toLowerCase() === "mj") {
    ws.send(JSON.stringify({ type: "getImages" }));
  }
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

    case "imagesList":
      if (role && role.toLowerCase() === "mj") {
        const fondSelect = document.getElementById("fond-select");
        fondSelect.innerHTML = "";
        data.images.forEach((img, index) => {
          const opt = document.createElement("option");
          opt.value = img.url;
          opt.textContent = `${index + 1} - ${img.nom}`;
          fondSelect.appendChild(opt);
        });
      }
      break;
  }
});

function majListeDes() {
  diceList.innerHTML = "";

  des.forEach((de, index) => {
    const div = document.createElement("div");
    div.classList.add("de-item");

    if (de.couleur) div.classList.add(`de-${de.couleur}`);

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

if (role && role.toLowerCase() === "mj") {
  const fondSelect = document.getElementById("fond-select");
  fondSelect.addEventListener("change", () => {
    const url = fondSelect.value;
    ws.send(JSON.stringify({ type: "setFond", fondActif: url }));
  });
}
