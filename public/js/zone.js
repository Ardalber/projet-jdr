// public/js/zone.js

const role = localStorage.getItem("currentRole");
const fondImage = document.getElementById("fond-image");
const fondSelecteur = document.getElementById("selecteur-fond");
const fondSelect = document.getElementById("fond-select");
const btnMjPage = document.getElementById("btn-mj-page");

// Configuration style du fond (si besoin)
fondImage.style.position = "absolute";
fondImage.style.top = "0";
fondImage.style.left = "0";
fondImage.style.width = "100%";
fondImage.style.height = "100%";
fondImage.style.backgroundSize = "cover";
fondImage.style.backgroundPosition = "center";

// Si le rôle est MJ, afficher le sélecteur et bouton, et charger les images
if (role === "mj") {
  fondSelecteur.style.display = "block";
  btnMjPage.style.display = "block";

  const images = JSON.parse(localStorage.getItem("zoneImages") || "[]");
  images.forEach((img, i) => {
    const option = document.createElement("option");
    option.value = img.src;
    option.textContent = img.nom || `Scène ${i + 1}`;
    fondSelect.appendChild(option);
  });

  // Quand le MJ change la scène, on envoie l'info au serveur
  fondSelect.addEventListener("change", () => {
    const socket = new WebSocket(`ws://${window.location.host}`);

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          type: "fond",
          url: fondSelect.value,
        })
      );
      socket.close();
    });
  });

  // Bouton pour aller sur la page MJ
  btnMjPage.addEventListener("click", () => {
    window.location.href = "mj.html";
  });
}

// WebSocket client pour recevoir les messages
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "fond") {
    fondImage.style.backgroundImage = `url(${data.url})`;

    // Si MJ, synchroniser le selecteur avec le fond reçu
    if (role === "mj") {
      const options = Array.from(fondSelect.options);
      const match = options.find((opt) => opt.value === data.url);
      if (match) {
        fondSelect.value = data.url;
      }
    }
  }
});
