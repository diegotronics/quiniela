// Llama SVG animada que crece con la racha del usuario (patrón Duolingo).
// Tres niveles visuales: 0 (ember), 1-2 (pequeña), 3-5 (media + glow),
// 6+ (grande + glow intenso + chispas).

function tier(streak) {
  if (streak <= 0) return 0;
  if (streak < 3) return 1;
  if (streak < 6) return 2;
  return 3;
}

const SIZES = {
  0: 36,
  1: 44,
  2: 56,
  3: 68,
};

const COLORS = {
  cold: { core: "var(--ink-4)", body: "var(--ink-3)", base: "var(--ink-3)" },
  warm: { core: "oklch(0.94 0.10 75)", body: "var(--gold)",  base: "var(--coral)" },
  hot:  { core: "oklch(0.96 0.10 85)", body: "var(--coral)", base: "var(--danger)" },
  blaze:{ core: "oklch(0.98 0.06 95)", body: "var(--coral)", base: "var(--danger)" },
};

function paletteFor(t) {
  if (t === 0) return COLORS.cold;
  if (t === 1) return COLORS.warm;
  if (t === 2) return COLORS.hot;
  return COLORS.blaze;
}

export function StreakFlame({ streak = 0, size, animated = true, withEmbers = true }) {
  const t = tier(streak);
  const px = size || SIZES[t];
  const pal = paletteFor(t);
  const cold = t === 0;
  const glowClass = !cold && animated && t >= 2 ? "flame-glow" : "";
  const bodyClass = !cold && animated ? "flame-body" : "";

  return (
    <div style={{ position: "relative", display: "inline-flex", width: px, height: px }}>
      <svg
        viewBox="0 0 64 80"
        width={px}
        height={px}
        className={glowClass}
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`flame-body-${t}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.core} />
            <stop offset="55%" stopColor={pal.body} />
            <stop offset="100%" stopColor={pal.base} />
          </linearGradient>
          <linearGradient id={`flame-core-${t}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.core} stopOpacity="0.95" />
            <stop offset="100%" stopColor={pal.body} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <g className={bodyClass}>
          {/* Cuerpo principal de la llama */}
          <path
            d="M32 6
               C 40 18, 50 24, 50 42
               C 50 58, 42 70, 32 74
               C 22 70, 14 58, 14 42
               C 14 28, 22 22, 26 14
               C 28 22, 30 24, 32 22
               C 32 16, 30 12, 32 6 Z"
            fill={`url(#flame-body-${t})`}
          />
          {/* Núcleo interno */}
          <path
            d="M32 22
               C 36 30, 40 36, 40 46
               C 40 56, 36 64, 32 66
               C 28 64, 24 56, 24 46
               C 24 38, 28 32, 32 22 Z"
            fill={`url(#flame-core-${t})`}
            opacity={cold ? 0.5 : 0.85}
          />
          {/* Brillo central */}
          {!cold && (
            <ellipse
              cx="32"
              cy="52"
              rx="4"
              ry="8"
              fill={pal.core}
              opacity="0.85"
            />
          )}
        </g>
      </svg>

      {/* Chispas / brasas para el tier máximo */}
      {!cold && withEmbers && animated && t >= 3 && (
        <>
          <span
            className="flame-ember"
            style={{
              position: "absolute",
              top: "10%",
              left: "20%",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: pal.core,
              animationDelay: "0ms",
            }}
          />
          <span
            className="flame-ember"
            style={{
              position: "absolute",
              top: "5%",
              right: "18%",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: pal.body,
              animationDelay: "600ms",
            }}
          />
          <span
            className="flame-ember"
            style={{
              position: "absolute",
              top: "20%",
              right: "8%",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: pal.core,
              animationDelay: "1100ms",
            }}
          />
        </>
      )}
    </div>
  );
}
