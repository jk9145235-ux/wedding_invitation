// ============================================================================
// Wedding invitation
// envelope -> intro video -> cinematic crossfade -> invitation video -> image
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const envelopeScreen = document.getElementById('envelope-screen');
  const introScreen = document.getElementById('intro-screen');
  const invitationScreen = document.getElementById('invitation-screen');

  const sealButton = document.getElementById('sealButton');
  const tapHint = document.getElementById('tapHint');
  const introVideo = document.getElementById('introVideo');
  const bloom = document.getElementById('bloom');

  const invitationVideo = document.getElementById('invitationVideo');
  const invitationImage = document.getElementById('invitationImage');
  const invitationGlow = document.getElementById('invitationGlow');

  const bgMusic = document.getElementById('bgMusic');

  // ---- Step 1: visitor taps the wax seal ---------------------------------
  sealButton.addEventListener('click', openEnvelope);

  function openEnvelope() {
    sealButton.disabled = true; // prevent double taps
    tapHint.classList.add('is-hidden'); // disappears immediately, as requested

    envelopeScreen.classList.remove('is-active');
    introScreen.classList.add('is-active');

    // Give invitation.mp4 the entire length of the intro to buffer, so it's
    // already fully prepared and ready to paint the instant it's revealed.
    invitationVideo.load();

        // Bi Saraha is the only audio the visitor should hear — start it here,
    // on this same tap, so the browser's autoplay restriction is satisfied.
    const musicPlayPromise = bgMusic.play();
    if (musicPlayPromise !== undefined) {
      musicPlayPromise
        .then(() => {
          console.log('Bi Saraha is now playing.');
        })
        .catch((err) => {
          console.error('Bi Saraha failed to start:', err.name, err.message);
        });
    }

    // intro.mp4's own soundtrack must never be heard.
    introVideo.muted = true;

    introVideo.currentTime = 0;
    const playPromise = introVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // If sound-on playback is ever blocked for some reason, retry muted
        // so the visitor still sees the animation.
        console.warn('Intro video play was blocked, retrying muted:', err);
        introVideo.muted = true;
        introVideo.play();
      });
    }
  }

  // ---- Step 2: cinematic crossfade from intro into the invitation --------
  // intro.mp4 ends on its own warm golden bloom. We keep that final frame
  // on screen (a paused <video> keeps showing its last frame), start
  // invitation.mp4 playing underneath it, add one warm expanding light
  // pulse at the cut point, then dissolve the frozen intro frame away so
  // the invitation is revealed *through* the light rather than a hard cut.
  let transitionStarted = false;

  function beginIntroToInvitationTransition() {
    if (transitionStarted) return;
    transitionStarted = true;

    // Pausing here (fractionally before the true final frame, see below)
    // locks in a clean, fully-rendered frame to dissolve from — some
    // browsers can show a blank frame right at a video's exact end, and
    // this avoids that risk entirely.
    introVideo.pause();

    // Start the invitation playing behind the still-visible intro frame.
    invitationScreen.classList.add('is-active');
    invitationVideo.currentTime = 0;
    const invitationPlay = invitationVideo.play();
    if (invitationPlay !== undefined) {
      invitationPlay.catch((err) => {
        console.warn('Invitation video autoplay was blocked:', err);
      });
    }

    // Trigger the expanding warm bloom right at the cut point.
    bloom.classList.remove('is-blooming');
    void bloom.offsetWidth; // restart the animation reliably
    bloom.classList.add('is-blooming');

    // The invitation itself briefly runs bright/warm, then smoothly settles
    // back to normal — it should look illuminated by the envelope's light,
    // not simply faded in from black.
    invitationVideo.classList.remove('is-revealing');
    invitationGlow.classList.remove('is-revealing');
    void invitationVideo.offsetWidth; // restart reliably
    invitationVideo.classList.add('is-revealing');
    invitationGlow.classList.add('is-revealing');

    // Let one frame render (invitation now underneath, bloom starting),
    // then begin dissolving the frozen intro frame to reveal it.
    requestAnimationFrame(() => {
      introScreen.classList.add('is-transitioning-out');
    });
  }

  // Start the transition just shy of intro.mp4's true last frame — this is
  // the frame we freeze on, and staying a hair before the very end avoids
  // any risk of a blank/black frame that some browsers briefly show right
  // as a video hits its exact end. 'ended' is kept as a safety fallback in
  // case 'timeupdate' never fires close enough to the threshold.
  introVideo.addEventListener('timeupdate', () => {
    if (!introVideo.duration) return;
    if (introVideo.duration - introVideo.currentTime <= 0.15) {
      beginIntroToInvitationTransition();
    }
  });
  introVideo.addEventListener('ended', beginIntroToInvitationTransition);

  // Once the intro layer has fully faded away, clean it up so it can't
  // block clicks or flash back in.
  introScreen.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'opacity') return;
    if (!introScreen.classList.contains('is-transitioning-out')) return;

    introScreen.classList.remove('is-active', 'is-transitioning-out');
    bloom.classList.remove('is-blooming');
    introVideo.pause();
  });

  // Tidy up the reveal classes once their brightness animation finishes —
  // the filter is back to normal by then, so this is just housekeeping.
  invitationVideo.addEventListener('animationend', (event) => {
    if (event.animationName === 'invitationRevealBrightness') {
      invitationVideo.classList.remove('is-revealing');
    }
  });
  invitationGlow.addEventListener('animationend', (event) => {
    if (event.animationName === 'invitationGlowFade') {
      invitationGlow.classList.remove('is-revealing');
    }
  });

  // ---- Step 3: invitation.mp4 plays once, then settles on invitation.png -
  const scrollHint = document.getElementById('scrollHint');
  let scrollHintListenersAttached = false;

  function hideScrollHint() {
    if (!scrollHint) return;
    scrollHint.classList.remove('is-visible');
    scrollHint.classList.add('is-hidden');
  }

  invitationVideo.addEventListener('ended', () => {
    invitationImage.classList.add('is-active');

    // The scrollable website begins here. Nothing above this line changes —
    // this only lifts the existing scroll lock so the visitor can continue
    // down into the website; bgMusic is untouched and keeps playing.
    document.documentElement.classList.add('is-unlocked');
    document.body.classList.add('is-unlocked');

    // Show the scroll hint now that the site is unlocked. Purely visual —
    // it never touches scroll behavior itself.
    if (scrollHint) {
      scrollHint.classList.add('is-visible');

      if (!scrollHintListenersAttached) {
        scrollHintListenersAttached = true;
        window.addEventListener('scroll', hideScrollHint, { once: true, passive: true });
        window.addEventListener('touchstart', hideScrollHint, { once: true, passive: true });
      }
    }
  });
  initScrollReveal();
  initScratchCard();
  initWalimaCountdown();
});

