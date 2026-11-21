const canvas = document.createElement("canvas");
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

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(canvas);
window.addEventListener("resize", resizeCanvas);

const background = new Image();
background.onload = () => {
  backgroundImage = background;
};
background.src = "background.png";

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
  if (source) {
    source.disconnect();
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }

  objectUrl = URL.createObjectURL(file);
  audio = new Audio(objectUrl);
  audio.preload = "auto";
  source = null;
  playButton.textContent = "Play";

  audio.addEventListener("error", () => {
    playButton.textContent = "Could not load audio";
  });
}

function loadDefaultAudio() {
  audio = new Audio("song.mp3");
  audio.preload = "auto";
  playButton.textContent = "Play";

  audio.addEventListener("error", () => {
    playButton.textContent = "Could not load audio";
  });
}

loadDefaultAudio();

function drawFallbackBackground() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const scaleX = width / 540;
  const scaleY = height / 960;

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = "#708fd4";
  ctx.fillRect(0, 0, 540, 960);

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
  ctx.restore();
}

function drawCoverImage() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const imageWidth = backgroundImage.naturalWidth || backgroundImage.width;
  const imageHeight = backgroundImage.naturalHeight || backgroundImage.height;
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
}

function draw() {
  if (backgroundImage) {
    drawCoverImage();
  } else {
    drawFallbackBackground();
  }

  const values = new Uint8Array(analyser ? analyser.frequencyBinCount : 64);
  if (analyser) {
    analyser.getByteFrequencyData(values);
  } else {
    values.fill(0);
  }

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const baseY = height * 0.90625;
  const centerX = width / 2;
  const barWidth = Math.min(68, width * 0.11);
  const gap = Math.min(20, width * 0.032);
  const totalWidth = barWidth * 6 + gap * 5;
  const maxHeight = height * 0.28125;

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 6; i++) {
    const sampleIndex = Math.floor(i * values.length / 6);
    const barHeight = 12 + (values[sampleIndex] / 255) * (maxHeight - 12);
    const x = centerX - totalWidth / 2 + i * (barWidth + gap);
    ctx.fillRect(x, baseY - barHeight, barWidth, barHeight);
  }

  requestAnimationFrame(draw);
}

draw();
