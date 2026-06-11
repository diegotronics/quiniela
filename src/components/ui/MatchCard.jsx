import { Card } from './Card.jsx'
import { Pill } from './Pill.jsx'
import { Icon } from './Icon.jsx'
import { TeamRow } from './TeamRow.jsx'
import { LiveBadge } from './LiveBadge.jsx'
import { formatearHoraCorta } from '@/lib/fechas'

function winnerSideOf(m) {
  if (!m || !m.resultado_ingresado) return null
  if (m.goles_local === m.goles_visitante) return null
  return m.goles_local > m.goles_visitante ? 'local' : 'visitante'
}

function StatusPill({ match, pred }) {
  const isFinal = !!match.resultado_ingresado
  const isDraw = isFinal && match.goles_local === match.goles_visitante
  const tienePick =
    pred && pred.goles_local != null && pred.goles_visitante != null

  if (isFinal) {
    if (isDraw) {
      return (
        <Pill tone="gold">
          <Icon.Check style={{ width: 11, height: 11 }} /> Empate
        </Pill>
      )
    }
    return (
      <Pill tone="default">
        <Icon.Check style={{ width: 11, height: 11 }} /> Finalizado
      </Pill>
    )
  }
  if (tienePick) {
    return (
      <Pill tone="accent">
        <Icon.Check style={{ width: 11, height: 11 }} /> Pronosticado
      </Pill>
    )
  }
  return (
    <Pill tone="coral" dot>
      Pendiente
    </Pill>
  )
}

