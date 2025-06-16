const role = localStorage.getItem("currentRole");
const fondImage = document.getElementById("fond-image");
const fondSelecteur = document.getElementById("selecteur-fond");
const fondSelect = document.getElementById("fond-select");
const btnMjPage = document.getElementById("btn-mj-page");
const btnFiche = document.getElementById("btn-fiche");

const DEFAULT_BG = "images/default-bg.jpg"; // chemin vers l’image par défaut

let des = [];

function afficherDes() {
  if (!listeDes) return;
  listeDes.innerHTML = "";

  des.forEach((de, index) => {
    const div = document.createElement("div");
    div.className = "de-item de-" + de.couleur;

    const span = document.createElement("span");
    span.textContent = `D${de.type}`;

    const spanResultat = document.createElement("span");
    spanResultat.className = "resultat-de";
    spanResultat.style.marginLeft = "8px";
    spanResultat.textContent = de.resultat !== undefined ? de.resultat : "";

    const btnSuppr = document.createElement("button");
    btnSuppr.textContent = "✖";
    btnSuppr.title = "Supprimer ce dé";
    btnSuppr.style.userSelect = "none";
    btnSuppr.onclick = () => {
      des.splice(index, 1);
      envoyerEtatDes();
      afficherDes();
    };

    div.appendChild(span);
    div.appendChild(spanResultat);
    div.appendChild(btnSuppr);
    listeDes.appendChild(div);
  });
}

function envoyerEtatDes() {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "des-mise-a-jour",
        des: des,
      })
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialisation du fond avec image par défaut
  fondImage.style.position = "absolute";
  fondImage.style.top = "0";
  fondImage.style.left = "0";
  fondImage.style.width = "100%";
  fondImage.style.height = "100%";
  fondImage.style.backgroundSize = "cover";
  fondImage.style.backgroundPosition = "center";
  fondImage.style.backgroundImage = `url(${DEFAULT_BG})`;

  // Affichage dés
  afficherDes();

  if (role === "mj") {
    fondSelecteur.style.display = "block";
    btnMjPage.style.display = "block";

    // Ajout option "Par défaut" en premier dans la liste
    const optionDefaut = document.createElement("option");
    optionDefaut.value = "";
    optionDefaut.textContent = "Par défaut";
    fondSelect.appendChild(optionDefaut);

    fetch("/api/zoneImages")
      .then((res) => res.json())
      .then((images) => {
        images.forEach((img, i) => {
          const option = document.createElement("option");
          option.value = img.src;
          option.textContent = img.nom || `Scène ${i + 1}`;
          fondSelect.appendChild(option);
        });
      });

    fondSelect.addEventListener("change", () => {
      const socketLocal = new WebSocket(`ws://${window.location.host}`);
      socketLocal.addEventListener("open", () => {
        socketLocal.send(
          JSON.stringify({
            type: "fond",
            url: fondSelect.value,
          })
        );
        socketLocal.close();
      });
    });

    btnMjPage.addEventListener("click", () => {
      window.location.href = "mj.html";
    });
  }

  btnFiche.style.display = "inline-block";
  btnFiche.addEventListener("click", () => {
    window.location.href = "fiche.html";
  });
});

// --- Zone dés ---
const listeDes = document.getElementById("liste-des");
const selectTypeDe = document.getElementById("select-type-de");
const selectCouleurDe = document.getElementById("select-couleur-de");
const btnAjouterDe = document.getElementById("btn-ajouter-de");
const btnLancerDes = document.getElementById("btn-lancer-des");
const btnSupprimerTout = document.getElementById("btn-supprimer-tout");

btnAjouterDe.onclick = () => {
  const type = parseInt(selectTypeDe.value, 10);
  const couleur = selectCouleurDe.value;
  des.push({ type, couleur });
  afficherDes();
  envoyerEtatDes();
};

btnLancerDes.onclick = () => {
  if (des.length === 0) {
    alert("Il n'y a aucun dé à lancer !");
    return;
  }
  des = des.map((d) => ({
    ...d,
    resultat: Math.floor(Math.random() * d.type) + 1,
  }));
  afficherDes();
  envoyerEtatDes();
};

btnSupprimerTout.onclick = () => {
  if (des.length === 0) {
    alert("Il n'y a aucun dé à supprimer !");
    return;
  }
  des = [];
  afficherDes();
  envoyerEtatDes();
};

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("message", (event) => {
  if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      gererMessage(data);
    };
    reader.readAsText(event.data);
  } else {
    const data = JSON.parse(event.data);
    gererMessage(data);
  }
});

function gererMessage(data) {
  if (data.type === "fond") {
    if (data.url && data.url.trim() !== "") {
      fondImage.style.backgroundImage = `url(${data.url})`;
      if (role === "mj") {
        const options = Array.from(fondSelect.options);
        const match = options.find((opt) => opt.value === data.url);
        if (match) fondSelect.value = data.url;
      }
    } else {
      // Aucun fond choisi, on remet le fond par défaut
      fondImage.style.backgroundImage = `url(${DEFAULT_BG})`;
      if (role === "mj") fondSelect.value = "";
    }
  }
  if (data.type === "des-mise-a-jour") {
    des = data.des || [];
    afficherDes();
  }
}
