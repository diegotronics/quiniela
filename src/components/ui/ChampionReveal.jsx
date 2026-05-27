export function TrophyIcon({ size = 96 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="trophy-rise"
      aria-hidden
    >
      <defs>
        <linearGradient id="trophyGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="55%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="trophyHandle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C89518" />
          <stop offset="100%" stopColor="#E0B43A" />
        </linearGradient>
      </defs>

      {/* Asas */}
      <path
        d="M22 28 C 10 30, 10 50, 26 52"
        stroke="url(#trophyHandle)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M74 28 C 86 30, 86 50, 70 52"
        stroke="url(#trophyHandle)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Copa principal */}
      <path
        d="M22 18 L74 18 L70 52 C 68 64, 56 70, 48 70 C 40 70, 28 64, 26 52 Z"
        fill="url(#trophyGold)"
        stroke="#8B6914"
        strokeWidth="1"
      />

      {/* Reflejo */}
      <path
        d="M30 24 L34 24 L32 50 C 31 54, 30 56, 28 56 Z"
        fill="rgba(255,255,255,0.4)"
      />

      {/* Estrella */}
      <path
        d="M48 32 L51 40 L60 40 L52.5 45 L55.5 53 L48 48 L40.5 53 L43.5 45 L36 40 L45 40 Z"
        fill="#FFF1B8"
        stroke="#8B6914"
        strokeWidth="0.8"
      />

      {/* Cuello */}
      <rect x="42" y="68" width="12" height="6" fill="#B5811A" />

      {/* Base */}
      <rect x="34" y="74" width="28" height="6" rx="2" fill="url(#trophyGold)" stroke="#8B6914" strokeWidth="1" />
      <rect x="30" y="80" width="36" height="6" rx="2" fill="#B5811A" stroke="#8B6914" strokeWidth="1" />
    </svg>
  );
}

export function Sparkles({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 56;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        return (
          <svg
            key={i}
            className="sparkle"
            aria-hidden
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 180}ms`,
              width: 18,
              height: 18,
              color: "var(--gold)",
            }}
            viewBox="0 0 18 18"
          >
            <path
              d="M9 0 L10.5 7.5 L18 9 L10.5 10.5 L9 18 L7.5 10.5 L0 9 L7.5 7.5 Z"
              fill="currentColor"
            />
          </svg>
        );
      })}
    </>
  );
}

export function ChampionReveal({ teamName, code: codeFn, Flag, size = 120 }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "12px 8px 4px",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <Sparkles count={6} />
        <TrophyIcon size={size} />
      </div>
      {teamName && Flag && codeFn && (
        <div
          className="win-mark"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 999,
            background: "var(--gold-soft)",
            border: "1px solid var(--gold)",
            color: "var(--gold-ink)",
            fontWeight: 700,
            letterSpacing: -0.1,
            animationDelay: "300ms",
          }}
        >
          <Flag code={codeFn(teamName)} w={26} h={18} rounded={3} />
          {teamName}
        </div>
      )}
    </div>
  );
}
