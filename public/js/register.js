// public/js/register.js

// Création de compte
document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const pseudo = document.getElementById("pseudo").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const role = document.getElementById("role").value;

  if (!pseudo || !password || !confirm) {
    alert("Tous les champs sont obligatoires.");
    return;
  }

  if (password !== confirm) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  // Protection : le pseudo "admin" est réservé au MJ uniquement
  if (pseudo.toLowerCase() === "admin" && role !== "mj") {
    alert('Le pseudo "admin" est réservé au Maître du Jeu.');
    return;
  }

  const comptes = JSON.parse(localStorage.getItem("comptes") || "{}");

  if (comptes[pseudo]) {
    alert("Ce pseudo est déjà utilisé.");
    return;
  }

  comptes[pseudo] = {
    password: password,
    role: role
  };

  localStorage.setItem("comptes", JSON.stringify(comptes));
  localStorage.setItem("currentUser", pseudo);
  localStorage.setItem("currentRole", role);
  alert("✅ Compte créé avec succès !");
  window.location.href = "fiche.html"; // redirection vers fiche perso
});

// Réinitialisation sécurisée — uniquement pour l'utilisateur 'admin'
document.getElementById("reset-comptes").addEventListener("click", () => {
  const comptes = JSON.parse(localStorage.getItem("comptes") || "{}");

  const pseudo = prompt("Seul l'utilisateur 'admin' peut réinitialiser tous les comptes.\nEntrez votre pseudo :");
  if (pseudo !== "admin") {
    alert("❌ Seul l'utilisateur 'admin' peut faire cette action.");
    return;
  }

  if (!comptes["admin"]) {
    alert("❌ Le compte 'admin' n'existe pas.");
    return;
  }

  const motDePasse = prompt("Entrez le mot de passe du compte 'admin' :");
  if (motDePasse !== comptes["admin"].password) {
    alert("❌ Mot de passe incorrect.");
    return;
  }

  const confirmation = confirm("⚠️ Êtes-vous sûr de vouloir supprimer TOUS les comptes ?");
  if (!confirmation) return;

  localStorage.removeItem("comptes");
  alert("✅ Tous les comptes ont été supprimés.");
});

// Masquer le bouton de suppression si l'utilisateur connecté n'est pas "admin"
window.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");
  const resetButton = document.getElementById("reset-comptes");

  if (currentUser !== "admin" && resetButton) {
    resetButton.style.display = "none";
  }
});
