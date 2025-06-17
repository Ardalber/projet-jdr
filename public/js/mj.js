
// public/js/mj.js

const ws = new WebSocket(`ws://${window.location.host}`);

const inputImage = document.getElementById("input-image");
const imagesContainer = document.getElementById("images-container");
const errorMsg = document.getElementById("error-msg");

let images = [];

ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "getImages" }));
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "imagesList") {
    images = data.images;
    afficherImages();
  } else if (data.type === "error") {
    errorMsg.textContent = data.message;
  }
});

function afficherImages() {
  imagesContainer.innerHTML = "";
  images.forEach((img, index) => {
    const div = document.createElement("div");
    div.classList.add("image-item");

    const imageElem = document.createElement("img");
    imageElem.src = img.url;
    imageElem.alt = img.nom;
    imageElem.style.maxWidth = "100px";

    const nomInput = document.createElement("input");
    nomInput.type = "text";
    nomInput.value = img.nom;
    nomInput.addEventListener("change", () => {
      ws.send(JSON.stringify({ type: "renameImage", index, newName: nomInput.value }));
    });

    const btnSupprimer = document.createElement("button");
    btnSupprimer.textContent = "Supprimer";
    btnSupprimer.addEventListener("click", () => {
      if (confirm("Confirmer la suppression ?")) {
        ws.send(JSON.stringify({ type: "deleteImage", index }));
      }
    });

    div.appendChild(imageElem);
    div.appendChild(nomInput);
    div.appendChild(btnSupprimer);

    imagesContainer.appendChild(div);
  });
}

inputImage.addEventListener("change", () => {
  if (inputImage.files.length === 0) return;

  const file = inputImage.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const base64Data = e.target.result;

    ws.send(JSON.stringify({
      type: "uploadImage",
      name: file.name,
      data: base64Data
    }));
  };

  reader.readAsDataURL(file);
});
