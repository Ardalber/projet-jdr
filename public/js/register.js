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

  comptes[pseudo] = { password, role };
  localStorage.setItem("comptes", JSON.stringify(comptes));

  // Notifier le serveur WebSocket pour mise à jour
  const socket = new WebSocket(`ws://${window.location.host}`);
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "comptes-mise-a-jour" }));
    socket.close();
  });

  localStorage.setItem("currentUser", pseudo);
  localStorage.setItem("currentRole", role);

  // Rediriger vers fiche perso (ou zone de jeu)
  window.location.href = "fiche.html";
});
