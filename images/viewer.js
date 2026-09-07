const input = document.querySelector("#fileInput");
const viewer = document.querySelector("#viewer");
const formatSelect = document.querySelector("#formatSelect");
const btnConvert = document.querySelector("#btnConvert");

let currentCanvas = null; // dove teniamo l’immagine per convertirla

input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();

  if (["png","jpg","jpeg","webp","gif"].includes(ext)) {
    showStandardImageToCanvas(file);
  } else {
    viewer.textContent = "Formato non supportato (qui puoi aggiungere DDS/TGA).";
  }
});

// mostra immagine standard e la mette in canvas (così poi la converti)
function showStandardImageToCanvas(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    viewer.innerHTML = "";
    viewer.appendChild(canvas);
    currentCanvas = canvas;

    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// CONVERSIONE: da canvas → nuovo formato
btnConvert.addEventListener("click", () => {
  if (!currentCanvas) {
    alert("Nessuna immagine caricata.");
    return;
  }

  const format = formatSelect.value; // image/png, image/jpeg, image/webp
  const quality = format === "image/jpeg" ? 0.9 : 1.0; // qualità JPG

  currentCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // nome file di output
    const ext = format.split("/")[1]; // png, jpeg, webp
    a.download = `immagine_convertita.${ext === "jpeg" ? "jpg" : ext}`;
    a.click();

    URL.revokeObjectURL(url);
  }, format, quality);
});
