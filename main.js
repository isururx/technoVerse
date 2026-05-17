/* ══════════════════════════════════════════
   TECHNOVERSE — main.js
   ══════════════════════════════════════════ */

// ── DOM refs ──
const holdBtn    = document.getElementById('holdBtn');
const ringFill   = document.getElementById('ringFill');
const splash     = document.getElementById('splash');
const overlay    = document.getElementById('transition-overlay');
const flash      = document.getElementById('flashLayer');
const gridWarp   = document.getElementById('gridWarp');
const scanBurst  = document.getElementById('scanBurst');
const shatter    = document.getElementById('shatterContainer');
const centerRing = document.getElementById('centerRing');

// ── Ring setup ──
const RADIUS        = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
ringFill.style.strokeDasharray  = CIRCUMFERENCE;
ringFill.style.strokeDashoffset = CIRCUMFERENCE;

// ── Hold state ──
const HOLD_DURATION = 1200; // ms to fill the ring
let rafId     = null;
let startTime = null;

/* ─────────────────────────────────────────
   startHold — called on mousedown / touchstart
───────────────────────────────────────── */
function startHold(e) {
  e.preventDefault();
  startTime = performance.now();
  requestAnimationFrame(animateRing);
}

/* ─────────────────────────────────────────
   animateRing — rAF loop that fills the ring
───────────────────────────────────────── */
function animateRing(ts) {
  if (!startTime) return;

  const elapsed  = ts - startTime;
  const progress = Math.min(elapsed / HOLD_DURATION, 1);
  const offset   = CIRCUMFERENCE * (1 - progress);

  ringFill.style.strokeDashoffset = offset;

  if (progress < 1) {
    rafId = requestAnimationFrame(animateRing);
  } else {
    triggerTransition();
  }
}

/* ─────────────────────────────────────────
   stopHold — resets ring if released early
───────────────────────────────────────── */
function stopHold() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId     = null;
  startTime = null;

  ringFill.style.transition      = 'stroke-dashoffset 0.3s ease';
  ringFill.style.strokeDashoffset = CIRCUMFERENCE;
  setTimeout(() => { ringFill.style.transition = ''; }, 300);
}

// Attach hold events
holdBtn.addEventListener('mousedown',  startHold);
holdBtn.addEventListener('touchstart', startHold, { passive: false });
holdBtn.addEventListener('mouseup',    stopHold);
holdBtn.addEventListener('mouseleave', stopHold);
holdBtn.addEventListener('touchend',   stopHold);
holdBtn.addEventListener('touchcancel',stopHold);

/* ─────────────────────────────────────────
   createParticles — 60 shards explode from center
───────────────────────────────────────── */
function createParticles() {
  shatter.innerHTML = '';
  const count = 60;
  const cx    = window.innerWidth  / 2;
  const cy    = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';

    const size  = Math.random() * 8 + 3;
    const color = Math.random() > 0.5 ? '#1565c0' : '#1976d2';
    const shape = Math.random() > 0.5 ? '50%' : '2px';

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${cx}px; top:${cy}px;
      background:${color};
      border-radius:${shape};
      transform:translate(-50%,-50%);
      opacity:0;
    `;
    shatter.appendChild(p);

    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
    const dist  = 80 + Math.random() * 220;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;
    const delay = Math.random() * 120;       // ms
    const dur   = 400 + Math.random() * 400; // ms

    p.animate(
      [
        { opacity: 1, transform: `translate(-50%,-50%) translate(0,0) scale(1)` },
        { opacity: 0, transform: `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(0)` }
      ],
      { delay, duration: dur, easing: 'cubic-bezier(.17,.67,.83,.67)', fill: 'forwards' }
    );
  }
}

/* ─────────────────────────────────────────
   triggerTransition — the entrance animation
   Timeline:
     0ms  — flash + particle burst
     50ms — ring burst from center
     80ms — grid warp
    100ms — scan burst spin
    200ms — splash shatters out
    680ms — homepage revealed
───────────────────────────────────────── */
function triggerTransition() {
  overlay.classList.add('active');
  createParticles();

  // 1. White flash
  flash.animate(
    [{ opacity: 0 }, { opacity: 1 }, { opacity: 0.6 }],
    { duration: 200, fill: 'forwards' }
  );

  // 2. Grid warp implode
  gridWarp.animate(
    [
      { opacity: 0, transform: 'scale(1)'    },
      { opacity: 1, transform: 'scale(1.15)' },
      { opacity: 0, transform: 'scale(0.6)'  }
    ],
    { delay: 80, duration: 500, easing: 'ease-in', fill: 'forwards' }
  );

  // 3. Conic scan burst spin
  scanBurst.animate(
    [
      { opacity: 0, transform: 'rotate(0deg)   scale(0.5)' },
      { opacity: 1, transform: 'rotate(180deg) scale(1.2)' },
      { opacity: 0, transform: 'rotate(360deg) scale(2)'   }
    ],
    { delay: 100, duration: 700, easing: 'ease-out', fill: 'forwards' }
  );

  // 4. Ring burst expands from center
  centerRing.animate(
    [
      { opacity: 1,   transform: 'translate(-50%,-50%) scale(0)'  },
      { opacity: 0.8, transform: 'translate(-50%,-50%) scale(10)' },
      { opacity: 0,   transform: 'translate(-50%,-50%) scale(30)' }
    ],
    { delay: 50, duration: 600, easing: 'ease-out', fill: 'forwards' }
  );

  // 5. Splash screen shatters away
  splash.animate(
    [
      { opacity: 1, transform: 'scale(1)',   filter: 'blur(0px)'  },
      { opacity: 0, transform: 'scale(2.5)', filter: 'blur(12px)' }
    ],
    { delay: 200, duration: 500, easing: 'cubic-bezier(.36,.07,.19,.97)', fill: 'forwards' }
  );

  // 6. Navigate to dashboard
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 680);
}
