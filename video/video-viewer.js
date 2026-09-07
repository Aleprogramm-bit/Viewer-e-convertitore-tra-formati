const input = document.querySelector("#fileInput");
const viewer = document.querySelector("#viewer");
const formatSelect = document.querySelector("#formatSelect");
const btnConvert = document.querySelector("#btnConvert");

let currentFile = null;
let currentBlob = null;

// formati che il browser riproduce nativamente
const nativeFormats = ["mp4", "webm", "ogg"];

input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  currentFile = file;
  const ext = file.name.split(".").pop().toLowerCase();

  if (nativeFormats.includes(ext)) {
    showNativeVideo(file);
  } else {
    convertToMP4(file); // conversione automatica per AVI/MKV/MOV/WMV
  }
});

// riproduzione diretta
function showNativeVideo(file) {
  const url = URL.createObjectURL(file);
  viewer.innerHTML = `<video controls src="${url}"></video>`;
  currentBlob = file;
}

// conversione automatica per formati non supportati
async function convertToMP4(file) {
  viewer.innerHTML = "Convertendo il video...";

  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  const data = await file.arrayBuffer();
  ffmpeg.FS("writeFile", "input", new Uint8Array(data));

  await ffmpeg.run("-i", "input", "output.mp4");

  const output = ffmpeg.FS("readFile", "output.mp4");
  const blob = new Blob([output.buffer], { type: "video/mp4" });

  currentBlob = blob;

  const url = URL.createObjectURL(blob);
  viewer.innerHTML = `<video controls src="${url}"></video>`;
}

// conversione manuale (MP4/WebM/Ogg)
btnConvert.addEventListener("click", async () => {
  if (!currentBlob) {
    alert("Nessun video caricato.");
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
  const blob = new Blob([output.buffer], { type: `video/${target}` });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `video_convertito.${target}`;
  a.click();

  URL.revokeObjectURL(url);
});
