const canvas = document.createElement("canvas");
canvas.width = 540;
canvas.height = 960;
document.querySelector("#canvas-wrap").append(canvas);

const ctx = canvas.getContext("2d");
const playButton = document.querySelector("#play-button");
const audioUpload = document.querySelector("#audio-upload");
const imageUpload = document.querySelector("#image-upload");

let backgroundImage = null;
let audioContext = null;
let analyser = null;
let source = null;
let audio = null;
let objectUrl = null;

audioUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) loadUploadedAudio(file);
});

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const image = new Image();
  image.onload = () => {
    backgroundImage = image;
  };
  image.src = URL.createObjectURL(file);
});

playButton.addEventListener("click", async () => {
  if (!audio) {
    audioUpload.click();
    return;
  }

  if (!audio.paused) {
    audio.pause();
    playButton.textContent = "Play";
  } else {
    await ensureAudioGraph();
    await audio.play();
    playButton.textContent = "Pause";
  }
});

async function ensureAudioGraph() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state !== "running") {
    await audioContext.resume();
  }
  if (!source) {
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
}

async function loadUploadedAudio(file) {
  if (audio) {
    audio.pause();
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }

  objectUrl = URL.createObjectURL(file);
  audio = new Audio(objectUrl);
  source = null;
  playButton.textContent = "Loading...";

  audio.addEventListener("loadeddata", async () => {
    try {
      await ensureAudioGraph();
      await audio.play();
      playButton.textContent = "Pause";
    } catch {
      playButton.textContent = "Play";
    }
  }, { once: true });

  audio.addEventListener("error", () => {
    playButton.textContent = "Could not load audio";
  });
}

function drawFallbackBackground() {
  ctx.fillStyle = "#708fd4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#5b4add";
  ctx.lineWidth = 7;
  ctx.strokeRect(210, 270, 120, 420);
  ctx.strokeRect(330, 390, 120, 300);

  ctx.strokeStyle = "#4fdacc";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(270, 390, 55, 0, Math.PI * 2);
  ctx.arc(390, 390, 55, 0, Math.PI * 2);
  ctx.stroke();
}

function draw() {
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    drawFallbackBackground();
  }

  const values = new Uint8Array(analyser ? analyser.frequencyBinCount : 64);
  if (analyser) {
    analyser.getByteFrequencyData(values);
  } else {
    values.fill(0);
  }

  const baseY = 870;
  const centerX = canvas.width / 2;
  const spacing = 12;
  const barWidth = 9;
  const maxHeight = 270;

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 32; i++) {
    const height = 12 + (values[i] / 255) * (maxHeight - 12);
    ctx.fillRect(centerX + i * spacing, baseY - height, barWidth, height);
    ctx.fillRect(centerX - i * spacing - barWidth, baseY - height, barWidth, height);
  }

  requestAnimationFrame(draw);
}

draw();
