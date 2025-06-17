
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("image-input");
  const imageList = document.getElementById("image-list");
  const imageForm = document.getElementById("image-form");

  function chargerImages() {
    fetch("/api/zoneImages")
      .then(res => res.json())
      .then(images => {
        imageList.innerHTML = "";
        images.forEach((img, index) => {
          const div = document.createElement("div");
          div.className = "image-item";

          const image = document.createElement("img");
          image.src = img.src;
          image.alt = img.nom || `Image ${index + 1}`;

          const input = document.createElement("input");
          input.type = "text";
          input.value = img.nom || `Image ${index + 1}`;
          input.onchange = () => renommerImage(img.src, input.value);

          const supprimer = document.createElement("button");
          supprimer.textContent = "Supprimer";
          supprimer.onclick = () => supprimerImage(img.src);

          div.appendChild(image);
          div.appendChild(input);
          div.appendChild(supprimer);
          imageList.appendChild(div);
        });
      });
  }

  function renommerImage(src, nom) {
    fetch("/api/images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src, nom }),
    }).then(() => chargerImages());
  }

  function supprimerImage(src) {
    fetch("/api/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
    }).then(() => chargerImages());
  }

  imageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = imageInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    fetch("/api/images", {
      method: "POST",
      body: formData,
    }).then(() => {
      imageInput.value = "";
      chargerImages();
    });
  });

  chargerImages();
});
