// Skeleton loaders (punto 16 del análisis UX/UI).
// Cajas con shimmer animado que sustituyen a los textos "Cargando…".
// La animación se desactiva con prefers-reduced-motion (vía CSS global).

// Balón rodando — loader temático para estados de carga prolongada.
export function BallLoader({ size = 28, label }) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: size * 4,
          height: size,
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span
          className="ball-roll"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: size,
            height: size,
            display: "inline-block",
          }}
        >
          <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r="14" fill="#fff" stroke="var(--ink)" strokeWidth="1.4" />
            <path d="M16 6 L20 9.5 L18 14 L14 14 L12 9.5 Z" fill="var(--ink)" />
            <path d="M16 2.5 L18.6 5.2 L13.4 5.2 Z" fill="var(--ink)" />
            <path d="M27 11 L23.2 13 L23.2 8.4 Z" fill="var(--ink)" />
            <path d="M5 11 L8.8 13 L8.8 8.4 Z" fill="var(--ink)" />
            <path d="M22.4 23 L19.4 20.4 L22.6 18.6 Z" fill="var(--ink)" />
            <path d="M9.6 23 L12.6 20.4 L9.4 18.6 Z" fill="var(--ink)" />
          </svg>
        </span>
      </div>
      {label && (
        <span style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>
          {label}
        </span>
      )}
    </div>
  );
}

export function Skeleton({
  w = "100%",
  h = 12,
  r = 6,
  style,
  className = "",
}) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: typeof h === "number" ? `${h}px` : h,
        borderRadius: r,
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3, lastWidth = "60%", gap = 8 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          h={11}
          w={i === lines - 1 ? lastWidth : "100%"}
        />
      ))}
    </div>
  );
}

// Card que emula un partido en la lista (Partidos / Inicio).
export function SkeletonMatchCard() {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--line)",
        padding: 14,
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Skeleton w={70} h={18} r={999} />
        <Skeleton w={90} h={18} r={999} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 60px 1fr",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Skeleton w={32} h={22} r={4} />
          <Skeleton w={84} h={12} />
        </div>
        <Skeleton w={44} h={18} style={{ margin: "0 auto" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexDirection: "row-reverse",
          }}
        >
          <Skeleton w={32} h={22} r={4} />
          <Skeleton w={84} h={12} />
        </div>
      </div>
    </div>
  );
}

// Lista de partidos agrupados por día con un header de día.
export function SkeletonMatchList({ count = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 4px 10px",
          }}
        >
          <Skeleton w={130} h={13} />
          <Skeleton w={60} h={11} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonMatchCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Fila para la tabla de posiciones (LeaderRow).
export function SkeletonRankRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface)",
        border: "0.5px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: "10px 12px",
      }}
    >
      <Skeleton w={16} h={13} />
      <Skeleton w={32} h={32} r={999} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton w="55%" h={12} />
        <Skeleton w="30%" h={10} />
      </div>
      <Skeleton w={36} h={16} />
    </div>
  );
}

// Podio (3 columnas con altura diferencial — refleja el podio real).
export function SkeletonPodium() {
  const heights = [52, 76, 34];
  const avatars = [56, 72, 56];
  return (
    <div
      style={{
        padding: "26px 12px 0",
        borderRadius: "var(--r-xl)",
        border: "0.5px solid var(--line)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-1)",
        display: "grid",
        gridTemplateColumns: "1fr 1.15fr 1fr",
        gap: 10,
        alignItems: "end",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
        >
          <Skeleton w={avatars[i]} h={avatars[i]} r={999} />
          <Skeleton w="60%" h={11} />
          <Skeleton w={40} h={18} />
          <div style={{ width: "100%", marginTop: 6 }}>
            <Skeleton w="100%" h={heights[i]} r={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Bloque para MatchDetail (cabecera con dos equipos + bandera grande).
export function SkeletonMatchHeader() {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--line)",
        padding: 18,
        boxShadow: "var(--shadow-1)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Skeleton w={80} h={18} r={999} />
        <Skeleton w={56} h={14} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px 1fr",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Skeleton w={52} h={36} r={4} />
          <Skeleton w={68} h={12} />
        </div>
        <Skeleton w={54} h={28} style={{ margin: "0 auto" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Skeleton w={52} h={36} r={4} />
          <Skeleton w={68} h={12} />
        </div>
      </div>
    </div>
  );
}

// Mensajes de chat con burbujas alternadas.
export function SkeletonChatMessages({ count = 5 }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "8px 4px",
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const mine = i % 3 === 0;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: mine ? "flex-end" : "flex-start",
              gap: 8,
            }}
          >
            {!mine && <Skeleton w={28} h={28} r={999} />}
            <Skeleton
              w={`${50 + ((i * 13) % 35)}%`}
              h={32 + ((i * 7) % 16)}
              r={14}
            />
          </div>
        );
      })}
    </div>
  );
}
