import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCountUp } from '@/hooks/useCountUp'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useFases } from '@/hooks/useFases'
import { useAllPartidos } from '@/hooks/useAllPartidos'
import { usePrediccionesUsuario } from '@/hooks/usePredicciones'
import { useOnResultadosSincronizados } from '@/hooks/useAutoSyncResultado'
import { useUsuariosPublic } from '@/hooks/useUsuarios'
import { useAsync } from '@/hooks/useAsync'
import { listPuntajesGlobales } from '@/api/predicciones'
import { listPuntajesApuestasEspeciales } from '@/api/apuestasEspeciales'
import {
  useApuestasEspecialesConfig,
  useApuestaEspecialUsuario,
} from '@/hooks/useApuestasEspeciales'
import {
  Avatar,
  Card,
  ChampionCard,
  Countdown,
  Flag,
  HeaderIconButton,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
  StatTile,
  StreakFlame,
  Button,
  ringFor,
  useKnockoutRounds,
} from '@/components/ui'
import {
  rankingFromUsers,
  userScoringStats,
  userStreak,
  proximoPartido,
  partidosEnVivo,
} from '@/lib/stats'
import { code, GROUP_NAME, GROUP_MOTTO } from '@/lib/constants'
import { formatearFechaHora } from '@/lib/fechas'
import { apuestasEspecialesCerradas } from '@/lib/apuestasEspeciales'
import { ChatPreview } from '@/components/chat/ChatPreview'
import { LiveMatchCard } from '@/components/LiveMatchCard'
import { BannerPredicciones } from '@/components/BannerPredicciones'
import { BannerPrediccionesPendientes } from '@/components/BannerPrediccionesPendientes'
import { countPrediccionesDe } from '@/lib/onboarding'
import { faltaPronostico } from '@/lib/pronosticos'

