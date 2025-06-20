const ws = new WebSocket(`wss://${window.location.host}`);

const zoneJeu = document.getElementById("fond-image");
const diceList = document.getElementById("liste-des");

const selectType = document.getElementById("select-type-de");
const selectCouleur = document.getElementById("select-couleur-de");
const btnAjouter = document.getElementById("btn-ajouter-de");
const btnLancer = document.getElementById("btn-lancer-des");
const btnSupprimerTout = document.getElementById("btn-supprimer-tout");

const role = localStorage.getItem("currentRole");

// Affichage MJ
if (role && role.toLowerCase() === "mj") {
  document.getElementById("btn-mj-page").style.display = "inline-block";
  document.getElementById("selecteur-fond").style.display = "flex";
  document.getElementById("btn-fond-par-defaut").style.display = "inline-block";

  // Bouton "Fond par défaut"
  document.getElementById("btn-fond-par-defaut").addEventListener("click", () => {
    ws.send(JSON.stringify({
      type: "setFond",
      fondActif: "/uploads/default.jpg"
    }));
  });
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
          console.log(`Image ${index + 1} : nom=${img.nom}, url=${img.url}`);

          const urlEncoded = encodeURIComponent(img.url);
          const opt = document.createElement("option");
          opt.value = urlEncoded;
          opt.textContent = `${index + 1} - ${img.nom}`;
          fondSelect.appendChild(opt);
        });

        // Pas de sélection automatique ici pour éviter d'écraser un choix manuel
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
  if (!url) {
    zoneJeu.style.backgroundImage = "";
    return;
  }
  const decodedUrl = decodeURIComponent(url);
  zoneJeu.style.backgroundImage = `url(${decodedUrl})`;
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

// Sélection manuelle d’un fond par le MJ
if (role && role.toLowerCase() === "mj") {
  const fondSelect = document.getElementById("fond-select");
  fondSelect.addEventListener("change", () => {
    const url = fondSelect.value;
    ws.send(JSON.stringify({ type: "setFond", fondActif: url }));
  });
}
