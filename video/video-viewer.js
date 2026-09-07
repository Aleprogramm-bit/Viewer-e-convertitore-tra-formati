const input = document.querySelector("#fileInput");
const viewer = document.querySelector("#viewer");
const formatSelect = document.querySelector("#formatSelect");
const btnConvert = document.querySelector("#btnConvert");
const info = document.querySelector("#info");

let currentBlob = null;

// Formati nativi del browser
const nativeFormats = ["mp4", "webm", "ogg"];

input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  info.textContent = `Formato rilevato: .${ext}`;
  currentBlob = file;

  if (nativeFormats.includes(ext)) {
    showNativeVideo(file);
  } else {
    convertToMP4(file, ext);
  }
});

// Riproduzione diretta (MP4/WebM/Ogg)
function showNativeVideo(file) {
  const url = URL.createObjectURL(file);
  viewer.innerHTML = `<video controls src="${url}"></video>`;
}

// Conversione automatica da QUALSIASI formato → MP4
async function convertToMP4(file, ext) {
  viewer.innerHTML = "Convertendo il video in MP4...";
  info.textContent = `Formato .${ext} non nativo: uso FFmpeg per convertirlo.`;

  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  const data = await file.arrayBuffer();
  ffmpeg.FS("writeFile", "input", new Uint8Array(data));

  // conversione generica: FFmpeg decide da solo come decodificare
  await ffmpeg.run("-i", "input", "-c:v", "libx264", "-c:a", "aac", "output.mp4");

  const output = ffmpeg.FS("readFile", "output.mp4");
  const blob = new Blob([output.buffer], { type: "video/mp4" });

  currentBlob = blob;

  const url = URL.createObjectURL(blob);
  viewer.innerHTML = `<video controls src="${url}"></video>`;
  info.textContent = `Video convertito da .${ext} a .mp4 per la riproduzione.`;
}

// Conversione manuale in MP4/WebM/Ogg
btnConvert.addEventListener("click", async () => {
  if (!currentBlob) {
    alert("Nessun video caricato.");
    return;
  }

  const target = formatSelect.value;
  viewer.innerHTML = `Convertendo in ${target.toUpperCase()}...`;
  info.textContent = `Sto convertendo il video in .${target}.`;

  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  const data = await currentBlob.arrayBuffer();
  ffmpeg.FS("writeFile", "input", new Uint8Array(data));

  let args;
  if (target === "mp4") {
    args = ["-i", "input", "-c:v", "libx264", "-c:a", "aac", "output.mp4"];
  } else if (target === "webm") {
    args = ["-i", "input", "-c:v", "libvpx-vp9", "-c:a", "libopus", "output.webm"];
  } else if (target === "ogg") {
    args = ["-i", "input", "-c:v", "theora", "-c:a", "vorbis", "output.ogg"];
  }

  await ffmpeg.run(...args);

  const outName = `output.${target}`;
  const output = ffmpeg.FS("readFile", outName);
  const mime = target === "mp4" ? "video/mp4" :
               target === "webm" ? "video/webm" :
               "video/ogg";

  const blob = new Blob([output.buffer], { type: mime });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `video_convertito.${target}`;
  a.click();

  info.textContent = `Download completato: video_convertito.${target}`;
  URL.revokeObjectURL(url);
});
