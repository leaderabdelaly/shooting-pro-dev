const canvas = document.getElementById("targetCanvas");
const ctx = canvas.getContext("2d");

let shots = [];
let USER_PLAN = "free";

if (localStorage.getItem("shooting_pro") === "yes") {
  USER_PLAN = "pro";
}

document.getElementById("planLabel").innerText =
  USER_PLAN === "pro" ? "Shehaby Shooting Pro" : "Free Version";

canvas.addEventListener("click", e => {
  if (USER_PLAN === "free" && shots.length >= 10) {
    showUpgrade();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  shots.push({ x, y });
  draw();
  analyze();
});

document.getElementById("clearBtn").onclick = () => {
  shots = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("result").innerHTML = "";
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shots.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function analyze() {
  if (shots.length === 0) return;

  const last = shots[shots.length - 1];
  let errorKey = "left";

  if (last.x > canvas.width * 0.6) errorKey = "right";
  if (last.y < canvas.height * 0.4) errorKey = "up";
  if (last.y > canvas.height * 0.6) errorKey = "down";

  fetch("lang.json")
    .then(res => res.json())
    .then(lang => {
      let text = `الخطأ: ${lang.errors[errorKey].name}`;

      if (USER_PLAN === "pro") {
        text += `<br>طريقة العلاج: ${lang.errors[errorKey].fix}`;
      }

      document.getElementById("result").innerHTML = text;
    });
}

function showUpgrade() {
  document.getElementById("upgradeBox").classList.remove("hidden");
}

function activatePro() {
  localStorage.setItem("shooting_pro", "yes");
  location.reload();
}
