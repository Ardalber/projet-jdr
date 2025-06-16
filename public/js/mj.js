const btnAddImage = document.getElementById("btn-add-image");
const fileInput = document.getElementById("file-input");
const imagesGrid = document.getElementById("images-grid");
const fichesList = document.getElementById("fiches-list");
const btnZoneJeu = document.getElementById("btn-zone-jeu");

let images = JSON.parse(localStorage.getItem("zoneImages") || "[]");

function saveImages() {
  localStorage.setItem("zoneImages", JSON.stringify(images));
}

function sendMessageFond(url) {
  const socket = new WebSocket(`ws://${window.location.host}`);
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "fond", url }));
    socket.close();
  });
}

function displayImages() {
  imagesGrid.innerHTML = "";

  images.forEach((img, index) => {
    const div = document.createElement("div");
    div.className = "image-item";

    const image = document.createElement("img");
    image.src = img.src;
    image.style.cursor = "pointer";
    image.title = "Cliquez pour appliquer cette scène";
    image.onclick = () => sendMessageFond(img.src);

    const input = document.createElement("input");
    input.value = img.nom;
    input.addEventListener("input", () => {
      images[index].nom = input.value;
      saveImages();
    });

    const btn = document.createElement("button");
    btn.innerText = "🗑";
    btn.onclick = () => {
      images.splice(index, 1);
      saveImages();
      displayImages();
    };

    div.appendChild(image);
    div.appendChild(input);
    div.appendChild(btn);
    imagesGrid.appendChild(div);
  });
}

btnAddImage.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const num = images.length + 1;
    images.push({ src: event.target.result, nom: `Scène ${num}` });
    saveImages();
    displayImages();
    fileInput.value = "";
  };
  reader.readAsDataURL(file);
});

function displayFiches() {
  const fiches = JSON.parse(localStorage.getItem("fiches") || "{}");
  fichesList.innerHTML = "";

  Object.entries(fiches).forEach(([pseudo, fiche]) => {
    const div = document.createElement("div");
    div.className = "fiche-joueur";
    div.innerHTML = `
      <strong>${pseudo}</strong><br>
      Nom : ${fiche.nom || "?"}<br>
      Race : ${fiche.race || "?"}<br>
      Classe : ${fiche.classe || "?"}<br>
      Description : ${fiche.description || "?"}
    `;
    fichesList.appendChild(div);
  });
}

btnZoneJeu.addEventListener("click", () => {
  window.location.href = "zone.html";
});

displayImages();
displayFiches();
