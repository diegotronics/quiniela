// Empty states ilustrados (punto 17 del análisis UX/UI).
//
// Sustituyen los textos planos del tipo "No hay X todavía" por una
// ilustración SVG ligera + título + descripción + CTA opcional.
//
// La animación de flotación se desactiva con prefers-reduced-motion (CSS global).

const ILLUSTRATIONS = {
  whistle: WhistleIllu,
  ball: BallIllu,
  trophy: TrophyEmptyIllu,
  chat: ChatIllu,
  envelope: EnvelopeIllu,
  cal: CalEmptyIllu,
};

export function EmptyState({
  illustration = "ball",
  title,
  description,
  cta,
  compact = false,
  style,
}) {
  const Illu = ILLUSTRATIONS[illustration] || BallIllu;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px dashed var(--line-strong)",
        borderRadius: "var(--r-xl)",
        padding: compact ? "24px 18px" : "32px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 10 : 14,
        textAlign: "center",
        boxShadow: "var(--shadow-0)",
        ...style,
      }}
    >
      <div className="empty-illu" aria-hidden="true">
        <Illu size={compact ? 72 : 96} />
      </div>
      {title && (
        <h3
          style={{
            margin: 0,
            fontSize: compact ? 15 : 17,
            fontWeight: 700,
            color: "var(--ink)",
            letterSpacing: -0.3,
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--ink-3)",
            maxWidth: 280,
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      )}
      {cta && (
        <button
          onClick={cta.onClick}
          className="btn-interactive"
          style={{
            marginTop: 4,
            background: "var(--ink)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 999,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
          }}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}

// ── Ilustraciones SVG ───────────────────────────────────────────
// Paleta basada en tokens del sistema (`--surface-2`, `--line-strong`, `--ink-3`, `--gold`, etc).
// Se mantienen ligeras (≤ 1.5 KB cada una) y sin dependencias externas.

function WhistleIllu({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="var(--surface-2)" />
      <path
        d="M28 50c0-9 7-16 16-16h22a4 4 0 0 1 4 4v8l8-4v18l-8-4v8a4 4 0 0 1-4 4H44c-9 0-16-7-16-16z"
        fill="var(--surface)"
        stroke="var(--ink-3)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="44" cy="50" r="6" fill="var(--coral-soft)" stroke="var(--coral-ink)" strokeWidth="1.6" />
      <path d="M44 50l3-2" stroke="var(--coral-ink)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BallIllu({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="var(--surface-2)" />
      <circle cx="48" cy="48" r="26" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.6" />
      <polygon
        points="48,38 56,44 53,53 43,53 40,44"
        fill="var(--ink)"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M48 38L48 28 M56 44L66 41 M53 53L60 62 M43 53L36 62 M40 44L30 41"
        stroke="var(--ink-2)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrophyEmptyIllu({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="var(--gold-soft)" />
      <path
        d="M34 26h28v18a14 14 0 0 1-28 0V26z"
        fill="var(--surface)"
        stroke="var(--gold-ink)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M34 30h-6v6a6 6 0 0 0 6 6"
        stroke="var(--gold-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M62 30h6v6a6 6 0 0 1-6 6"
        stroke="var(--gold-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M44 58h8v6h4v6H40v-6h4v-6z" fill="var(--surface)" stroke="var(--gold-ink)" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="48" cy="38" r="2.5" fill="var(--gold)" />
    </svg>
  );
}

function ChatIllu({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="var(--accent-soft)" />
      <path
        d="M22 38c0-5.5 4.5-10 10-10h26c5.5 0 10 4.5 10 10v14c0 5.5-4.5 10-10 10h-8l-10 8v-8h-8c-5.5 0-10-4.5-10-10V38z"
        fill="var(--surface)"
        stroke="var(--accent-ink)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="45" r="2" fill="var(--accent-ink)" />
      <circle cx="46" cy="45" r="2" fill="var(--accent-ink)" />
      <circle cx="54" cy="45" r="2" fill="var(--accent-ink)" />
    </svg>
  );
}

function EnvelopeIllu({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="var(--surface-2)" />
      <rect
        x="22"
        y="32"
        width="52"
        height="34"
        rx="4"
        fill="var(--surface)"
        stroke="var(--ink-2)"
        strokeWidth="1.8"
      />
      <path d="M22 36l26 18 26-18" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="72" cy="34" r="6" fill="var(--coral)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}

function CalEmptyIllu({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="var(--surface-2)" />
      <rect x="24" y="28" width="48" height="44" rx="5" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.8" />
      <path d="M24 40h48" stroke="var(--ink-2)" strokeWidth="1.8" />
      <path d="M34 22v10M62 22v10" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 56l4 4 12-12" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
