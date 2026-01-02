let canvas = document.getElementById("targetCanvas");
let ctx = canvas.getContext("2d");

let img = new Image();
let shots = [];
let center = null;
let mode = "shot";
let lang = "ar";

const MAX_FREE_SHOTS = 10;
const IS_PRO = false; // لاحقًا تتحول true عند الاشتراك

fetch("lang.json").then(r => r.json()).then(data => window.LANG = data);

document.getElementById("imageInput").addEventListener("change", e => {
  let file = e.target.files[0];
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    redraw();
  };
});

document.getElementById("setCenterBtn").onclick = () => {
  mode = "center";
};

document.getElementById("undoBtn").onclick = () => {
  shots.pop();
  redraw();
};

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (mode === "center") {
    center = { x, y };
    mode = "shot";
  } else {
    if (!IS_PRO && shots.length >= MAX_FREE_SHOTS) {
      alert(window.LANG.free.limit[lang]);
      return;
    }
    shots.push({ x, y });
  }
  redraw();
});

document.getElementById("analyzeBtn").onclick = analyze;

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  if (center) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "blue";
  shots.forEach((s, i) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(i + 1, s.x + 5, s.y);
  });
}

function analyze() {
  if (!center || shots.length === 0) return;

  let counts = { left:0, right:0, up:0, down:0 };

  shots.forEach(s => {
    if (s.x < center.x - 10) counts.left++;
    if (s.x > center.x + 10) counts.right++;
    if (s.y < center.y - 10) counts.up++;
    if (s.y > center.y + 10) counts.down++;
  });

  let error = Object.keys(counts).reduce((a,b)=>counts[a]>counts[b]?a:b);
  let txt = window.LANG.errors[error][lang];

  if (IS_PRO) {
    txt += " — " + window.LANG.errors[error]["fix_"+lang];
  } else {
    txt += " — " + window.LANG.free.no_fix[lang];
  }

  document.getElementById("analysisText").innerText = txt;
}
