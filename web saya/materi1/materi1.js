/* ---------- UTIL & STATE ---------- */
const STORAGE_KEY = 'nexlearn_materi1_progress_v1';
const totalState = {
  current: 0,
  completed: [], // indeks subbab yang ditandai selesai
  quizResults: {} // quizResults[index] = {passed:true/false}
};

// try load saved
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    Object.assign(totalState, parsed);
  } catch(e){ /* ignore malformed saved state */ }
}

/* ---------- DOM refs ---------- */
const contentCard = document.getElementById('contentCard');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const markDoneBtn = document.getElementById('markDone');
const toc = document.getElementById('toc');
const overallProgress = document.getElementById('overallProgress');
const summaryBox = document.getElementById('summaryBox');
const resetBtn = document.getElementById('resetProgress');

/* ---------- CONTENT: array of subtopics ---------- */
/* setiap item: { title, html (string), quiz: [{q, choices:[{t, correct}], hint}] , summary } */
const materia = [
  {
    title: "Apa itu Jaringan Komputer?",
    html: `
      <div class="materi-section">
        <h2>Pengenalan Dasar Jaringan Komputer</h2>

        <p>Oke, jadi gini… jaringan komputer itu intinya <strong>cara berbagai perangkat saling ngobrol</strong> lewat kabel atau tanpa kabel. Komunikasi ini bisa buat kirim file, akses internet, print bareng, sampai nonton CCTV dari jarak jauh.</p>

        <p>Bayangin jaringan itu kayak sistem jalan raya. Ada mobil (data), ada jalanan (media transmisi), ada rambu-rambu (protokol), dan ada alamat rumah (IP Address). Kalau salah alamat, ya paketnya nyasar.</p>

        <h3>Apa aja sih yang bikin jaringan itu “jadi jaringan”?</h3>
        <ul>
          <li><strong>Perangkat</strong> – PC, laptop, HP, printer, router, switch, dll.</li>
          <li><strong>Media transmisi</strong> – kabel LAN, fiber optic, gelombang radio (WiFi).</li>
          <li><strong>Protokol</strong> – aturan komunikasi, contohnya TCP/IP.</li>
        </ul>

        <h3>Kenapa jaringan itu penting?</h3>
        <p>Karena hampir semua aktivitas digital kita butuh komunikasi antar perangkat.</p>

        <h3>Manfaat jaringan dalam kehidupan nyata</h3>
        <ul>
          <li><strong>Berbagi file</strong></li>
          <li><strong>Sharing printer</strong></li>
          <li><strong>Akses internet</strong></li>
          <li><strong>Komunikasi cepat</strong></li>
          <li><strong>Bisa bikin server sendiri</strong></li>
        </ul>

        <h3>Jenis-jenis koneksi</h3>
        <ul>
          <li><strong>LAN</strong></li>
          <li><strong>WiFi</strong></li>
          <li><strong>Bluetooth</strong></li>
          <li><strong>Fiber Optik</strong></li>
        </ul>

        <h3>Intinya?</h3>
        <pre style="background:#060b1d;color:#bde1ff;padding:12px;border-radius:8px;">
Perangkat → Terhubung → Punya alamat → Mengikuti aturan → Bisa kirim & terima data
        </pre>
      </div>
    `,
    quiz: [
      {
        q: "Apa komponen yang WAJIB ada supaya jaringan bisa terbentuk?",
        choices: [
          { t: "Perangkat + media transmisi + protokol", correct:true },
          { t: "Router saja sudah cukup", correct:false },
          { t: "WiFi saja sudah cukup", correct:false }
        ],
        hint: "Jaringan butuh perangkat, jalur komunikasi, dan aturan main."
      },
      {
        q: "Contoh manfaat jaringan yang benar adalah…",
        choices: [
          { t: "Memperkuat sinyal CPU", correct:false },
          { t: "Print bareng tanpa colok-colok flashdisk", correct:true },
          { t: "Membesarkan ukuran RAM otomatis", correct:false }
        ],
        hint: "Fokus ke komunikasi antar perangkat."
      },
      {
        q: "Apa analogi yang tepat untuk IP Address?",
        choices: [
          { t: "Rute jalan raya", correct:false },
          { t: "Alamat rumah", correct:true },
          { t: "Nomor kursi bioskop", correct:false }
        ],
        hint: "IP menentukan 'rumah' tujuan data."
      }
    ],
    summary: "Inti jaringan: perangkat → terhubung → punya alamat → ikut protokol → bisa kirim & terima data."
  }
];

