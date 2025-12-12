const maskot = document.getElementById("maskot");
const bubble = document.getElementById("maskotBubble");
const wrapper = document.getElementById("maskotWrapper");

let offsetX, offsetY;
let dragging = false;

/* ============================
      RANDOM SPEECH
============================= */
const randomLines = [
    "Ayo belajar bareng!",
    "Hari ini pilih materi apa?",
    "Aku siap bantu kamu!",
    "Semangat yuk!",
    "Jangan lupa minum dulu!"
];

function showBubble(text) {
    bubble.textContent = text;
    bubble.classList.add("show");
    setTimeout(() => bubble.classList.remove("show"), 3000);
}

setInterval(() => {
    if (!dragging) {
        showBubble(randomLines[Math.floor(Math.random() * randomLines.length)]);
    }
}, 10000);

/* ============================
      MASKOT DRAG
============================= */
maskot.addEventListener("mousedown", (e) => {
    dragging = true;
    maskot.classList.remove("idle-anim");
    maskot.src = "gambar/Gantung.png";
    showBubble("Woosh! Aku kebawa!");

    offsetX = e.clientX - wrapper.offsetLeft;
    offsetY = e.clientY - wrapper.offsetTop;

    document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    wrapper.style.left = `${e.clientX - offsetX}px`;
    wrapper.style.top = `${e.clientY - offsetY}px`;
    wrapper.style.position = "fixed";
});

document.addEventListener("mouseup", () => {
    if (!dragging) return;

    dragging = false;
    maskot.src = "gambar/Diam.png";
    maskot.classList.add("idle-anim");
    document.body.style.userSelect = "auto";
});

/* ============================
      PARTICLE BACKGROUND (FIX)
============================= */
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

// canvas selalu 100% tampilan
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];
const totalParticles = 120;

for (let i = 0; i < totalParticles; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseSize: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.9 + 0.25,
        blur: Math.random() * 2.5,
        growRate: Math.random() * 0.015 + 0.005
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.size += p.growRate;
        if (p.size > p.baseSize + 1 || p.size < p.baseSize - 1) {
            p.growRate *= -1;
        }

        ctx.fillStyle = "rgba(180, 200, 255, 0.7)";
        ctx.filter = `blur(${p.blur}px)`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = "none";

        p.y += p.speedY;

        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(animate);
}
animate();

/* ============================
      PAGE FADE-IN (LAMBAT)
============================= */
document.body.style.opacity = "0";
document.body.style.transition = "opacity 2.2s ease"; // LEBIH LAMBAT

window.addEventListener("load", () => {
    setTimeout(() => {
        document.body.style.opacity = "1";
    }, 200);
});

/* ============================
      CARD & BUTTON ANIMATION
============================= */
const cards = document.querySelectorAll(".module-card");
const buttons = document.querySelectorAll(".btn-learn");

cards.forEach(card => {
    card.style.transition = "0.25s ease";

    card.addEventListener("mousedown", () => {
        card.style.transform = "scale(0.96)";
    });

    card.addEventListener("mouseup", () => {
        card.style.transform = "scale(1)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "scale(1)";
    });
});

buttons.forEach(btn => {
    btn.style.transition = "0.25s ease";

    btn.addEventListener("mousedown", () => {
        btn.style.transform = "scale(0.92)";
    });
    btn.addEventListener("mouseup", () => {
        btn.style.transform = "scale(1)";
    });
    btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)";
    });
});

/* ============================
      BUBBLE AWAL
============================= */
setTimeout(() => bubble.classList.add("show"), 600);
setTimeout(() => bubble.classList.remove("show"), 4000);
