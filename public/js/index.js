// public/js/index.js

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pseudo = document.getElementById("pseudo").value.trim();
  const password = document.getElementById("password").value;

  const comptes = JSON.parse(localStorage.getItem("comptes") || "{}");

  if (!comptes[pseudo]) {
    alert("Utilisateur inconnu.");
    return;
  }

  if (comptes[pseudo].password !== password) {
    alert("Mot de passe incorrect.");
    return;
  }

  // Stocker la session
  localStorage.setItem("currentUser", pseudo);
  localStorage.setItem("currentRole", comptes[pseudo].role);

  // Redirection vers fiche perso obligatoirement
  window.location.href = "fiche.html";
});
