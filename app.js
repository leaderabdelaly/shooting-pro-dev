let canvas = document.getElementById("targetCanvas");
let ctx = canvas.getContext("2d");

let img = new Image();
let shots = [];
let center = null;
let mode = "shot";
let lang = "ar";

const MAX_FREE_SHOTS = 10;
const IS_PRO = false; // تتحول true لاحقًا

let LANG = null;

fetch("lang.json")
  .then(r => r.json())
  .then(data => {
    LANG = data;
    applyLanguage();
  });

/* ================== اللغة ================== */

document.getElementById("langToggle").onclick = () => {
  lang = lang === "ar" ? "en" : "ar";
  document.getElementById("langToggle").innerText = lang === "ar" ? "EN" : "AR";
  applyLanguage();
};

function applyLanguage() {
  if (!LANG) return;

  document.documentElement.lang = lang;

  document.getElementById("setCenterBtn").innerText =
    LANG.ui.setCenter[lang];

  document.getElementById("undoBtn").innerText =
    LANG.ui.undo[lang];

  document.getElementById("analyzeBtn").innerText =
    LANG.ui.analyze[lang];
}

/* ================== تحميل الصورة ================== */

document.getElementById("imageInput").addEventListener("change", e => {
  let file = e.target.files[0];
  if (!file) return;

  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    redraw();
  };
});

/* ================== أزرار التحكم ================== */

document.getElementById("setCenterBtn").onclick = () => {
  mode = "center";
};

document.getElementById("undoBtn").onclick = () => {
  if (shots.length > 0) {
    shots.pop();
    redraw();
  }
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
      alert(LANG.free.limit[lang]);
      return;
    }
    shots.push({ x, y });
  }
  redraw();
});

/* ================== الرسم ================== */

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (img.src) ctx.drawImage(img, 0, 0);

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
    ctx.fillText(i + 1, s.x + 6, s.y);
  });
}

/* ================== التحليل ================== */

document.getElementById("analyzeBtn").onclick = analyze;

function analyze() {
  if (!center || shots.length === 0) return;

  let counts = { left:0, right:0, up:0, down:0 };

  shots.forEach(s => {
    if (s.x < center.x - 10) counts.left++;
    if (s.x > center.x + 10) counts.right++;
    if (s.y < center.y - 10) counts.up++;
    if (s.y > center.y + 10) counts.down++;
  });

  let error = Object.keys(counts)
    .reduce((a,b)=>counts[a] > counts[b] ? a : b);

  let text = LANG.errors[error][lang];

  if (IS_PRO) {
    text += " — " + LANG.errors[error]["fix_" + lang];
  } else {
    text += " — " + LANG.free.no_fix[lang];
  }

  document.getElementById("analysisText").innerText = text;
}