/* ---------- safety: clamp saved state to valid ranges ---------- */
/* jika user punya saved state dari versi lama, pastikan indeks valid */
(function clampSavedState(){
  // clamp current
  if (typeof totalState.current !== 'number' || isNaN(totalState.current)) totalState.current = 0;
  if (totalState.current < 0) totalState.current = 0;
  if (totalState.current > materia.length - 1) totalState.current = 0;

  // filter completed indices to valid range
  if (!Array.isArray(totalState.completed)) totalState.completed = [];
  totalState.completed = totalState.completed.filter(i => Number.isInteger(i) && i >= 0 && i < materia.length);

  // ensure quizResults keys valid (optional to keep)
  const validQuizResults = {};
  Object.keys(totalState.quizResults || {}).forEach(k => {
    const idx = Number(k);
    if (Number.isInteger(idx) && idx >= 0 && idx < materia.length) validQuizResults[idx] = totalState.quizResults[k];
  });
  totalState.quizResults = validQuizResults;
})();

/* ---------- render TOC ---------- */
function buildTOC() {
  toc.innerHTML = '';
  materia.forEach((m, idx) => {
    const li = document.createElement('li');
    li.textContent = `${idx+1}. ${m.title}`;
    li.dataset.index = idx;
    if (totalState.completed.includes(idx)) li.classList.add('completed');
    if (idx === totalState.current) li.classList.add('active');
    li.onclick = () => { totalState.current = idx; saveState(); renderCurrent(); updateOverallProgress(); };
    toc.appendChild(li);
  });
}

/* ---------- render current content ---------- */
function renderCurrent() {
  const idx = totalState.current;

  // defensive: jika item undefined, reset ke 0 (menghindari blank page)
  if (!materia || materia.length === 0) {
    contentCard.innerHTML = `<div class="materi-section"><p>Tidak ada materi tersedia.</p></div>`;
    summaryBox.textContent = '';
    overallProgress.style.width = '0%';
    overallProgress.textContent = '0%';
    return;
  }

  const item = materia[idx];
  if (!item) {
    // reset state supaya tidak kembali error terus
    totalState.current = 0;
    saveState();
    buildTOC();
    return renderCurrent();
  }

  // build html
  let out = `<div class="materi-section"><h2>${item.title}</h2>${item.html}</div>`;

  // add quiz if exists
  if (item.quiz && item.quiz.length) {
    item.quiz.forEach((qObj, qIndex) => {
      out += `<div class="quiz-box">
                <h5>Quiz: ${qObj.q}</h5>
                ${qObj.choices.map((c, ci) =>
                  `<button class="quiz-btn" data-q="${qIndex}" data-choice="${ci}" onclick="handleQuiz(${idx}, ${qIndex}, ${ci}, this)">${c.t}</button>`
                ).join('')}
                <small class="d-block mt-2 text-muted">${qObj.hint || ''}</small>
              </div>`;
    });
  }

  contentCard.innerHTML = out;

  // summary
  summaryBox.textContent = item.summary || '';

  // update buttons
  prevBtn.disabled = (idx === 0);
  nextBtn.disabled = (idx === materia.length - 1);

  // update TOC highlight
  Array.from(toc.children).forEach(li => {
    li.classList.toggle('active', Number(li.dataset.index) === idx);
  });

  // AOS refresh (if needed)
  if (window.AOS) AOS.refresh();
}

