// public/js/fiche.js

const pseudo = localStorage.getItem("currentUser");
if (!pseudo) {
  alert("Aucun utilisateur connecté.");
  window.location.href = "index.html";
}

const fiches = JSON.parse(localStorage.getItem("fiches") || "{}");
const fiche = fiches[pseudo] || {};

document.getElementById("nom").value = fiche.nom || "";
document.getElementById("race").value = fiche.race || "";
document.getElementById("classe").value = fiche.classe || "";
document.getElementById("description").value = fiche.description || "";

document.getElementById("fiche-form").addEventListener("submit", (e) => {
  e.preventDefault();

  fiches[pseudo] = {
    nom: document.getElementById("nom").value,
    race: document.getElementById("race").value,
    classe: document.getElementById("classe").value,
    description: document.getElementById("description").value
  };

  localStorage.setItem("fiches", JSON.stringify(fiches));
  alert("Fiche enregistrée !");
  window.location.href = "zone.html";
});
