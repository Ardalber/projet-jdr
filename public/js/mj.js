const protocol = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${protocol}://${location.host}`);

const imageInput = document.getElementById("image-input");
const imagesContainer = document.getElementById("zone-images");
const listeComptes = document.getElementById("liste-comptes");

let images = [];

ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "getImages" }));
  // Suppression de ws.send getFiches (fiches perso)
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "imagesList":
      images = data.images || [];
      afficherImages();
      break;
    // Suppression de la gestion fichesList
  }
});

// ✅ Upload image
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

// ✅ Affichage des images
function afficherImages() {
  imagesContainer.innerHTML = "";
  images.forEach((img, index) => {
    if (img.url === "/uploads/default.jpg") return;

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

// ✅ Affichage des comptes et suppression
async function chargerComptes() {
  listeComptes.innerHTML = "Chargement...";
  try {
    const res = await fetch("/api/comptes");
    const data = await res.json();

    if (!data.success) {
      listeComptes.innerHTML = "<p>Erreur chargement comptes.</p>";
      return;
    }

    const comptes = data.comptes;
    listeComptes.innerHTML = "";

    for (const pseudo in comptes) {
      const info = comptes[pseudo];
      const ligne = document.createElement("div");

      const bouton = document.createElement("button");
      bouton.textContent = "❌";
      bouton.style.marginLeft = "10px";
      bouton.onclick = async () => {
        if (confirm(`Supprimer le compte "${pseudo}" ?`)) {
          const res = await fetch(`/api/comptes/${encodeURIComponent(pseudo)}`, {
            method: "DELETE",
          });
          const resultat = await res.json();
          if (resultat.success) {
            chargerComptes();
          } else {
            alert("Erreur : " + resultat.message);
          }
        }
      };

      ligne.innerHTML = `<strong>${pseudo}</strong> – ${info.role}`;
      ligne.appendChild(bouton);
      listeComptes.appendChild(ligne);
    }
  } catch (err) {
    console.error(err);
    listeComptes.innerHTML = "<p>Erreur serveur.</p>";
  }
}

chargerComptes();

// ✅ Bouton déconnexion
document.getElementById("btn-deconnexion").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentRole");
  window.location.href = "index.html";
});

// ✅ Bouton retour à la zone
document.getElementById("btn-retour-zone").addEventListener("click", () => {
  window.location.href = "zone.html";
});
