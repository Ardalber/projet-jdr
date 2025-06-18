const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pseudo = form.pseudo.value.trim();
  const password = form.password.value;
  const role = form.role.value;

  if (!pseudo || !password || !role) {
    errorMsg.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  if (pseudo.toLowerCase() === "admin") {
    errorMsg.textContent = "Le pseudo 'admin' est réservé.";
    return;
  }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pseudo, password, role })
    });

    const data = await res.json();
    if (!data.success) {
      errorMsg.textContent = data.message;
      return;
    }

    // Sauvegarder l’utilisateur courant localement
    localStorage.setItem("currentUser", pseudo);
    localStorage.setItem("currentRole", role);

    // Rediriger vers la fiche de personnage
    window.location.href = "fiche.html";
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Erreur serveur.";
  }
});