/* ---------- quiz handler (global, called from generated buttons) ---------- */
window.handleQuiz = function(itemIndex, qIndex, choiceIndex, btnEl) {
  // defensive: check indexes
  if (!materia[itemIndex] || !materia[itemIndex].quiz || !materia[itemIndex].quiz[qIndex]) return;

  const qObj = materia[itemIndex].quiz[qIndex];
  const choice = qObj.choices[choiceIndex];

  // mark visual
  const parent = btnEl.closest('.quiz-box');
  const buttons = parent.querySelectorAll('.quiz-btn');
  buttons.forEach(b => b.disabled = true);

  if (choice && choice.correct) {
    btnEl.classList.add('correct');
    alert('Jawaban benar! ✔️');
    totalState.quizResults[itemIndex] = totalState.quizResults[itemIndex] || {};
    totalState.quizResults[itemIndex][qIndex] = true;
  } else {
    btnEl.classList.add('wrong');
    alert('Jawaban salah — baca kembali bagian terkait dan coba lagi.');
    totalState.quizResults[itemIndex] = totalState.quizResults[itemIndex] || {};
    totalState.quizResults[itemIndex][qIndex] = false;
  }

  // if all quizzes for that item passed, mark completed automatically
  checkAutoComplete(itemIndex);
  saveState();
  updateOverallProgress();
};

/* ---------- helper: check auto complete ---------- */
function checkAutoComplete(itemIndex) {
  const item = materia[itemIndex];
  if (!item || !item.quiz || item.quiz.length === 0) return;
  const res = totalState.quizResults[itemIndex] || {};
  const allPassed = item.quiz.every((_, qi) => res[qi] === true);
  if (allPassed && !totalState.completed.includes(itemIndex)) {
    totalState.completed.push(itemIndex);
    // small visual feedback
    alert(`Keren! Semua kuis di "${item.title}" lulus. Bab ditandai selesai.`);
    buildTOC();
  }
}

/* ---------- navigation ---------- */
prevBtn.onclick = () => {
  if (totalState.current > 0) totalState.current--;
  saveState(); renderCurrent(); updateOverallProgress();
};
nextBtn.onclick = () => {
  if (totalState.current < materia.length - 1) totalState.current++;
  saveState(); renderCurrent(); updateOverallProgress();
};

/* ---------- mark done button ---------- */
markDoneBtn.onclick = () => {
  const i = totalState.current;
  if (!totalState.completed.includes(i)) {
    totalState.completed.push(i);
    buildTOC();
    saveState();
    updateOverallProgress();
    alert('Bab ditandai selesai. Nice!');
  } else {
    alert('Bab ini sudah ditandai selesai.');
  }
};

/* ---------- overall progress calculation ---------- */
function updateOverallProgress() {
  const doneCount = totalState.completed.length;
  const pct = Math.round((doneCount / materia.length) * 100);
  overallProgress.style.width = pct + '%';
  overallProgress.textContent = pct + '%';
}

/* ---------- save / reset ---------- */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(totalState));
  } catch(e) {
    // ignore storage errors (e.g. quota)
  }
}

resetBtn.onclick = () => {
  if (!confirm('Reset progress Materi 1? Data yang tersimpan akan dihapus.')) return;
  localStorage.removeItem(STORAGE_KEY);
  totalState.current = 0;
  totalState.completed = [];
  totalState.quizResults = {};
  saveState();
  buildTOC();
  renderCurrent();
  updateOverallProgress();
  alert('Progress direset.');
};

/* ---------- autosave on unload ---------- */
window.addEventListener('beforeunload', saveState);

/* ---------- initial render ---------- */
buildTOC();
renderCurrent();
updateOverallProgress();

/* ---------- AOS init ---------- */
if (window.AOS) {
  AOS.init({ duration: 700, once: true, easing: 'ease-in-out' });
}

/* ---------- particle background (dark blue ↔ purple drifting dots) ---------- */
(function particleBG(){
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const particles = [];
  const total = Math.min(160, Math.round(window.innerWidth * window.innerHeight / 80000));
  for (let i=0;i<total;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*2.4 + 0.6,
      speed: Math.random()*0.8 + 0.15,
      hue: Math.random()*40 + 200 // blue to purple
    });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.y += p.speed;
      if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random()*canvas.width; }
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, 0.18)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