export default function Inicio() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fases } = useFases()
  const { partidos, refresh: refreshPartidos } = useAllPartidos(fases)
  const { usuarios } = useUsuariosPublic()
  const { data: puntajesRaw, refresh: refreshPuntajes } = useAsync(
    listPuntajesGlobales,
    [],
  )
  const { data: puntajesEspeciales } = useAsync(
    listPuntajesApuestasEspeciales,
    [],
  )
  const { predicciones, loading: prediccionesLoading } = usePrediccionesUsuario(
    user?.id,
  )
  const { config: apuestasCfg, loading: apuestasCfgLoading } =
    useApuestasEspecialesConfig()
  const { apuesta: apuestaUsuario, loading: apuestaLoading } =
    useApuestaEspecialUsuario(user?.id)

  const ranking = useMemo(
    () =>
      rankingFromUsers(usuarios, [
        ...(puntajesRaw || []),
        ...(puntajesEspeciales || []),
      ]),
    [usuarios, puntajesRaw, puntajesEspeciales],
  )
  const me = useMemo(
    () => ranking.find((u) => u.id === user?.id),
    [ranking, user],
  )
  const lider = ranking[0]
  const totalJugadores = ranking.length

  const prediccionesList = useMemo(
    () => Object.values(predicciones),
    [predicciones],
  )
  const stats = useMemo(
    () => userScoringStats(prediccionesList, partidos),
    [prediccionesList, partidos],
  )
  const racha = useMemo(
    () => userStreak(prediccionesList, partidos),
    [prediccionesList, partidos],
  )

  // Reloj que avanza cada minuto para reevaluar el partido destacado sin
  // recargar: así "Finalizado" cede el lugar apenas comienza el siguiente.
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 60 * 1000)
    return () => clearInterval(t)
  }, [])

  // Rondas eliminatorias para la tarjeta del campeón (se autooculta hasta que
  // exista el partido final).
  const rounds = useKnockoutRounds(fases, partidos)

  const liveMatches = useMemo(
    () => partidosEnVivo(partidos, ahora),
    [partidos, ahora],
  )
  const next = useMemo(
    () => proximoPartido(partidos, predicciones, ahora),
    [partidos, predicciones, ahora],
  )

  // El onboarding solo cubre la fase de grupos: el progreso se mide sobre los
  // partidos reales de esa fase, no contra un total fijo ni mezclando los
  // pronósticos de eliminatorias. Así el banner y el asistente coinciden.
  const partidosGrupos = useMemo(
    () => partidos.filter((p) => p.fase_id === 'grupos'),
    [partidos],
  )
  const gruposTotal = partidosGrupos.length
  const picksGrupos = useMemo(
    () => countPrediccionesDe(partidosGrupos, predicciones),
    [partidosGrupos, predicciones],
  )
  // El admin no juega ni pronostica: no se le muestran los avisos que
  // invitan a completar predicciones o apuestas especiales.
  const esAdmin = !!user?.es_admin
  // Mientras las predicciones o los partidos siguen cargando no se sabe cuántos
  // hay; el guard evita que el banner aparezca un instante aunque ya estén
  // completas.
  const onboardingPendiente =
    !esAdmin &&
    !prediccionesLoading &&
    gruposTotal > 0 &&
    picksGrupos < gruposTotal
  const pendientes = partidos.filter((p) => !p.resultado_ingresado).length

  // Pronósticos que faltan de partidos aún abiertos (cualquier fase). Es lo que
  // alimenta el asistente para completarlos de corrido. No se muestra junto al
  // banner del onboarding de grupos para no duplicar avisos.
  const pronosticosPendientes = useMemo(() => {
    if (esAdmin || prediccionesLoading) return 0
    return partidos.filter((p) => faltaPronostico(p, predicciones[p.id], ahora))
      .length
  }, [esAdmin, prediccionesLoading, partidos, predicciones, ahora])

  const apuestasAbiertas = !apuestasEspecialesCerradas(apuestasCfg)
  const apuestasCompletadas = Boolean(
    apuestaUsuario?.campeon &&
    apuestaUsuario?.subcampeon &&
    apuestaUsuario?.goleador &&
    apuestaUsuario?.sorpresa,
  )
  // Igual que con el onboarding: esperar a que carguen la config y la apuesta
  // del usuario evita que el banner parpadee cuando ya está todo completado.
  const mostrarBannerApuestas =
    !esAdmin &&
    !apuestasCfgLoading &&
    !apuestaLoading &&
    apuestasAbiertas &&
    !apuestasCompletadas
  // Enlace permanente a las apuestas especiales: cuando el banner de invitación
  // no aplica (admin, apuestas cerradas o ya completadas) el home igual debe
  // tener una entrada directa a la sección, porque la barra inferior no la lista.
  const apuestasLinkSubtitle = apuestasCompletadas
    ? 'Revisa o edita tus pronósticos'
    : apuestasAbiertas
      ? 'Pronostica Campeón, Goleador y más'
      : 'Mira las apuestas de todo el grupo'

  const myPts = me?.puntos || 0
  const liderPts = lider?.puntos || 0
  const ratio =
    liderPts > 0 ? Math.min(100, Math.round((myPts / liderPts) * 100)) : 0
  const diff = (lider?.puntos || 0) - myPts
  // Cuando el usuario es el líder, la ventaja sobre el 2° es el dato útil:
  // sustituye al "100%" decorativo de la barra y da contexto de qué tan
  // cómodo es el liderato.
  const segundo = me && lider && me.id === lider.id ? ranking[1] : null
  const ventaja = segundo ? (lider?.puntos || 0) - (segundo?.puntos || 0) : null

  const myPtsDisplay = useCountUp(myPts, { duration: 800 })
  const myRankDisplay = useCountUp(me?.rank || 0, { duration: 600 })

  // Cada tarjeta en vivo (puede haber varias) consulta su propio marcador a
  // ESPN y, al pitazo final, dispara la sincronización del resultado. Aquí solo
  // se escucha el anuncio global para refrescar partidos y puntajes en pantalla.
  const onResultadoSincronizado = useCallback(() => {
    refreshPartidos().catch(() => {})
    refreshPuntajes().catch(() => {})
  }, [refreshPartidos, refreshPuntajes])
  useOnResultadosSincronizados(onResultadoSincronizado)

  return (
    <MobileShell
      activeTab="inicio"
      header={
        <MobileHeader
          title={`Hola, ${(user?.nombre || '').split(' ')[0] || 'jugador'}`}
          subtitle={`${GROUP_NAME} · ${GROUP_MOTTO}`}
          leading={
            <Avatar
              name={user?.nombre}
              size={36}
              ring={ringFor({ rank: me?.rank, streak: racha })}
            />
          }
          onLeadingClick={() => navigate('/app/perfil')}
          trailing={
            <HeaderIconButton
              label="Abrir chat"
              onClick={() => navigate('/app/chat')}
            >
              <Icon.Chat />
            </HeaderIconButton>
          }
        />
      }
    >
      <div
        style={{
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {onboardingPendiente && (
          <BannerPredicciones picks={picksGrupos} total={gruposTotal} />
        )}

        {!onboardingPendiente && pronosticosPendientes > 0 && (
          <BannerPrediccionesPendientes pendientes={pronosticosPendientes} />
        )}

        {mostrarBannerApuestas && (
          <Card
            pad={16}
            onClick={() => navigate('/app/apuestas')}
            style={{
              background: 'var(--gradient-trofeo)',
              borderColor: 'transparent',
              cursor: 'pointer',
              color: '#1A1300',
              boxShadow: 'var(--shadow-gold)',
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
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#1A1300',
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: 0.85,
                  }}
                >
                  <Icon.Crown /> Apuestas especiales
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1A1300',
                  }}
                >
                  {apuestaUsuario
                    ? 'Completa tus pronósticos premundiales'
                    : 'Pronostica Campeón, Goleador y más'}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 12,
                    color: 'rgba(26,19,0,0.72)',
                    fontWeight: 600,
                  }}
                >
                  Hasta{' '}
                  <span
                    className="font-score"
                    style={{ fontSize: 14, letterSpacing: 0.6 }}
                  >
                    {(apuestasCfg?.pts_campeon ?? 0) +
                      (apuestasCfg?.pts_subcampeon ?? 0) +
                      (apuestasCfg?.pts_goleador ?? 0) +
                      (apuestasCfg?.pts_sorpresa ?? 0)}
                  </span>{' '}
                  pts en juego
                </div>
              </div>
              <Icon.Chevron />
            </div>
          </Card>
        )}

        {/* Enlace directo permanente a apuestas especiales. Se muestra cuando el
            banner dorado de invitación no aplica, para que siempre haya una
            forma de llegar a la sección desde el inicio. */}
        {!mostrarBannerApuestas && (
          <Card
            pad={14}
            onClick={() => navigate('/app/apuestas')}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--gold-soft)',
                    color: 'var(--gold-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon.Crown />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      letterSpacing: -0.2,
                    }}
                  >
                    Apuestas especiales
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 12,
                      color: 'var(--ink-3)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {apuestasLinkSubtitle}
                  </div>
                </div>
              </div>
              <Icon.Chevron />
            </div>
          </Card>
        )}

        {/* Puntaje + posición */}
        <Card
          pad={0}
          elevated
          onClick={() => navigate('/app/tabla')}
          style={{
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            boxShadow:
              me?.id === lider?.id
                ? 'var(--shadow-gold)'
                : 'var(--shadow-accent)',
          }}
        >
          <div
            className="mundial-bar"
            style={{ borderRadius: 0, height: 4 }}
          />
          <div
            className="field-lines"
            style={{
              padding: '22px 20px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              color: 'var(--ink)',
            }}
          >
            <div>
              <div style={kicker}>Tus puntos</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <span style={me?.id === lider?.id ? bigNumGold : bigNum}>
                  {myPtsDisplay}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-3)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  pts
                </span>
              </div>
              {stats.jugados > 0 && (
                <div style={{ marginTop: 10 }}>
                  <Pill tone="accent">
                    {stats.ganador} {stats.ganador === 1 ? 'resultado' : 'resultados'} ·{' '}
                    {stats.exactos} {stats.exactos === 1 ? 'exacto' : 'exactos'}
                  </Pill>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={kicker}>Posición</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'flex-end',
                  gap: 4,
                  marginTop: 8,
                }}
              >
                <span style={me?.id === lider?.id ? bigNumGold : bigNum}>
                  {me?.rank ? myRankDisplay : '—'}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-3)',
                    fontWeight: 600,
                    letterSpacing: 0.4,
                  }}
                >
                  / {totalJugadores || 0}
                </span>
              </div>
              {lider && me && me.id !== lider.id && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: 'var(--coral-ink)',
                    fontWeight: 600,
                  }}
                >
                  {/* Con el ranking de posición compartida un empate en
                      puntos deja rank 1 a ambos: "−0 pts" confundiría. */}
                  {diff > 0 ? `−${diff} pts del 1°` : 'Empatado con el 1°'}
                </div>
              )}
              {lider && me?.id === lider.id && (
                <div
                  style={{
                    marginTop: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: 'var(--gold-soft)',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold-ink)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                  }}
                >
                  <Icon.Crown /> Vas primero
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '0 16px 12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              <span
                className="mono"
                style={{
                  color:
                    me?.id === lider?.id
                      ? 'var(--gold-ink)'
                      : 'var(--accent-ink)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: -0.2,
                }}
              >
                {me?.id === lider?.id
                  ? ventaja != null && ventaja > 0
                    ? `+${ventaja} pts`
                    : '100%'
                  : `${ratio}%`}
              </span>
              <span
                style={{
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {me?.id === lider?.id
                  ? ventaja != null && ventaja > 0
                    ? 'sobre el 2°'
                    : 'Eres el líder'
                  : 'del líder'}
              </span>
            </div>
            <div
              style={{
                height: 10,
                background: 'var(--line-2)',
                borderRadius: 999,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(20,17,13,0.06)',
              }}
            >
              <div
                className="progress-bar-fill shine"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${ratio}%`,
                  background:
                    me?.id === lider?.id
                      ? 'linear-gradient(90deg, var(--gold) 0%, var(--gold-ink) 100%)'
                      : 'linear-gradient(90deg, var(--accent) 0%, var(--gold) 130%)',
                  borderRadius: 999,
                  transition: 'width 520ms cubic-bezier(.2,.7,.2,1)',
                  boxShadow:
                    me?.id === lider?.id
                      ? '0 1px 4px color-mix(in oklab, var(--gold) 35%, transparent)'
                      : '0 1px 4px color-mix(in oklab, var(--accent) 30%, transparent)',
                }}
              />
            </div>
          </div>
          <div
            style={{
              padding: '0 16px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--ink-3)',
              }}
            >
              {/* Si eres el líder no tiene sentido mostrar tu propio nombre
                  con "lidera": mostramos a quien te persigue (el 2°). Si no
                  hay 2°, un texto simple. Para el resto, el líder. */}
              {me?.id === lider?.id ? (
                segundo ? (
                  <>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px 2px 2px',
                        borderRadius: 999,
                        background: 'var(--line-2)',
                        border: '1px solid var(--line)',
                        color: 'var(--ink-2)',
                        fontWeight: 700,
                      }}
                    >
                      <Avatar name={segundo.nombre} size={18} />
                      {(segundo.nombre || '').split(' ')[0]}
                    </span>
                    <span>te persigue</span>
                  </>
                ) : (
                  <span>Lideras la quiniela</span>
                )
              ) : (
                lider && (
                  <>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px 2px 2px',
                        borderRadius: 999,
                        background: 'var(--gold-soft)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold-ink)',
                        fontWeight: 700,
                      }}
                    >
                      <Avatar name={lider.nombre} size={18} ring="gold" />
                      {(lider.nombre || '').split(' ')[0]}
                    </span>
                    <span>lidera</span>
                  </>
                )
              )}
            </span>
            <span
              style={{
                // El coral de urgencia se reserva para la recta final
                // (3 partidos o menos); con más, un tono neutro.
                color: pendientes > 0 && pendientes <= 3
                  ? 'var(--coral-ink)'
                  : 'var(--ink-3)',
                fontWeight: pendientes > 0 && pendientes <= 3 ? 600 : 400,
              }}
            >
              {pendientes === 0
                ? 'Torneo cerrado'
                : pendientes === 1
                  ? 'Queda 1 partido'
                  : `Quedan ${pendientes} partidos`}
            </span>
          </div>
        </Card>

        {/* Reglamento oficial: siempre a mano desde el inicio, para que las
            reglas y sus casos estén claros antes de cualquier reclamo. */}
        <Card
          pad={14}
          onClick={() => navigate('/app/reglamento')}
          style={{ cursor: 'pointer' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--azure-soft)',
                  color: 'var(--azure-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon.Book />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    letterSpacing: -0.2,
                  }}
                >
                  Reglamento oficial
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 12,
                    color: 'var(--ink-3)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Puntos, cierres, desempates y casos especiales
                </div>
              </div>
            </div>
            <Icon.Chevron />
          </div>
        </Card>

        {/* Partidos en vivo (puede haber varios a la vez) */}
        {liveMatches.map((m) => (
          <LiveMatchCard
            key={m.id}
            match={m}
            pred={predicciones[m.id]}
            rightLabel={
              m.grupo ? `Grupo ${m.grupo}` : faseLabel(fases, m.fase_id)
            }
            fase={fases.find((f) => f.id === m.fase_id)}
            ahora={ahora}
            onClick={() => navigate(`/app/partido/${m.id}`)}
          />
        ))}

        {/* Próximo pronóstico */}
        {next && (
          <>
            <SectionTitle
              action={
                <span
                  onClick={() => navigate('/app/partidos')}
                  style={{ cursor: 'pointer' }}
                >
                  Ver todos →
                </span>
              }
            >
              Tu próximo pronóstico
            </SectionTitle>
            <Card
              onClick={() => navigate(`/app/partido/${next.id}`)}
              className="field-lines-light"
              style={{
                background: 'var(--gradient-nocturno)',
                borderColor: 'transparent',
                color: '#fff',
                boxShadow: 'var(--shadow-azure)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 9px',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 999,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {next.grupo
                    ? `Grupo ${next.grupo}`
                    : faseLabel(fases, next.fase_id)}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.7)',
                    letterSpacing: 0.3,
                  }}
                >
                  {formatearFechaHora(next.fecha)}
                </span>
              </div>
              <div
                style={{
                  marginBottom: 12,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}
                >
                  Empieza en
                </span>
                <span style={{ color: '#fff' }}>
                  <Countdown targetIso={next.fecha} />
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: 12,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <Flag
                    code={code(next.equipo_local)}
                    w={56}
                    h={40}
                    rounded={7}
                  />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#fff',
                      letterSpacing: -0.2,
                    }}
                  >
                    {next.equipo_local}
                  </div>
                </div>
                <div
                  className="font-score"
                  style={{
                    fontSize: 18,
                    color: '#fff',
                    letterSpacing: 2,
                    fontWeight: 400,
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  VS
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 10,
                  }}
                >
                  <Flag
                    code={code(next.equipo_visitante)}
                    w={56}
                    h={40}
                    rounded={7}
                  />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#fff',
                      letterSpacing: -0.2,
                    }}
                  >
                    {next.equipo_visitante}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.75)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontWeight: 600,
                  }}
                >
                  Tu pronóstico
                </span>
                <span
                  className="font-score"
                  style={{
                    fontSize: 22,
                    fontWeight: 400,
                    color: '#fff',
                    letterSpacing: 1,
                  }}
                >
                  — · —
                </span>
              </div>
              <Button
                block
                size="lg"
                className="pulse-mundial"
                style={{
                  marginTop: 14,
                  background: 'var(--gradient-mundial)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                Hacer mi pronóstico <Icon.Chevron />
              </Button>
            </Card>
          </>
        )}

        {/* Camino al campeón */}
        <ChampionCard rounds={rounds} predicciones={predicciones} />

        {/* Stats row */}
        {stats.jugados > 0 && (
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
          >
            <StreakCard streak={racha} />
            <div
              style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10 }}
            >
              <StatTile
                label="Aciertos"
                value={String(stats.ganador)}
                unit={`/ ${stats.jugados}`}
              />
              <StatTile
                label="Exactos"
                value={String(stats.exactos)}
                unit={`/ ${stats.jugados}`}
              />
            </div>
          </div>
        )}

        {/* Picadas preview (chat global en tiempo real) */}
        <SectionTitle
          action={
            <Link
              to="/app/chat"
              style={{ color: 'var(--accent-ink)', textDecoration: 'none' }}
            >
              Ver todo →
            </Link>
          }
        >
          El Chalequeo
        </SectionTitle>
        <ChatPreview limit={3} />
      </div>
    </MobileShell>
  )
}

const kicker = {
  fontSize: 11,
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  fontWeight: 600,
}

const bigNum = {
  fontFamily: 'var(--font-score)',
  fontSize: 72,
  fontWeight: 400,
  color: 'var(--ink)',
  letterSpacing: 0,
  lineHeight: 0.9,
  fontVariantNumeric: 'tabular-nums',
}

const bigNumGold = {
  fontFamily: 'var(--font-score)',
  fontSize: 72,
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 0.9,
  fontVariantNumeric: 'tabular-nums',
  background:
    'linear-gradient(135deg, var(--gold) 0%, var(--coral) 60%, var(--magenta) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

function StreakCard({ streak }) {
  const isCold = streak <= 0
  const isHot = streak >= 3
  const isBlaze = streak >= 6
  const label = isCold
    ? 'Sin racha'
    : isBlaze
      ? '¡En llamas!'
      : isHot
        ? 'Racha caliente'
        : 'Racha'
  const subtitle = isCold
    ? 'Acierta el próximo'
    : `${streak} acierto${streak === 1 ? '' : 's'} seguido${streak === 1 ? '' : 's'}`
  const borderColor = isBlaze
    ? 'color-mix(in oklab, var(--danger) 35%, transparent)'
    : isHot
      ? 'color-mix(in oklab, var(--coral) 30%, transparent)'
      : 'var(--line)'
  return (
    <div
      style={{
        background: isHot ? 'var(--coral-soft)' : 'var(--surface)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--r-lg)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: isBlaze ? 'var(--shadow-coral)' : 'var(--shadow-1)',
        overflow: 'hidden',
      }}
    >
      <StreakFlame streak={streak} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            color: isHot ? 'var(--coral-ink)' : 'var(--ink-3)',
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 4,
            marginTop: 4,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: isHot ? 'var(--coral-ink)' : 'var(--ink)',
              letterSpacing: -1.5,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {streak}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: 'var(--ink-3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  )
}

function faseLabel(fases, faseId) {
  const f = fases.find((x) => x.id === faseId)
  return f ? f.nombre : 'Partido'
}

