const input = document.querySelector("#fileInput");
const viewer = document.querySelector("#viewer");
const formatSelect = document.querySelector("#formatSelect");
const btnConvert = document.querySelector("#btnConvert");
const info = document.querySelector("#info");

let currentBlob = null;

// Formati nativi del browser
const nativeFormats = ["mp3", "wav", "ogg"];

input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  info.textContent = `Formato rilevato: .${ext}`;
  currentBlob = file;

  if (nativeFormats.includes(ext)) {
    showNativeAudio(file);
  } else {
    convertToWAV(file, ext);
  }
});

// Riproduzione diretta
function showNativeAudio(file) {
  const url = URL.createObjectURL(file);
  viewer.innerHTML = `<audio controls src="${url}"></audio>`;
}

// Conversione automatica → WAV
async function convertToWAV(file, ext) {
  viewer.innerHTML = "Convertendo l'audio in WAV...";
  info.textContent = `Formato .${ext} non nativo: uso FFmpeg per convertirlo.`;

  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  const data = await file.arrayBuffer();
  ffmpeg.FS("writeFile", "input", new Uint8Array(data));

  await ffmpeg.run("-i", "input", "output.wav");

  const output = ffmpeg.FS("readFile", "output.wav");
  const blob = new Blob([output.buffer], { type: "audio/wav" });

  currentBlob = blob;

  const url = URL.createObjectURL(blob);
  viewer.innerHTML = `<audio controls src="${url}"></audio>`;
  info.textContent = `Audio convertito da .${ext} a .wav per la riproduzione.`;
}

// Conversione manuale
btnConvert.addEventListener("click", async () => {
  if (!currentBlob) {
    alert("Nessun audio caricato.");
    return;
  }

  const target = formatSelect.value;
  viewer.innerHTML = `Convertendo in ${target.toUpperCase()}...`;
  info.textContent = `Sto convertendo il file in .${target}.`;

  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  const data = await currentBlob.arrayBuffer();
  ffmpeg.FS("writeFile", "input", new Uint8Array(data));

  let args;
  if (target === "mp3") {
    args = ["-i", "input", "-codec:a", "libmp3lame", "output.mp3"];
  } else if (target === "wav") {
    args = ["-i", "input", "output.wav"];
  } else if (target === "ogg") {
    args = ["-i", "input", "-codec:a", "libvorbis", "output.ogg"];
  }

  await ffmpeg.run(...args);

  const outName = `output.${target}`;
  const output = ffmpeg.FS("readFile", outName);
  const mime = target === "mp3" ? "audio/mpeg" :
               target === "wav" ? "audio/wav" :
               "audio/ogg";

  const blob = new Blob([output.buffer], { type: mime });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audio_convertito.${target}`;
  a.click();

  info.textContent = `Download completato: audio_convertito.${target}`;
  URL.revokeObjectURL(url);
});
