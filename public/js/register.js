const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const pseudo = form.pseudo.value.trim();
  const password = form.password.value;
  const role = form.role.value;

  if (!pseudo || !password || !role) {
    errorMsg.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  const comptes = JSON.parse(localStorage.getItem("comptes") || "{}");

  if (pseudo in comptes) {
    errorMsg.textContent = "Ce pseudo est déjà pris.";
    return;
  }

  if (pseudo.toLowerCase() === "admin") {
    errorMsg.textContent = "Le pseudo 'admin' est réservé.";
    return;
  }

  // Ajouter le compte
  comptes[pseudo] = {
    password: password,
    role: role,
  };

  localStorage.setItem("comptes", JSON.stringify(comptes));

  // Connexion directe après inscription
  localStorage.setItem("currentUser", pseudo);
  localStorage.setItem("currentRole", role);

  // Rediriger vers fiche perso
  window.location.href = "fiche.html";
});