// ============================================================================
// Website (post-invitation.png) — scroll reveals, scratch card, countdown
// Entirely new, self-contained functions. Nothing above this point is
// referenced or modified.
// ============================================================================

function initScrollReveal() {
  const revealEls = document.querySelectorAll('#website .reveal');
  if (!revealEls.length) return;

  if (!('IntersectionObserver' in window)) {
    // No observer support: just show everything immediately.
    revealEls.forEach((el) => el.classList.add('is-in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initScratchCard() {
  const card = document.getElementById('scratchCard');
  const canvas = document.getElementById('scratchCanvas');
  const fallbackButton = document.getElementById('scratchFallback');
  const hint = document.getElementById('scratchHint');
  if (!card || !canvas || !fallbackButton) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
let isPointerDown = false;
let revealed = false;
let totalScratchDistance = 0;
let lastX = 0;
let lastY = 0;

  function sizeCanvas() {
    const rect = card.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    paintForeground();
  }

  function paintForeground() {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e7d3b1');
    gradient.addColorStop(0.5, '#c9a874');
    gradient.addColorStop(1, '#e7d3b1');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(74, 63, 52, 0.85)';
    ctx.font = `${Math.max(14, width * 0.06)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Scratch to reveal', width / 2, height / 2);
  }

  function scratchAt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(32, width * 0.10), 0, Math.PI * 2);
    ctx.fill();
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

function spawnCelebration() {
  const celebration = document.createElement('div');
  celebration.className = 'scratch-celebration';

  const glow = document.createElement('div');
  glow.className = 'scratch-celebration__glow';
  celebration.appendChild(glow);

  const sparkCount = 8;
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 * i) / sparkCount;
    const distance = width * 0.3;
    const spark = document.createElement('span');
    spark.className = 'scratch-celebration__spark';
    spark.style.setProperty('--sx', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--sy', `${Math.sin(angle) * distance}px`);
    spark.style.animationDelay = `${i * 0.02}s`;
    celebration.appendChild(spark);
  }

  const confettiCount = 12;
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('span');
    const isDiamond = i % 3 === 0;
    confetti.className = 'scratch-celebration__confetti' + (isDiamond ? ' scratch-celebration__confetti--diamond' : '');
    confetti.style.left = `${10 + Math.random() * 80}%`;
    confetti.style.top = `${8 + Math.random() * 50}%`;
    confetti.style.background = i % 2 === 0 ? 'var(--site-gold)' : '#e7d3b1';
    confetti.style.setProperty('--fall', `${14 + Math.random() * 16}px`);
    confetti.style.animationDelay = `${(Math.random() * 0.25).toFixed(2)}s`;
    celebration.appendChild(confetti);
  }

  card.appendChild(celebration);
  setTimeout(() => celebration.remove(), 1500);
}

function revealCard() {
  if (revealed) return;
  revealed = true;

  canvas.style.transition = 'opacity 0.6s ease';
  canvas.style.opacity = '0';

  if (hint) hint.classList.add('is-hidden');

  spawnCelebration();

  setTimeout(() => {
    canvas.style.display = 'none';
  }, 650);
}

canvas.addEventListener('pointerdown', (event) => {
  if (revealed) return;

  isPointerDown = true;

  const p = pointFromEvent(event);
  lastX = p.x;
  lastY = p.y;
  scratchAt(p.x, p.y);
});

canvas.addEventListener('pointermove', (event) => {
  if (!isPointerDown || revealed) return;

  const p = pointFromEvent(event);
  scratchAt(p.x, p.y);

  const dx = p.x - lastX;
  const dy = p.y - lastY;
  totalScratchDistance += Math.sqrt(dx * dx + dy * dy);
  lastX = p.x;
  lastY = p.y;

  // A few natural strokes over a small central area is enough — no need
  // to cover most of the card. The overlay disappears the instant this
  // running total is reached, regardless of how many times the finger
  // lifted and came back down.
  if (totalScratchDistance > width * 1.6) {
    revealCard();
  }
});

function finishSwipe() {
  isPointerDown = false;
}

canvas.addEventListener('pointerup', finishSwipe);
canvas.addEventListener('pointercancel', finishSwipe);
canvas.addEventListener('pointerleave', finishSwipe);

  // Accessible / no-canvas fallback: reveals immediately, no separate visible
  // control needed for pointer users since the canvas itself is the control.
  fallbackButton.addEventListener('click', revealCard);

  if (window.ResizeObserver) {
    new ResizeObserver(sizeCanvas).observe(card);
  } else {
    window.addEventListener('resize', sizeCanvas);
  }
  sizeCanvas();
}

function initWalimaCountdown() {
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minutesEl = document.getElementById('cdMinutes');
  const secondsEl = document.getElementById('cdSeconds');
  const caption = document.querySelector('.countdown-caption');
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  // 18 November 2026, 7:00 PM IST (UTC+5:30) — confirmed target.
  const target = new Date('2026-11-18T19:00:00+05:30').getTime();

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      if (caption) caption.textContent = "It's time — Alhamdulillah!";
      clearInterval(intervalId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  let intervalId = setInterval(tick, 1000);
  tick();
}
