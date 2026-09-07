const input = document.querySelector("#fileInput");
const viewer = document.querySelector("#viewer");
const formatSelect = document.querySelector("#formatSelect");
const btnConvert = document.querySelector("#btnConvert");

let currentBlob = null;

// Formati che il browser riproduce nativamente
const nativeFormats = ["mp3", "wav", "ogg"];

input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  currentBlob = file;

  if (nativeFormats.includes(ext)) {
    showNativeAudio(file);
  } else {
    convertToWAV(file); // conversione automatica per FLAC, AAC, M4A, OPUS, WMA...
  }
});

// Riproduzione diretta
function showNativeAudio(file) {
  const url = URL.createObjectURL(file);
  viewer.innerHTML = `<audio controls src="${url}"></audio>`;
}

// Conversione automatica per formati non supportati
async function convertToWAV(file) {
  viewer.innerHTML = "Convertendo l'audio...";

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
}

// Conversione manuale (MP3/WAV/OGG)
btnConvert.addEventListener("click", async () => {
  if (!currentBlob) {
    alert("Nessun audio caricato.");
    return;
  }

  const target = formatSelect.value;
  viewer.innerHTML = "Convertendo...";

  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  const data = await currentBlob.arrayBuffer();
  ffmpeg.FS("writeFile", "input", new Uint8Array(data));

  await ffmpeg.run("-i", "input", `output.${target}`);

  const output = ffmpeg.FS("readFile", `output.${target}`);
  const blob = new Blob([output.buffer], { type: `audio/${target}` });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audio_convertito.${target}`;
  a.click();

  URL.revokeObjectURL(url);
});
