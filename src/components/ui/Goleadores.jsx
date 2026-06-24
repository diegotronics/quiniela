// Lista compacta de goleadores en tiempo real, en dos columnas (local a la
// izquierda, visitante a la derecha). Pensada para fondos oscuros (tarjeta en
// vivo y cabecera del detalle). Si no hay goles anotados no renderiza nada.
export function Goleadores({ local = [], visitante = [], muted }) {
  if (!local.length && !visitante.length) return null

  const color = muted || 'rgba(255,255,255,0.72)'
  const linea = (g, i) => (
    <div
      key={`${g.nombre}-${g.minuto}-${i}`}
      style={{
        fontSize: 11.5,
        lineHeight: 1.5,
        color,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {g.nombre}
      {g.minuto != null && (
        <span style={{ opacity: 0.8 }}> {g.minuto}'</span>
      )}
      {g.penal && <span style={{ opacity: 0.7 }}> (p)</span>}
      {g.autogol && <span style={{ opacity: 0.7 }}> (ag)</span>}
    </div>
  )

  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.12)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <BallMark color={color} />
        <div style={{ minWidth: 0 }}>{local.map(linea)}</div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexDirection: 'row-reverse',
          textAlign: 'right',
        }}
      >
        <BallMark color={color} />
        <div style={{ minWidth: 0 }}>{visitante.map(linea)}</div>
      </div>
    </div>
  )
}

function BallMark({ color }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ flexShrink: 0, opacity: 0.7 }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M12 7l3.2 2.3-1.2 3.7h-4L8.8 9.3z"
        fill={color}
      />
    </svg>
  )
}
