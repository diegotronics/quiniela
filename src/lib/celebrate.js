import confetti from "canvas-confetti";

const REDUCE_MOTION = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const PALETTE = {
  exact:    ["#D4A017", "#E1794C", "#5BAA47", "#FFF1B8"],
  win:      ["#5BAA47", "#A6E0A0", "#FFFFFF"],
  champion: ["#D4A017", "#FFD86B", "#FFF1B8", "#E1794C"],
  podium:   ["#D4A017", "#C8C2B5", "#B5651D", "#FFFFFF"],
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
