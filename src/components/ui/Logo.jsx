// Logo de marca — trofeo con pelota de fútbol dentro.
// Mismo SVG fuente que public/favicon.svg y public/logo.svg, inlined para que
// se renderice nítido a cualquier tamaño y herede `color` cuando se necesite.
//
// Props:
//   size:    número en px (default 32)
//   rounded: true para envolver en un cuadrado navy redondeado (uso tipo app-icon)
//   bg:      color del fondo cuando rounded=true (default --ink)
//   title:   texto accesible (default "La Copa Familiar")

export function Logo({ size = 32, rounded = false, bg, title = "La Copa Familiar", ...rest }) {
  const cupGradId = "lcfLogoCup" + (rest.id || "");

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      {...rest}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={cupGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#F2C75A"/>
          <stop offset="100%" stopColor="#D08A28"/>
        </linearGradient>
      </defs>

      <path d="M18,20 C9,20 9,33 18,35" fill="none"
            stroke={`url(#${cupGradId})`} strokeWidth="4" strokeLinecap="round"/>
      <path d="M46,20 C55,20 55,33 46,35" fill="none"
            stroke={`url(#${cupGradId})`} strokeWidth="4" strokeLinecap="round"/>

      <path d="M17,16 L47,16 L 45,34 C 44.5,40 39,44 32,44 C 25,44 19.5,40 19,34 Z"
            fill={`url(#${cupGradId})`} stroke="#8A5A14" strokeWidth="1.4" strokeLinejoin="round"/>

      <g transform="translate(32 29)">
        <circle r="9" fill="#FFFFFF" stroke="#1B2A52" strokeWidth="1.2"/>
        <path d="M0,-3.4 L3.2,-1.1 L2,2.8 L-2,2.8 L-3.2,-1.1 Z" fill="#1B2A52"/>
        <path d="M  0,-9   L  2.4,-5.8 L -2.4,-5.8 Z" fill="#1B2A52"/>
        <path d="M  8.2,-3.4 L  5.6,-1   L  5.6,-5.2 Z" fill="#1B2A52"/>
        <path d="M -8.2,-3.4 L -5.6,-1   L -5.6,-5.2 Z" fill="#1B2A52"/>
        <path d="M  5.4, 7   L  2.4, 4.4 L  5.6, 2.6 Z" fill="#1B2A52"/>
        <path d="M -5.4, 7   L -2.4, 4.4 L -5.6, 2.6 Z" fill="#1B2A52"/>
      </g>

      <rect x="28" y="44" width="8" height="4" fill={`url(#${cupGradId})`}/>
      <path d="M22,48 L42,48 L39,54 L25,54 Z"
            fill={`url(#${cupGradId})`} stroke="#8A5A14" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );

  if (!rounded) return mark;

  const pad = Math.round(size * 0.12);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: bg ?? "var(--ink)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: pad,
        boxSizing: "border-box",
      }}
    >
      <svg
        width={size - pad * 2}
        height={size - pad * 2}
        viewBox="0 0 64 64"
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <defs>
          <linearGradient id={cupGradId + "-r"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#F2C75A"/>
            <stop offset="100%" stopColor="#D08A28"/>
          </linearGradient>
        </defs>
        <path d="M18,20 C9,20 9,33 18,35" fill="none"
              stroke={`url(#${cupGradId}-r)`} strokeWidth="4" strokeLinecap="round"/>
        <path d="M46,20 C55,20 55,33 46,35" fill="none"
              stroke={`url(#${cupGradId}-r)`} strokeWidth="4" strokeLinecap="round"/>
        <path d="M17,16 L47,16 L 45,34 C 44.5,40 39,44 32,44 C 25,44 19.5,40 19,34 Z"
              fill={`url(#${cupGradId}-r)`} stroke="#8A5A14" strokeWidth="1.4" strokeLinejoin="round"/>
        <g transform="translate(32 29)">
          <circle r="9" fill="#FFFFFF" stroke="#1B2A52" strokeWidth="1.2"/>
          <path d="M0,-3.4 L3.2,-1.1 L2,2.8 L-2,2.8 L-3.2,-1.1 Z" fill="#1B2A52"/>
          <path d="M  0,-9   L  2.4,-5.8 L -2.4,-5.8 Z" fill="#1B2A52"/>
          <path d="M  8.2,-3.4 L  5.6,-1   L  5.6,-5.2 Z" fill="#1B2A52"/>
          <path d="M -8.2,-3.4 L -5.6,-1   L -5.6,-5.2 Z" fill="#1B2A52"/>
          <path d="M  5.4, 7   L  2.4, 4.4 L  5.6, 2.6 Z" fill="#1B2A52"/>
          <path d="M -5.4, 7   L -2.4, 4.4 L -5.6, 2.6 Z" fill="#1B2A52"/>
        </g>
        <rect x="28" y="44" width="8" height="4" fill={`url(#${cupGradId}-r)`}/>
        <path d="M22,48 L42,48 L39,54 L25,54 Z"
              fill={`url(#${cupGradId}-r)`} stroke="#8A5A14" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