function PointsBanner({ pred, match }) {
  if (!match.resultado_ingresado) return null
  if (!pred || pred.puntos_obtenidos == null) return null
  const exacto =
    Number(pred.goles_local) === Number(match.goles_local) &&
    Number(pred.goles_visitante) === Number(match.goles_visitante)
  const ganado = pred.puntos_obtenidos > 0
  const palette = exacto
    ? { bg: 'var(--gold-soft)', fg: 'var(--gold-ink)', bd: 'var(--gold)' }
    : ganado
      ? {
          bg: 'var(--accent-soft)',
          fg: 'var(--accent-ink)',
          bd: 'color-mix(in oklab, var(--accent) 30%, transparent)',
        }
      : { bg: 'var(--surface-2)', fg: 'var(--ink-3)', bd: 'var(--line)' }
  return (
    <div
      style={{
        marginTop: 10,
        padding: '8px 12px',
        borderRadius: 'var(--r-md)',
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.bd}`,
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span>
        {exacto ? 'Resultado exacto · ' : ''}
        {ganado ? `+${pred.puntos_obtenidos} pts` : '0 pts'}
      </span>
      <Icon.Chevron />
    </div>
  )
}

function hour(iso) {
  return formatearHoraCorta(iso)
}

/**
 * MatchCard — tarjeta de partido en sus distintas variantes.
 *
 * Variants:
 *  - "list" (default): fila compacta con Pill de estado + marcador.
 *  - "live": variante oscura "en vivo" (header oscuro + LiveBadge + score grande).
 *  - "bracket": tarjeta mini para llaves eliminatorias.
 */
export function MatchCard({ variant = 'list', ...props }) {
  if (variant === 'live') return <MatchCardLive {...props} />
  if (variant === 'bracket') return <MatchCardBracket {...props} />
  return <MatchCardList {...props} />
}

function MatchCardList({ match, pred, onClick, groupLabel }) {
  const isFinal = !!match.resultado_ingresado
  const tienePick =
    pred && pred.goles_local != null && pred.goles_visitante != null
  const winnerSide = winnerSideOf(match)

  return (
    <Card pad={14} onClick={onClick}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(groupLabel || match.grupo) && (
            <Pill tone="outline">{groupLabel || `Grupo ${match.grupo}`}</Pill>
          )}
          <span
            style={{ fontSize: 11, color: 'var(--ink-3)' }}
            className="mono"
          >
            {hour(match.fecha)}
          </span>
        </div>
        <StatusPill match={match} pred={pred} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 1fr',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <TeamRow
          team={match.equipo_local}
          isFinal={isFinal}
          isWinner={winnerSide === 'local'}
          isLoser={winnerSide === 'visitante'}
        />
        <div style={{ textAlign: 'center' }}>
          {isFinal ? (
            <span
              className="font-score score-reveal"
              style={{
                fontSize: 30,
                fontWeight: 400,
                color: 'var(--ink)',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 6,
              }}
            >
              <span
                style={{
                  color:
                    winnerSide === 'local'
                      ? 'var(--accent-ink)'
                      : winnerSide === 'visitante'
                        ? 'var(--ink-3)'
                        : 'var(--ink)',
                }}
              >
                {match.goles_local}
              </span>
              <span style={{ opacity: 0.45 }}>–</span>
              <span
                style={{
                  color:
                    winnerSide === 'visitante'
                      ? 'var(--accent-ink)'
                      : winnerSide === 'local'
                        ? 'var(--ink-3)'
                        : 'var(--ink)',
                }}
              >
                {match.goles_visitante}
              </span>
            </span>
          ) : tienePick ? (
            <div>
              <span
                className="font-score"
                style={{
                  fontSize: 24,
                  fontWeight: 400,
                  color: 'var(--ink)',
                  lineHeight: 1,
                }}
              >
                {pred.goles_local} – {pred.goles_visitante}
              </span>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--ink-3)',
                  marginTop: 2,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                tu pick
              </div>
            </div>
          ) : (
            <span
              style={{
                fontSize: 14,
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
              className="font-score"
            >
              vs
            </span>
          )}
        </div>
        <TeamRow
          team={match.equipo_visitante}
          isFinal={isFinal}
          isWinner={winnerSide === 'visitante'}
          isLoser={winnerSide === 'local'}
          direction="row-reverse"
        />
      </div>

      <PointsBanner pred={pred} match={match} />
    </Card>
  )
}

function MatchCardLive({
  match,
  pred,
  rightLabel,
  liveLocal,
  liveVisitante,
  liveMinute,
  pulseLocal = 0,
  pulseVisitante = 0,
  onClick,
}) {
  return (
    <Card
      pad={14}
      elevated
      onClick={onClick}
      className="breathe-live field-lines-light"
      style={{
        background: 'var(--gradient-nocturno)',
        borderColor: 'transparent',
        color: '#fff',
        boxShadow: 'var(--shadow-coral)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <LiveBadge minute={liveMinute} />
        {rightLabel && (
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.72)',
              fontWeight: 500,
            }}
          >
            {rightLabel}
          </span>
        )}
      </div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <TeamRow team={match.equipo_local} size="md" theme="dark" truncate />
        {liveLocal != null && liveVisitante != null ? (
          <span
            className="font-score"
            style={{
              fontSize: 38,
              fontWeight: 400,
              color: '#fff',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <span
              key={`l-${pulseLocal}`}
              className={pulseLocal > 0 ? 'bounce' : undefined}
              style={{ display: 'inline-block' }}
            >
              {liveLocal}
            </span>
            <span style={{ opacity: 0.5 }}>–</span>
            <span
              key={`v-${pulseVisitante}`}
              className={pulseVisitante > 0 ? 'bounce' : undefined}
              style={{ display: 'inline-block' }}
            >
              {liveVisitante}
            </span>
          </span>
        ) : (
          <span
            className="font-score"
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            vs
          </span>
        )}
        <TeamRow
          team={match.equipo_visitante}
          size="md"
          theme="dark"
          direction="row-reverse"
          truncate
        />
      </div>
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'rgba(255,255,255,0.72)',
        }}
      >
        {pred?.goles_local != null ? (
          <span>
            Tu pronóstico:{' '}
            <span
              className="font-score"
              style={{ color: '#fff', fontSize: 16, letterSpacing: 1 }}
            >
              {pred.goles_local}–{pred.goles_visitante}
            </span>
          </span>
        ) : (
          <span>Sin pronóstico</span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {onClick ? 'Ver partido' : 'En juego'} <Icon.Arrow />
        </span>
      </div>
    </Card>
  )
}

function MatchCardBracket({ match, pred }) {
  const winner =
    match && match.resultado_ingresado
      ? match.goles_local === match.goles_visitante
        ? null
        : match.goles_local > match.goles_visitante
          ? match.equipo_local
          : match.equipo_visitante
      : null
  const isFinal = Boolean(match?.resultado_ingresado)

  const Row = ({ equipo, isWinner, isLoser }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 10px',
        background: isWinner ? 'var(--ink)' : 'transparent',
        color: isWinner ? 'var(--bg)' : 'var(--ink)',
        borderRadius: 8,
        opacity: isLoser ? 0.55 : 1,
        transition: 'opacity 280ms ease, background 280ms ease',
      }}
    >
      {equipo ? (
        <TeamRow
          team={equipo}
          size="xs"
          theme={isWinner ? 'dark' : 'light'}
          isWinner={isWinner}
          isLoser={isLoser}
          isFinal={isFinal}
          style={{ flex: 1, opacity: 1 }}
        />
      ) : (
        <>
          <div
            style={{
              width: 20,
              height: 14,
              borderRadius: 2,
              background: 'var(--line)',
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              flex: 1,
              color: 'var(--ink)',
            }}
          >
            —
          </span>
        </>
      )}
    </div>
  )

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface)',
        borderRadius: 'var(--r-md)',
        border: '0.5px solid var(--line)',
        padding: 4,
        boxShadow: 'var(--shadow-1)',
      }}
    >
      <Row
        equipo={match?.equipo_local}
        isWinner={winner && winner === match.equipo_local}
        isLoser={isFinal && winner && winner !== match.equipo_local}
      />
      <Row
        equipo={match?.equipo_visitante}
        isWinner={winner && winner === match.equipo_visitante}
        isLoser={isFinal && winner && winner !== match.equipo_visitante}
      />
      {match && pred?.goles_local != null && (
        <div
          style={{
            padding: '4px 8px 2px',
            fontSize: 10,
            color: 'var(--ink-3)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Tu pick</span>
          <span className="mono">
            {pred.goles_local}–{pred.goles_visitante}
          </span>
        </div>
      )}
    </div>
  )
}
