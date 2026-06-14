// Tarjeta diseñada para compartir un partido y todos sus pronósticos como
// imagen en redes sociales.
//
// IMPORTANTE: esta tarjeta se rasteriza con nodeToPngBlob (ver lib/shareImage.js),
// que renderiza el nodo dentro de un <foreignObject> aislado del documento. Por
// eso aquí NO se usan variables CSS (var(--…)) ni clases: todo color y estilo va
// en línea, con valores explícitos, y solo se incrustan SVG en línea (Flag, Logo).

import { Flag } from '@/components/ui/Flag'
import { Logo } from '@/components/ui/Logo'

const C = {
  bg: '#0f0d0a',
  panel: '#1b1813',
  panelMe: '#2a2415',
  line: 'rgba(255,255,255,0.08)',
  lineMe: 'rgba(242,199,90,0.45)',
  ink: '#f6f1e7',
  ink2: 'rgba(246,241,231,0.66)',
  ink3: 'rgba(246,241,231,0.42)',
  gold: '#f2c75a',
  goldInk: '#1b1813',
}

// Color estable por nombre, en hsl explícito (sin oklch ni variables).
function avatarColors(name) {
  const hues = [148, 32, 85, 220, 280, 0, 200, 60, 320]
  const hash = [...(name || '?')].reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = hues[hash % hues.length]
  return { bg: `hsl(${hue} 45% 30%)`, fg: `hsl(${hue} 70% 82%)` }
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0] || '')
    .join('')
    .toUpperCase()
}

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

export function ShareableMatchCard({
  faseNombre,
  grupo,
  equipoLocal,
  equipoVisitante,
  codeLocal,
  codeVisitante,
  isFinal,
  golesLocal,
  golesVisitante,
  fechaTexto,
  players = [],
  width = 480,
}) {
  const isDraw = isFinal && golesLocal === golesVisitante
  const winner =
    isFinal && !isDraw ? (golesLocal > golesVisitante ? 'local' : 'visitante') : null

  return (
    <div
      style={{
        width,
        boxSizing: 'border-box',
        background: C.bg,
        color: C.ink,
        fontFamily: FONT,
        padding: '28px 28px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Encabezado de marca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo size={30} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
            La Copa Familiar
          </span>
          <span style={{ fontSize: 11, color: C.ink3, letterSpacing: 0.3 }}>
            {faseNombre || 'Partido'}
            {grupo ? ` · Grupo ${grupo}` : ''}
          </span>
        </div>
      </div>

      {/* Marcador del partido */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 14,
          padding: '6px 0 4px',
        }}
      >
        <TeamCol
          team={equipoLocal}
          code={codeLocal}
          dim={winner === 'visitante'}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            minWidth: 96,
          }}
        >
          {isFinal ? (
            <>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: isDraw ? C.gold : 'rgba(255,255,255,0.1)',
                  color: isDraw ? C.goldInk : C.ink,
                }}
              >
                {isDraw ? 'Empate' : 'Final'}
              </span>
              <span
                style={{
                  fontSize: 46,
                  fontWeight: 800,
                  letterSpacing: -2,
                  lineHeight: 1,
                }}
              >
                <span style={{ opacity: winner === 'visitante' ? 0.5 : 1 }}>
                  {golesLocal}
                </span>
                <span style={{ opacity: 0.4, margin: '0 8px' }}>–</span>
                <span style={{ opacity: winner === 'local' ? 0.5 : 1 }}>
                  {golesVisitante}
                </span>
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  color: C.ink3,
                  textTransform: 'uppercase',
                }}
              >
                vs
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink2,
                  textAlign: 'center',
                }}
              >
                {fechaTexto}
              </span>
            </>
          )}
        </div>
        <TeamCol
          team={equipoVisitante}
          code={codeVisitante}
          dim={winner === 'local'}
        />
      </div>

      {/* Título de la lista */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: C.ink3,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 16,
        }}
      >
        Pronósticos de la familia
      </div>

      {/* Lista de pronósticos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.map((p, i) => {
          const ac = avatarColors(p.nombre)
          const has = p.goles_local != null
          const won = p.puntos_obtenidos != null && p.puntos_obtenidos > 0
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 14,
                background: p.isMe ? C.panelMe : C.panel,
                border: `1px solid ${p.isMe ? C.lineMe : C.line}`,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: ac.bg,
                  color: ac.fg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(p.nombre)}
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.ink,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.nombre}
                {p.isMe ? (
                  <span style={{ color: C.gold, fontWeight: 700 }}> · Tú</span>
                ) : null}
              </span>
              {has ? (
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  {won ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.goldInk,
                        background: C.gold,
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}
                    >
                      +{p.puntos_obtenidos}
                    </span>
                  ) : null}
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: -0.5,
                      color: C.ink,
                    }}
                  >
                    {p.goles_local} – {p.goles_visitante}
                  </span>
                </span>
              ) : (
                <span style={{ fontSize: 12, color: C.ink3 }}>Sin pronóstico</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Pie */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: C.ink3,
          letterSpacing: 0.3,
          paddingTop: 4,
        }}
      >
        lacopafamiliar · Mundial 2026
      </div>
    </div>
  )
}

function TeamCol({ team, code, dim }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: dim ? 0.55 : 1,
      }}
    >
      <Flag code={code} w={54} h={38} rounded={6} />
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: -0.2,
          textAlign: 'center',
          color: C.ink,
        }}
      >
        {team}
      </span>
    </div>
  )
}
