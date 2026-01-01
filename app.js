let currentLang = "ar";
let lang = {};

let shots = [];
let history = [];

const canvas = document.getElementById("targetCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

// تحميل اللغة
fetch("./lang.json")
  .then(r => r.json())
  .then(data => {
    lang = data;
    applyLang();
  });

function t(key) {
  return lang[currentLang][key] || key;
}

function applyLang() {
  document.title = t("title");
  document.getElementById("appTitle").innerText = t("title");
  document.getElementById("uploadLabel").childNodes[0].textContent = t("upload");
  document.getElementById("undoBtn").innerText = t("undo");
  document.getElementById("analyzeBtn").innerText = t("analyze");
}

// تغيير اللغة
document.getElementById("langToggle").onclick = () => {
  currentLang = currentLang === "ar" ? "en" : "ar";
  document.getElementById("langToggle").innerText =
    currentLang === "ar" ? "EN" : "AR";
  applyLang();
};

// رفع الصورة
document.getElementById("imageInput").onchange = e => {
  const file = e.target.files[0];
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    shots = [];
    history = [];
  };
  img.src = URL.createObjectURL(file);
};

// تسجيل الطلقات
canvas.onclick = e => {
  history.push([...shots]);

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  shots.push({ x, y });

  drawShot(x, y);
};

function drawShot(x, y) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

// تراجع
document.getElementById("undoBtn").onclick = () => {
  if (history.length === 0) return;
  shots = history.pop();
  redraw();
};

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shots.forEach(s => drawShot(s.x, s.y));
}

// تحليل
document.getElementById("analyzeBtn").onclick = () => {
  if (shots.length === 0) {
    alert(t("noShots"));
    return;
  }

  document.getElementById("analysisResult").innerText =
    t("result") + " : Grip / Trigger";
};
