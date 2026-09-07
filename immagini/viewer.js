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
  } else if (ext === "hdr") {
    showHDR(file);
  } else if (ext === "raw" || ext === "grel") {
    showRAW(file);
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

    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// DDS (DXT1/3/5 o RGBA)
function showDDS(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const dds = new DDSParser(new Uint8Array(reader.result));

    if (dds.format === "BC7" || dds.format === "BC5") {
      viewer.textContent =
        "DDS BC7/BC5: meglio convertirlo prima con un tool esterno (texconv, Compressonator, ecc.).";
      return;
    }

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

// TGA (uncompressed + RLE)
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

// BMP 24/32 bit
function showBMP(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const buffer = reader.result;
    const view = new DataView(buffer);

    const offset = view.getUint32(10, true);
    const width  = view.getInt32(18, true);
    const height = view.getInt32(22, true);
    const bpp    = view.getUint16(28, true);

    const bytesPerPixel = bpp / 8;
    const data = new Uint8Array(buffer, offset);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = Math.abs(height);

    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(width, Math.abs(height));

    let srcIndex = 0;
    for (let y = Math.abs(height) - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const dstIndex = (y * width + x) * 4;

        const b = data[srcIndex++];
        const g = data[srcIndex++];
        const r = data[srcIndex++];
        let a = 255;
        if (bytesPerPixel === 4) a = data[srcIndex++];

        imgData.data[dstIndex]     = r;
        imgData.data[dstIndex + 1] = g;
        imgData.data[dstIndex + 2] = b;
        imgData.data[dstIndex + 3] = a;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    viewer.innerHTML = "";
    viewer.appendChild(canvas);
    currentCanvas = canvas;
  };
  reader.readAsArrayBuffer(file);
}

// HDR: hook per libreria esterna
function showHDR(file) {
  viewer.textContent =
    "HDR: serve una libreria di decodifica (.hdr Radiance) che converta in RGBA. Qui puoi agganciarla.";
}

// RAW/GREL: formati custom dei giochi
function showRAW(file) {
  viewer.textContent =
    "RAW/GREL: formato custom del gioco. Devi conoscere width/height/bpp/ordine canali per decodificarlo.";
}

// Conversione da canvas → PNG/JPG/WebP
btnConvert.addEventListener("click", () => {
  if (!currentCanvas) {
    alert("Nessuna immagine caricata.");
    return;
  }

  const format = formatSelect.value;
  const quality = format === "image/jpeg" ? 0.9 : 1.0;

  currentCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const ext = format.split("/")[1];
    a.download = `convertito.${ext === "jpeg" ? "jpg" : ext}`;
    a.click();

    URL.revokeObjectURL(url);
  }, format, quality);
});
