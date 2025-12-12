const loadingScreen = document.getElementById('loadingScreen');
const welcomeScreen = document.getElementById('welcomeScreen');
const enterButton = document.getElementById('enterButton');
const welcomeContainer = document.querySelector('.welcome-container'); 

/* ===================================================
   ===== LOADING HANDLER =====
   =================================================== */
window.addEventListener('load', function() {
  console.log('NexLearn Platform Loading...');
  
  // Bubble di loading
  const loadingBubble = document.getElementById("loadingBubble");
  if (loadingBubble) {
      setTimeout(() => loadingBubble.classList.remove("out"), 300);
      setTimeout(() => loadingBubble.classList.add("out"), 2200);
  }

  // Transisi loading fade
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.visibility = 'hidden';
    
    setTimeout(() => {
      welcomeScreen.classList.add('active');

      // Bubble di welcome
      const welcomeBubble = document.getElementById("welcomeBubble");
      if (welcomeBubble) {
          setTimeout(() => welcomeBubble.classList.remove("out"), 400);
          setTimeout(() => welcomeBubble.classList.add("out"), 3500);
      }

      console.log('Welcome screen aktif');
    }, 300);
    
  }, 2500);
});

/* ===================================================
   ===== ENTER BUTTON → Redirect dengan animasi =====
   =================================================== */
if(enterButton && welcomeContainer) {
  enterButton.addEventListener('click', function() {
    console.log('Memicu animasi transisi ke Dashboard...');
    
    this.style.transform = 'scale(0.95)';
    playClickSound();

    welcomeContainer.classList.add('fade-out-content');
    document.body.classList.add('fade-out');
    
    setTimeout(() => {
      window.location.href = 'main/main.html'; 
    }, 500); 
  });
}

if(enterButton) {
    enterButton.addEventListener('transitionend', function() {
      this.style.transform = '';
    });
}

/* ===================================================
   ===== FEATURE BUTTON PICKING =====
   =================================================== */
const featureButtons = document.querySelectorAll('.feature-button'); 
featureButtons.forEach(button => {
  button.addEventListener('click', function() {
    playClickSound();
    this.style.transform = 'scale(0.95)';
    setTimeout(() => { this.style.transform = ''; }, 150);
  });
});

/* ===================================================
   ===== SOUND EFFECT =====
   =================================================== */
function playClickSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

console.log('NexLearn Platform initialized successfully! Ready for redirect.');
