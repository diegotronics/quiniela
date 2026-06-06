import confetti from "canvas-confetti";

const REDUCE_MOTION = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Paleta festiva Mundial 2026 — rojo · magenta · azul estadio · oro · verde cancha
const PALETTE = {
  exact:    ["#F2B91A", "#E5172E", "#E5179B", "#2E5BFF", "#FFFFFF"],
  win:      ["#2E5BFF", "#E5179B", "#FFFFFF", "#F2B91A"],
  champion: ["#F2B91A", "#FFE066", "#E5179B", "#E5172E", "#2E5BFF"],
  podium:   ["#F2B91A", "#2E5BFF", "#E5179B", "#FFFFFF"],
};

function vibrate(pattern) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* noop */
  }
}

function fire(opts) {
  if (REDUCE_MOTION()) return;
  return confetti(opts);
}

export function celebrateExact() {
  fire({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    origin: { y: 0.7 },
    colors: PALETTE.exact,
    scalar: 0.9,
  });
  fire({
    particleCount: 40,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.8 },
    colors: PALETTE.exact,
  });
  fire({
    particleCount: 40,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.8 },
    colors: PALETTE.exact,
  });
  vibrate([15, 30, 15]);
}

export function celebrateWin() {
  fire({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.75 },
    colors: PALETTE.win,
    scalar: 0.8,
  });
  vibrate([10, 20]);
}

export function celebrateChampion() {
  const end = Date.now() + 1400;
  (function frame() {
    fire({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: PALETTE.champion,
    });
    fire({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: PALETTE.champion,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  fire({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors: PALETTE.champion,
    scalar: 1.1,
  });
  vibrate([20, 40, 20, 40, 20]);
}

export function celebratePodium() {
  fire({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    colors: PALETTE.podium,
    scalar: 1.0,
  });
  vibrate([15, 25, 15]);
}

const FIRED = new Set();

export function celebrateOnce(key, runner) {
  if (FIRED.has(key)) return;
  FIRED.add(key);
  runner();
}
