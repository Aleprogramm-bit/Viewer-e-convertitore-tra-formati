const input = document.querySelector("#fileInput");
const viewer = document.querySelector("#viewer");
const formatSelect = document.querySelector("#formatSelect");
const btnConvert = document.querySelector("#btnConvert");

let currentCanvas = null;

input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();

if (["png","jpg","jpeg","webp","gif"].includes(ext)) {
  showStandardImage(file);
} else if (ext === "dds") {
  showDDS(file);
} else if (ext === "tga") {
  showTGA(file);
} else if (ext === "bmp") {
  showBMP(file);
} else {
  viewer.textContent = "Formato non supportato.";
}
});

function showStandardImage(file) {
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
  };
  img.src = url;
}

function showDDS(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const dds = new DDSParser(new Uint8Array(reader.result));

    const canvas = document.createElement("canvas");
    canvas.width = dds.width;
    canvas.height = dds.height;

    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(dds.width, dds.height);
    imgData.data.set(dds.imageData);

    ctx.putImageData(imgData, 0, 0);

    viewer.innerHTML = "";
    viewer.appendChild(canvas);
    currentCanvas = canvas;
  };
  reader.readAsArrayBuffer(file);
}

function showTGA(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const tga = new TGA(reader.result);

    const canvas = document.createElement("canvas");
    canvas.width = tga.width;
    canvas.height = tga.height;

    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(tga.width, tga.height);
    imgData.data.set(tga.imageData);

    ctx.putImageData(imgData, 0, 0);

    viewer.innerHTML = "";
    viewer.appendChild(canvas);
    currentCanvas = canvas;
  };
  reader.readAsArrayBuffer(file);
}

btnConvert.addEventListener("click", () => {
  if (!currentCanvas) {
    alert("Nessuna immagine caricata.");
    return;
  }

  const format = formatSelect.value;
  currentCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const ext = format.split("/")[1];
    a.download = `convertito.${ext === "jpeg" ? "jpg" : ext}`;
    a.click();

    URL.revokeObjectURL(url);
  }, format);

function showTGA(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const tga = new TGA(reader.result);

    const canvas = document.createElement("canvas");
    canvas.width = tga.width;
    canvas.height = tga.height;

    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(tga.width, tga.height);
    imgData.data.set(tga.imageData);

    ctx.putImageData(imgData, 0, 0);

    viewer.innerHTML = "";
    viewer.appendChild(canvas);
    currentCanvas = canvas;
  };
  reader.readAsArrayBuffer(file);
}
});
