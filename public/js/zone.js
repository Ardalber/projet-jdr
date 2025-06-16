const role = localStorage.getItem("currentRole");
const fondImage = document.getElementById("fond-image");
const fondSelecteur = document.getElementById("selecteur-fond");
const fondSelect = document.getElementById("fond-select");
const btnMjPage = document.getElementById("btn-mj-page");

fondImage.style.position = "absolute";
fondImage.style.top = "0";
fondImage.style.left = "0";
fondImage.style.width = "100%";
fondImage.style.height = "100%";
fondImage.style.backgroundSize = "cover";
fondImage.style.backgroundPosition = "center";

if (role === "mj") {
  fondSelecteur.style.display = "block";
  btnMjPage.style.display = "block";

  fetch("/api/zoneImages")
    .then((res) => res.json())
    .then((images) => {
      images.forEach((img, i) => {
        const option = document.createElement("option");
        option.value = img.src;
        option.textContent = img.nom || `Scène ${i + 1}`;
        fondSelect.appendChild(option);
      });
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

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("message", (event) => {
  if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      handleMessage(data);
    };
    reader.readAsText(event.data);
  } else {
    const data = JSON.parse(event.data);
    handleMessage(data);
  }
});

function handleMessage(data) {
  console.log("Message WS reçu :", data);
  if (data.type === "fond") {
    fondImage.style.backgroundImage = `url(${data.url})`;

    if (role === "mj") {
      const options = Array.from(fondSelect.options);
      const match = options.find((opt) => opt.value === data.url);
      if (match) {
        fondSelect.value = data.url;
      }
    }
  }
}
