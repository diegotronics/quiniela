// Sistema de iconografía unificado (punto 19 del análisis UX/UI).
//
// Principios:
//   - Trazo único de 1.75px.
//   - Línea redondeada en extremos y uniones (stroke-linecap/join="round").
//   - viewBox 24×24 normalizado.
//   - Tamaño por defecto consistente por familia:
//       · 20px → iconos de navegación/UI principal (Home, Bell, Trophy, etc.)
//       · 16px → glyphs de control (Chevron, Plus, Check, More)
//       · 14px → inline en texto / pills (Lock, Fire, Heart)
//     Se puede sobrescribir con la prop `size` o las props `width`/`height`.
//   - Inspiración visual: Lucide / Phosphor (outline minimal, sin fills).

const STROKE = 1.75;

function svgFactory(baseSize, draw) {
  const Comp = ({ size, width, height, color, style, ...rest }) => {
    const w = width ?? size ?? baseSize;
    const h = height ?? size ?? baseSize;
    return (
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        aria-hidden="true"
        {...rest}
      >
        {draw}
      </svg>
    );
  };
  return Comp;
}

export const Icon = {
  // ── Navegación principal (20px) ───────────────────────────────
  Home: svgFactory(20, (
    <>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10.5V20a1 1 0 0 0 1 1h3.5v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21H18a1 1 0 0 0 1-1v-9.5" />
    </>
  )),
  Bracket: svgFactory(20, (
    <>
      <path d="M3 5h4a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h4" />
      <path d="M3 19h4a2 2 0 0 0 2-2" />
    </>
  )),
  Cal: svgFactory(20, (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <circle cx="8" cy="15" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="0.6" fill="currentColor" stroke="none" />
    </>
  )),
  Trophy: svgFactory(20, (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M10 14h4v3h2v3H8v-3h2v-3z" />
    </>
  )),
  User: svgFactory(20, (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4 20.5c1.4-4 4.6-6 8-6s6.6 2 8 6" />
    </>
  )),

  // ── Header / acción (18-20px) ─────────────────────────────────
  Bell: svgFactory(18, (
    <>
      <path d="M6 9.5a6 6 0 0 1 12 0V14l1.6 2.4a1 1 0 0 1-.84 1.55H5.24a1 1 0 0 1-.84-1.55L6 14V9.5z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  )),
  Chat: svgFactory(18, (
    <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-8.2L6 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z" />
  )),
  Search: svgFactory(18, (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.5-4.5" />
    </>
  )),
  Filter: svgFactory(16, (
    <path d="M4 5h16l-6.2 8.2v5l-3.6-1.8v-3.2L4 5z" />
  )),

  // ── Glyphs de control (16px) ──────────────────────────────────
  Chevron: svgFactory(16, (
    <path d="M9.5 6l6 6-6 6" />
  )),
  ChevronD: svgFactory(16, (
    <path d="M6 9.5l6 6 6-6" />
  )),
  ChevronL: svgFactory(16, (
    <path d="M14.5 6l-6 6 6 6" />
  )),
  Check: svgFactory(16, (
    <path d="M5 12.5l4 4 10-10" strokeWidth="2" />
  )),
  X: svgFactory(16, (
    <path d="M6 6l12 12M18 6L6 18" />
  )),
  Plus: svgFactory(16, (
    <path d="M12 5v14M5 12h14" />
  )),
  Minus: svgFactory(16, (
    <path d="M5 12h14" />
  )),
  More: svgFactory(16, (
    <>
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  )),
  Arrow: svgFactory(16, (
    <path d="M4 12h15m-5-6l6 6-6 6" />
  )),

  // ── Inline / pills (14px) ─────────────────────────────────────
  Heart: svgFactory(14, (
    <path d="M12 20.5s-7-4.2-9-8.5c-1.5-3.2 1-6.5 4.2-6.5 1.85 0 3.3 1 4.8 2.7 1.5-1.7 2.95-2.7 4.8-2.7 3.2 0 5.7 3.3 4.2 6.5-2 4.3-9 8.5-9 8.5z" />
  )),
  Fire: svgFactory(14, (
    <path d="M12 3s2 2.5 2 5c0 1.2-.6 2.2-1.5 2.6 0-1.3-.7-2.1-.7-2.1S8 11 8 14a4 4 0 0 0 8 0c0-1.3-.5-2.6-1.4-3.6 0 0 .4-1.4-.2-3-.5-1.2-1.4-2.4-2.4-3.4z" />
  )),
  Stadium: svgFactory(16, (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="5" />
      <path d="M5 12a7 5 0 0 0 14 0" />
      <path d="M12 7v10" strokeDasharray="1 2" />
    </>
  )),
  Clock: svgFactory(14, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  )),
  Crown: svgFactory(16, (
    <path d="M3 8l4 4.5 5-7.5 5 7.5 4-4.5-1.6 11H4.6L3 8z" />
  )),
  Lock: svgFactory(14, (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  )),

  // ── Utilidades (16px) ─────────────────────────────────────────
  Gear: svgFactory(16, (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.1a7.5 7.5 0 0 0 0-2.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.9-1.1L14.6 3h-4l-.5 2.8a7.5 7.5 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2.2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.9 1.1l.5 2.8h4l.5-2.8a7.5 7.5 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.6z" />
    </>
  )),
  Group: svgFactory(16, (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10.5" r="2.5" />
      <path d="M3 19c1-3 3.4-4.5 6-4.5s5 1.5 6 4.5" />
      <path d="M15 18.5c.7-2 2.4-3 4-3s3 1 4 3" />
    </>
  )),
  Send: svgFactory(16, (
    <>
      <path d="M3.5 12L21 4l-7.5 17.5L11 14l-7.5-2z" />
      <path d="M11 14l4-4" />
    </>
  )),
  Logout: svgFactory(16, (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h12" />
    </>
  )),
  Copy: svgFactory(14, (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15.5V5.5A2 2 0 0 1 7 3.5h10" />
    </>
  )),
  Edit: svgFactory(14, (
    <>
      <path d="M4 20h4l11-11-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </>
  )),
  Trash: svgFactory(14, (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  )),
  Moon: svgFactory(16, (
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a.5.5 0 0 0-.7-.5 9 9 0 1 0 11.7 11.7.5.5 0 0 0-.5-.7z" />
  )),
  Sun: svgFactory(16, (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
    </>
  )),
};
