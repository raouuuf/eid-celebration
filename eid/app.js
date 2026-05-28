/* ================================================
   EID MUBARAK - PREMIUM CELEBRATION
   app.js — Animations, Particles, Confetti, Audio
   ================================================ */

// ── DOM References ───────────────────────────────
const ctaBtn        = document.getElementById('ctaBtn');
const hero          = document.getElementById('hero');
const celebration   = document.getElementById('celebration');
const flashOverlay  = document.getElementById('flashOverlay');
const replayBtn     = document.getElementById('replayBtn');
const soundBtn      = document.getElementById('soundBtn');
const floatCrescents = document.getElementById('floatCrescents');

const starCanvas     = document.getElementById('starCanvas');
const confettiCanvas = document.getElementById('confettiCanvas');
const particleCanvas = document.getElementById('particleCanvas');

const sCtx  = starCanvas.getContext('2d');
const coCtx = confettiCanvas.getContext('2d');
const pCtx  = particleCanvas.getContext('2d');

// ── State ─────────────────────────────────────────
let soundEnabled   = false;
let audioCtx       = null;
let celebrationActive = false;

// ── Resize Handler ───────────────────────────────
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  [starCanvas, confettiCanvas, particleCanvas].forEach(c => {
    c.width  = window.innerWidth  * dpr;
    c.height = window.innerHeight * dpr;
    c.style.width  = window.innerWidth  + 'px';
    c.style.height = window.innerHeight + 'px';
    c.getContext('2d').scale(dpr, dpr);
  });
}
resize();
window.addEventListener('resize', resize);

// ════════════════════════════════════════════════
//  STAR FIELD
// ════════════════════════════════════════════════
const STAR_COUNT = 220;
const stars = [];

function initStars() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x:    Math.random() * window.innerWidth,
      y:    Math.random() * window.innerHeight,
      r:    Math.random() * 1.6 + 0.3,
      a:    Math.random(),
      da:   (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      twinkle: Math.random() < 0.3,
    });
  }
}
initStars();
window.addEventListener('resize', initStars);

