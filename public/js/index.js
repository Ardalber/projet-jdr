const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const pseudo = form.pseudo.value.trim();
  const password = form.password.value;

  if (!pseudo || !password) {
    errorMsg.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  const comptes = JSON.parse(localStorage.getItem("comptes") || "{}");

  if (!(pseudo in comptes)) {
    errorMsg.textContent = "Pseudo inconnu.";
    return;
  }

  if (comptes[pseudo].password !== password) {
    errorMsg.textContent = "Mot de passe incorrect.";
    return;
  }

  // Connexion réussie : stocker utilisateur courant et rôle
  localStorage.setItem("currentUser", pseudo);
  localStorage.setItem("currentRole", comptes[pseudo].role);

  // Rediriger vers la zone de jeu ou autre page principale
  window.location.href = "zone.html";
});
