const imageInput = document.getElementById("image-input");
const imagesContainer = document.getElementById("zone-images");
const listeFiches = document.getElementById("liste-fiches");

const ws = new WebSocket(`wss://${window.location.host}`);

let images = [];

ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "getImages" }));
  ws.send(JSON.stringify({ type: "getFiches" })); // si tu gères les fiches plus tard
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "imagesList":
      images = data.images || [];
      afficherImages();
      break;
    case "fichesList":
      afficherFiches(data.fiches);
      break;
  }
});

imageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result;
    const msg = {
      type: "uploadImage",
      name: file.name,
      data: base64
    };
    ws.send(JSON.stringify(msg));
  };
  reader.readAsDataURL(file);
});

function afficherImages() {
  imagesContainer.innerHTML = "";
  images.forEach((img, index) => {
    const div = document.createElement("div");
    div.classList.add("image-item");

    const image = document.createElement("img");
    image.src = img.url;
    image.alt = img.nom;

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = img.nom;
    nameInput.addEventListener("change", () => {
      ws.send(JSON.stringify({ type: "renameImage", index, newName: nameInput.value }));
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Supprimer";
    deleteBtn.addEventListener("click", () => {
      ws.send(JSON.stringify({ type: "deleteImage", index }));
    });

    div.appendChild(image);
    div.appendChild(nameInput);
    div.appendChild(deleteBtn);

    imagesContainer.appendChild(div);
  });
}

function afficherFiches(fiches) {
  listeFiches.innerHTML = "";
  Object.entries(fiches).forEach(([pseudo, fiche]) => {
    const li = document.createElement("li");
    li.textContent = `${pseudo} : ${JSON.stringify(fiche)}`;
    listeFiches.appendChild(li);
  });
}

// ✅ Déconnexion MJ
document.getElementById("btn-deconnexion").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentRole");
  window.location.href = "index.html";
});