function drawStars() {
  sCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach(s => {
    s.a = Math.max(0.05, Math.min(1, s.a + s.da));
    if (s.a <= 0.05 || s.a >= 1) s.da *= -1;

    const hue = Math.random() < 0.05 ? '212,175,55' : '255,255,255';
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(${hue},${s.a})`;
    sCtx.fill();
    // Glow for larger stars
    if (s.r > 1.2) {
      sCtx.beginPath();
      sCtx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      sCtx.fillStyle = `rgba(${hue},${s.a * 0.15})`;
      sCtx.fill();
    }
  });
}

// ════════════════════════════════════════════════
//  CONFETTI SYSTEM
// ════════════════════════════════════════════════
const CONFETTI_COLORS = [
  '#d4af37','#f5d060','#2ecc71','#1abc9c',
  '#e74c3c','#e91e63','#9c27b0','#3498db',
  '#ffffff','#ff9800'
];

const confettiPieces = [];

function spawnConfetti(n = 300) {
  for (let i = 0; i < n; i++) {
    confettiPieces.push({
      x:   window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y:   window.innerHeight / 2,
      vx:  (Math.random() - 0.5) * 18,
      vy:  -(Math.random() * 18 + 6),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w:   Math.random() * 10 + 5,
      h:   Math.random() * 5  + 3,
      rot: Math.random() * 360,
      drot: (Math.random() - 0.5) * 12,
      gravity: Math.random() * 0.4 + 0.3,
      drag: 0.97,
      life: 1,
      shape: Math.random() < 0.3 ? 'circle' : (Math.random() < 0.5 ? 'rect' : 'star'),
    });
  }
}

function drawStar5(ctx, x, y, r, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    ctx.lineTo(x + (r / 2) * Math.cos(b), y + (r / 2) * Math.sin(b));
  }
  ctx.closePath();
  ctx.fill();
}

let confettiRunning = false;

function updateConfetti() {
  if (!confettiRunning) return;
  coCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = confettiPieces.length - 1; i >= 0; i--) {
    const p = confettiPieces[i];
    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.x  += p.vx;
    p.y  += p.vy;
    p.rot += p.drot;
    p.life -= 0.005;

    if (p.y > window.innerHeight + 20 || p.life <= 0) {
      confettiPieces.splice(i, 1);
      continue;
    }

    coCtx.save();
    coCtx.globalAlpha = Math.min(1, p.life * 3);
    coCtx.translate(p.x, p.y);
    coCtx.rotate((p.rot * Math.PI) / 180);

    if (p.shape === 'circle') {
      coCtx.beginPath();
      coCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
      coCtx.fillStyle = p.color;
      coCtx.fill();
    } else if (p.shape === 'star') {
      drawStar5(coCtx, 0, 0, p.w / 1.5, p.color);
    } else {
      coCtx.fillStyle = p.color;
      coCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    coCtx.restore();
  }

  requestAnimationFrame(updateConfetti);
}

// ════════════════════════════════════════════════
//  GOLD PARTICLE SYSTEM
// ════════════════════════════════════════════════
const particles = [];

function spawnParticles(n = 120) {
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x:   window.innerWidth / 2,
      y:   window.innerHeight / 2,
      vx:  Math.cos(angle) * speed,
      vy:  Math.sin(angle) * speed - 2,
      r:   Math.random() * 3 + 1,
      life: 1,
      decay: Math.random() * 0.012 + 0.006,
      hue:  Math.random() * 40 + 40, // gold range
      trail: [],
    });
  }
}

let particleRunning = false;

function updateParticles() {
  if (!particleRunning) return;
  pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 8) p.trail.shift();

    p.vy += 0.12;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x  += p.vx;
    p.y  += p.vy;
    p.life -= p.decay;

    if (p.life <= 0) { particles.splice(i, 1); continue; }

    // Draw trail
    if (p.trail.length > 1) {
      pCtx.beginPath();
      pCtx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let t = 1; t < p.trail.length; t++) {
        pCtx.lineTo(p.trail[t].x, p.trail[t].y);
      }
      pCtx.strokeStyle = `hsla(${p.hue}, 90%, 70%, ${p.life * 0.3})`;
      pCtx.lineWidth = p.r * 0.8;
      pCtx.stroke();
    }

    // Draw particle
    const grd = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
    grd.addColorStop(0, `hsla(${p.hue}, 100%, 90%, ${p.life})`);
    grd.addColorStop(1, `hsla(${p.hue}, 100%, 60%, 0)`);
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
    pCtx.fillStyle = grd;
    pCtx.fill();
  }

  requestAnimationFrame(updateParticles);
}

// ════════════════════════════════════════════════
//  FLOATING CRESCENTS
// ════════════════════════════════════════════════
function spawnCrescents() {
  floatCrescents.innerHTML = '';
  const symbols = ['☪', '🌙', '✦', '★', '✨', '🌟'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'float-crescent';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left     = Math.random() * 100 + 'vw';
    el.style.bottom   = '-60px';
    el.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
    el.style.animationDuration  = (Math.random() * 4 + 4) + 's';
    el.style.animationDelay     = (Math.random() * 3) + 's';
    el.style.color = Math.random() < 0.5 ? '#d4af37' : '#2ecc71';
    floatCrescents.appendChild(el);
  }
}

// ════════════════════════════════════════════════
//  WEB AUDIO – Celebratory Tones
// ════════════════════════════════════════════════
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.4, vol = 0.15, delay = 0) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch(e) {}
}

function playFanfare() {
  if (!soundEnabled) return;
  // Ascending chord fanfare
  const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
  notes.forEach((f, i) => {
    playTone(f, 'triangle', 0.5, 0.12, i * 0.07);
    playTone(f * 2, 'sine', 0.3, 0.06, i * 0.07 + 0.02);
  });
  // Chime ripple
  setTimeout(() => {
    [1046.5, 1318.5, 1567.98, 2093].forEach((f, i) => {
      playTone(f, 'sine', 0.6, 0.08, i * 0.1);
    });
  }, 600);
}

function playClickChime() {
  playTone(880, 'sine', 0.3, 0.1);
  playTone(1108, 'sine', 0.3, 0.08, 0.08);
}

// ════════════════════════════════════════════════
//  FLASH EFFECT
// ════════════════════════════════════════════════
function flashScreen() {
  flashOverlay.style.opacity = '0.7';
  setTimeout(() => { flashOverlay.style.opacity = '0'; }, 120);
}

// ════════════════════════════════════════════════
//  PARALLAX
// ════════════════════════════════════════════════
document.addEventListener('mousemove', e => {
  if (celebrationActive) return;
  const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
  const my = (e.clientY / window.innerHeight - 0.5) * 2;

  const moonWrap = document.getElementById('moonWrap');
  if (moonWrap) {
    moonWrap.style.transform = `translate(${mx * 12}px, ${-12 + my * 8}px)`;
  }
  const heroContent = document.getElementById('heroContent');
  if (heroContent) {
    heroContent.style.transform = `translate(${mx * -6}px, ${my * -4}px)`;
  }
  const arabicDeco = document.getElementById('arabicDeco');
  if (arabicDeco) {
    arabicDeco.style.transform = `translate(${mx * 8}px, ${my * 6}px)`;
  }
});

// ════════════════════════════════════════════════
//  MAIN CELEBRATION TRIGGER
// ════════════════════════════════════════════════
function startCelebration() {
  if (celebrationActive) return;
  celebrationActive = true;

  playClickChime();

  // 1. Flash
  setTimeout(flashScreen, 100);

  // 2. Fade out hero
  hero.style.opacity = '0';
  hero.style.transform = 'scale(1.05)';
  hero.style.pointerEvents = 'none';

  // 3. Show celebration
  setTimeout(() => {
    celebration.classList.add('active');

    // Start particle systems
    spawnParticles(150);
    particleRunning = true;
    updateParticles();

    setTimeout(() => {
      spawnConfetti(350);
      confettiRunning = true;
      updateConfetti();
    }, 200);

    // Spawn crescents
    spawnCrescents();

    // Play fanfare
    setTimeout(playFanfare, 300);

    // Repeat confetti bursts
    setTimeout(() => spawnConfetti(200), 800);
    setTimeout(() => spawnConfetti(150), 1600);
    setTimeout(() => spawnParticles(80), 1000);

  }, 300);
}

function resetCelebration() {
  celebrationActive = false;
  confettiRunning   = false;
  particleRunning   = false;
  confettiPieces.length = 0;
  particles.length  = 0;
  coCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  floatCrescents.innerHTML = '';

  celebration.classList.remove('active');
  hero.style.opacity   = '1';
  hero.style.transform = 'scale(1)';
  hero.style.pointerEvents = 'all';

  // Reset replay button opacity
  const rb = document.getElementById('replayBtn');
  rb.style.animation = 'none';
  rb.style.opacity   = '0';
  setTimeout(() => {
    rb.style.animation = 'replayReveal 0.5s ease 2.2s forwards';
  }, 100);
}

// ════════════════════════════════════════════════
//  EVENT LISTENERS
// ════════════════════════════════════════════════
ctaBtn.addEventListener('click', startCelebration);

replayBtn.addEventListener('click', () => {
  resetCelebration();
  setTimeout(startCelebration, 600);
});

soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundBtn.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) {
    try { getAudioCtx().resume(); } catch(e) {}
    playTone(440, 'sine', 0.2, 0.1);
  }
});

// Sheep click for extra fun
document.getElementById('sheep')?.addEventListener('click', () => {
  playTone(440, 'triangle', 0.15, 0.12);
  playTone(660, 'triangle', 0.15, 0.08, 0.1);
  spawnConfetti(80);
  spawnParticles(40);
  const mouths = ['😂', '🤣', '😆', '🐑', '😄'];
  const m = document.getElementById('sheepMouth');
  if (m) {
    m.textContent = mouths[Math.floor(Math.random() * mouths.length)];
    setTimeout(() => { m.textContent = '😄'; }, 800);
  }
});

// ════════════════════════════════════════════════
//  STAR FIELD LOOP
// ════════════════════════════════════════════════
function loop() {
  drawStars();
  requestAnimationFrame(loop);
}
loop();

// ── Touch / hover micro-interactions ────────────
document.querySelectorAll('.lantern').forEach(l => {
  l.style.cursor = 'pointer';
  l.addEventListener('click', () => {
    spawnParticles(25);
    if (!particleRunning) { particleRunning = true; updateParticles(); }
    playTone(660, 'sine', 0.25, 0.1);
  });
});

// ── Mobile tap on arabic phrases ─────────────────
document.querySelectorAll('.arabic-phrase').forEach(p => {
  p.addEventListener('click', () => {
    p.style.color = 'rgba(212,175,55,0.7)';
    setTimeout(() => { p.style.color = ''; }, 1000);
    playTone(523, 'sine', 0.2, 0.08);
  });
});

// ── Keyboard shortcut ─────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    if (!celebrationActive) startCelebration();
  }
  if (e.key === 'r' || e.key === 'R') {
    if (celebrationActive) {
      resetCelebration();
      setTimeout(startCelebration, 600);
    }
  }
  if (e.key === 's' || e.key === 'S') {
    soundBtn.click();
  }
});

console.log('%c🌙 Eid Mubarak! Press Enter to celebrate, S to toggle sound, R to replay.', 'color:#d4af37;font-size:1.1rem;font-weight:bold;');