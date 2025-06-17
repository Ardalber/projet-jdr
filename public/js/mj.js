const comptesListDiv = document.getElementById("comptes-list");
const btnZoneJeu = document.getElementById("btn-zone-jeu");

function chargerComptes() {
  const comptes = JSON.parse(localStorage.getItem("comptes") || "{}");
  comptesListDiv.innerHTML = "";

  if (Object.keys(comptes).length === 0) {
    comptesListDiv.textContent = "Aucun compte trouvé.";
    return;
  }

  Object.entries(comptes).forEach(([pseudo]) => {
    const div = document.createElement("div");
    div.className = "compte-item";
    div.innerHTML = `
      <strong>${pseudo}</strong>
      <button class="btn-supprimer" data-pseudo="${pseudo}">Supprimer</button>
    `;
    comptesListDiv.appendChild(div);
  });

  document.querySelectorAll(".btn-supprimer").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pseudoASupprimer = btn.dataset.pseudo;
      if (confirm(`Confirmer la suppression du compte "${pseudoASupprimer}" ?`)) {
        supprimerCompte(pseudoASupprimer);
      }
    });
  });
}

function supprimerCompte(pseudo) {
  const comptes = JSON.parse(localStorage.getItem("comptes") || "{}");
  if (comptes[pseudo]) {
    delete comptes[pseudo];
    localStorage.setItem("comptes", JSON.stringify(comptes));
    chargerComptes();
  }
}

btnZoneJeu.addEventListener("click", () => {
  window.location.href = "zone.html";
});

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("message", (event) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    console.error("Erreur JSON WebSocket :", e);
    return;
  }

  if (data.type === "comptes-mise-a-jour") {
    console.log("Mise à jour des comptes reçue");
    chargerComptes();
  }
});

// Chargement initial
chargerComptes();
