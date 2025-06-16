// public/js/zone.js

const role = localStorage.getItem("currentRole");
const fondImage = document.getElementById("fond-image");
const fondSelecteur = document.getElementById("selecteur-fond");
const fondSelect = document.getElementById("fond-select");
const btnMjPage = document.getElementById("btn-mj-page");

// Style fond
fondImage.style.position = "absolute";
fondImage.style.top = "0";
fondImage.style.left = "0";
fondImage.style.width = "100%";
fondImage.style.height = "100%";
fondImage.style.backgroundSize = "cover";
fondImage.style.backgroundPosition = "center";

// Afficher sélecteur et bouton si MJ
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

  btnMjPage.addEventListener("click", () => {
    window.location.href = "mj.html";
  });
}

// WebSocket réception et application du fond
const socket = new WebSocket(`ws://${window.location.host}`);
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "fond") {
    fondImage.style.backgroundImage = `url(${data.url})`;
  }
});
