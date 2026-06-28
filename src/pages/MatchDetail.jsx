import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useFases } from '@/hooks/useFases'
import { usePrediccionesUsuario } from '@/hooks/usePredicciones'
import { useUsuariosPublic } from '@/hooks/useUsuarios'
import { useAsync } from '@/hooks/useAsync'
import { listPartidosByFase } from '@/api/partidos'
import { listPrediccionesByUsuario } from '@/api/predicciones'
import { supabase } from '@/lib/supabase'
import {
  Avatar,
  Card,
  EmptyState,
  Flag,
  Goleadores,
  Icon,
  LiveBadge,
  Pill,
  ScoreStepper,
  SkeletonMatchHeader,
  SkeletonText,
} from '@/components/ui'
import { useMarcadorEnVivo } from '@/hooks/useMarcadorEnVivo'
import {
  useAutoSyncFinalEnVivo,
  useOnResultadosSincronizados,
} from '@/hooks/useAutoSyncResultado'
import { code } from '@/lib/constants'
import { formatearFechaHora } from '@/lib/fechas'
import {
  pronosticoCerrado,
  ladoGanador,
  definidoPorPenales,
} from '@/lib/pronosticos'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { ShareableMatchCard } from '@/components/ShareableMatchCard'
import { nodeToPngBlob, shareOrDownloadImage } from '@/lib/shareImage'
import { celebrateExact, celebrateWin, celebrateOnce } from '@/lib/celebrate'

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fases } = useFases()
  const { usuarios } = useUsuariosPublic()
  const { predicciones, setMarcador } = usePrediccionesUsuario(user?.id)

  // Cargar el partido específico
  const {
    data: partido,
    loading: loadingPartido,
    refresh: refreshPartido,
  } = useAsync(async () => {
    const { data, error } = await supabase
      .from('partidos')
      .select(
        'id, fase_id, grupo, equipo_local, equipo_visitante, fecha, goles_local, goles_visitante, resultado_ingresado, ganador',
      )
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
  }, [id])

  const fase = useMemo(
    () => fases.find((f) => f.id === partido?.fase_id),
    [fases, partido],
  )

  // Marcador en tiempo real (ESPN) mientras el partido está en juego, con sus
  // goleadores. Al pitazo final dispara la sincronización del resultado, igual
  // que la tarjeta del Inicio.
  const { marcador } = useMarcadorEnVivo(partido)
  useAutoSyncFinalEnVivo(partido, marcador)
  // Al sincronizarse el resultado oficial, recarga el partido para mostrar el
  // marcador final y los puntos obtenidos sin necesidad de recargar la página.
  useOnResultadosSincronizados(refreshPartido)

  // Reloj que avanza cada minuto para que el cierre del pronóstico se refleje
  // en vivo si la pantalla queda abierta justo cuando cruza la hora límite.
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 60 * 1000)
    return () => clearInterval(t)
  }, [])

  // El pronóstico de un partido se cierra una hora antes del saque. En ese
  // mismo instante deja de poder editarse y los pronósticos de la familia se
  // hacen visibles para todos. Antes de eso cada quien ve solo el suyo, para
  // que nadie copie marcadores.
  const cerrado = pronosticoCerrado(partido, ahora)
  const locked = cerrado
  const revealOthers = cerrado

  // Predicciones de TODA la familia para este partido. Solo se piden al
  // servidor cuando el partido ya cerró; antes el cliente ni siquiera descarga
  // los marcadores ajenos.
  const { data: picksFamilia } = useAsync(async () => {
    if (!revealOthers) return []
    const { data, error } = await supabase
      .from('predicciones')
      .select('usuario_id, goles_local, goles_visitante, puntos_obtenidos')
      .eq('partido_id', id)
    if (error) throw error
    return data || []
  }, [id, revealOthers])

  const myPred = predicciones[id]
  const [draft, setDraft] = useState({ local: null, visitante: null })
  useEffect(() => {
    setDraft({
      local: myPred?.goles_local ?? null,
      visitante: myPred?.goles_visitante ?? null,
    })
  }, [myPred?.goles_local, myPred?.goles_visitante])

  const [saving, setSaving] = useState(false)
  const [savedTick, setSavedTick] = useState(0)
  const [saveError, setSaveError] = useState('')
  // El marcador arranca en 0–0, que ya es un pronóstico válido. El lado que no
  // toques cuenta como 0, así que siempre puedes guardar tu pronóstico, incluso
  // un 0–0.
  const guardar = async () => {
    setSaving(true)
    setSaveError('')
    try {
      // Una sola escritura atómica del marcador completo.
      await setMarcador(id, draft.local ?? 0, draft.visitante ?? 0)
      setSavedTick((k) => k + 1)
    } catch (e) {
      const msg = String(e?.message || e)
      if (msg.includes('PRONOSTICO_CERRADO') || msg.includes('PARTIDO_INICIADO')) {
        setSaveError('El pronóstico ya cerró: se bloquea una hora antes del partido.')
      } else if (msg.includes('PARTIDO_CERRADO')) {
        setSaveError('El partido ya tiene resultado: no se puede editar.')
      } else {
        setSaveError('No se pudo guardar. Intenta de nuevo.')
      }
      await refreshPartido()
    } finally {
      setSaving(false)
    }
  }

  // Confetti automático cuando se entra a un partido finalizado y el usuario acertó.
  useEffect(() => {
    if (!partido || !partido.resultado_ingresado || !myPred) return
    if (myPred.goles_local == null || myPred.goles_visitante == null) return
    const exact =
      Number(myPred.goles_local) === Number(partido.goles_local) &&
      Number(myPred.goles_visitante) === Number(partido.goles_visitante)
    const won = (myPred.puntos_obtenidos || 0) > 0
    if (exact) {
      celebrateOnce(`exact-${id}`, () => {
        setTimeout(celebrateExact, 280)
      })
    } else if (won) {
      celebrateOnce(`win-${id}`, () => {
        setTimeout(celebrateWin, 280)
      })
    }
  }, [partido, myPred, id])

  const [tab, setTab] = useState('familia')

  // Captura para compartir en redes sociales.
  const shareRef = useRef(null)
  const [sharing, setSharing] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  if (loadingPartido) {
    return (
      <div
        style={{
          padding: '16px 16px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <SkeletonMatchHeader />
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--line)',
            padding: 16,
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <SkeletonText lines={4} lastWidth="40%" />
        </div>
      </div>
    )
  }
  if (!partido) {
    return (
      <Centered>
        <EmptyState
          illustration="ball"
          title="Partido no encontrado"
          description="Puede que el partido haya sido removido o que la URL esté mal."
          cta={{
            label: 'Volver a partidos',
            onClick: () => navigate('/app/partidos'),
          }}
        />
      </Centered>
    )
  }

  const isFinal = partido.resultado_ingresado
  // Marcador en vivo de ESPN, mientras la BD aún no tiene el resultado oficial.
  // Cubre el caso en que ESPN ya dio el partido por terminado pero todavía no se
  // sincronizó: se muestra como "Finalizado" con el marcador en tiempo real.
  const enVivo =
    !isFinal && marcador && marcador.golesLocal != null ? marcador : null
  const picksByUser = new Map(
    (picksFamilia || []).map((p) => [p.usuario_id, p]),
  )

  // Datos planos para la tarjeta compartible: cada participante con su marcador.
  const sharePlayers = (usuarios || [])
    .filter((u) => !u.es_admin)
    .map((u) => {
      const pick = picksByUser.get(u.id)
      return {
        nombre: u.nombre,
        isMe: u.id === user?.id,
        goles_local: pick?.goles_local ?? null,
        goles_visitante: pick?.goles_visitante ?? null,
        puntos_obtenidos: pick?.puntos_obtenidos ?? null,
      }
    })

  const compartir = async () => {
    if (sharing) return
    setSharing(true)
    setShareMsg('')
    try {
      const blob = await nodeToPngBlob(shareRef.current, {
        scale: 2.5,
        background: '#0f0d0a',
      })
      const slug = `${partido.equipo_local}-${partido.equipo_visitante}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const resultado = await shareOrDownloadImage(blob, {
        fileName: `copa-familiar-${slug}.png`,
        title: 'La Copa Familiar',
        text: `${partido.equipo_local} vs ${partido.equipo_visitante} — pronósticos de la familia`,
      })
      if (resultado === 'downloaded') setShareMsg('Imagen descargada')
    } catch (e) {
      if (e?.name !== 'AbortError') {
        setShareMsg('No se pudo generar la imagen. Intenta de nuevo.')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        paddingBottom: locked ? 60 : 140,
      }}
    >
      {/* Header oscuro */}
      <div
        style={{
          background: 'var(--header-bg)',
          color: 'var(--header-ink)',
          paddingTop: 24,
          paddingBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px 14px',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            style={{
              width: 36,
              height: 36,
              background: 'transparent',
              border: 'none',
              color: 'var(--header-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.ChevronL />
          </button>
          <span style={{ fontSize: 13, color: 'oklch(0.75 0.02 60)' }}>
            {fase?.nombre || 'Partido'}
            {partido.grupo ? ` · Grupo ${partido.grupo}` : ''}
          </span>
          <div style={{ width: 36 }} />
        </div>

        {(() => {
          const porPenales = definidoPorPenales(partido)
          // Un empate solo se muestra como tal si no se resolvió por penales.
          const isDraw =
            isFinal &&
            partido.goles_local === partido.goles_visitante &&
            !porPenales
          const winnerSide = ladoGanador(partido)
          const HeaderTeam = ({ team, side }) => {
            const isWinner = winnerSide === side
            const isLoser = winnerSide && !isWinner
            return (
              <div
                style={{
                  textAlign: 'center',
                  opacity: isLoser ? 0.55 : 1,
                  transition: 'opacity 320ms ease',
                }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Flag code={code(team)} w={56} h={40} rounded={6} />
                  {isWinner && (
                    <span
                      className="win-mark"
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--header-bg)',
                      }}
                    >
                      <Icon.Check style={{ width: 11, height: 11 }} />
                    </span>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontWeight: isWinner ? 700 : 600,
                    fontSize: 15,
                    letterSpacing: -0.1,
                  }}
                >
                  {team}
                </div>
              </div>
            )
          }
          return (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
              }}
            >
              <HeaderTeam team={partido.equipo_local} side="local" />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isFinal ? (
                  <>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: isDraw
                          ? 'var(--gold)'
                          : 'rgba(255,255,255,0.1)',
                        color: isDraw ? 'var(--header-bg)' : 'var(--header-ink)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isDraw ? 'Empate' : 'Finalizado'}
                    </div>
                    <span
                      className="mono score-reveal"
                      style={{
                        fontSize: 44,
                        fontWeight: 700,
                        letterSpacing: -2,
                        color: 'var(--header-ink)',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          opacity: winnerSide === 'visitante' ? 0.55 : 1,
                        }}
                      >
                        {partido.goles_local}
                      </span>
                      <span style={{ opacity: 0.45 }}>–</span>
                      <span
                        style={{ opacity: winnerSide === 'local' ? 0.55 : 1 }}
                      >
                        {partido.goles_visitante}
                      </span>
                    </span>
                    {porPenales && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'oklch(0.75 0.02 60)',
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          fontWeight: 600,
                        }}
                      >
                        {partido.ganador} avanzó por penales
                      </div>
                    )}
                  </>
                ) : enVivo ? (
                  <>
                    {enVivo.finalizado ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.1)',
                          color: 'var(--header-ink)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.4,
                          textTransform: 'uppercase',
                        }}
                      >
                        Finalizado
                      </div>
                    ) : (
                      <LiveBadge
                        variant="solid"
                        label={enVivo.medioTiempo ? 'Medio tiempo' : 'En vivo'}
                        minute={enVivo.medioTiempo ? null : enVivo.minuto}
                      />
                    )}
                    <span
                      className="mono"
                      style={{
                        fontSize: 44,
                        fontWeight: 700,
                        letterSpacing: -2,
                        color: 'var(--header-ink)',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: 6,
                      }}
                    >
                      <span>{enVivo.golesLocal}</span>
                      <span style={{ opacity: 0.45 }}>–</span>
                      <span>{enVivo.golesVisitante}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'oklch(0.75 0.02 60)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        fontWeight: 600,
                      }}
                    >
                      vs
                    </div>
                    <span
                      className="mono"
                      style={{ fontSize: 18, color: 'oklch(0.75 0.02 60)' }}
                    >
                      {formatearFechaHora(partido.fecha)}
                    </span>
                  </>
                )}
              </div>

              <HeaderTeam team={partido.equipo_visitante} side="visitante" />
            </div>
          )
        })()}

        {enVivo?.goleadores && (
          <div style={{ padding: '0 24px' }}>
            <Goleadores
              local={enVivo.goleadores.local}
              visitante={enVivo.goleadores.visitante}
              muted="oklch(0.78 0.02 60)"
            />
          </div>
        )}
      </div>

      {/* Mi pronóstico / Editor */}
      <div style={{ padding: '14px 20px 0' }}>
        <Card pad={14}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}
            >
              Tu pronóstico {locked ? '(bloqueado)' : ''}
            </div>
            {locked ? (
              <Pill tone="default" size="sm">
                <Icon.Lock /> {isFinal ? 'Finalizado' : 'Bloqueado'}
              </Pill>
            ) : (
              <Pill tone="accent" size="sm">
                Editable
              </Pill>
            )}
          </div>

          {locked ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
              }}
            >
              <span
                style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}
              >
                {myPred?.goles_local != null
                  ? `${myPred.goles_local} – ${myPred.goles_visitante}`
                  : 'Sin pronóstico'}
              </span>
              {isFinal && myPred?.puntos_obtenidos != null && (
                <span
                  style={{
                    fontSize: 12,
                    color:
                      myPred.puntos_obtenidos > 0
                        ? 'var(--accent-ink)'
                        : 'var(--ink-3)',
                    fontWeight: 600,
                  }}
                >
                  {myPred.puntos_obtenidos > 0
                    ? `+${myPred.puntos_obtenidos} pts`
                    : '0 pts'}
                </span>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <ScoreStepper
                  label={partido.equipo_local}
                  value={draft.local}
                  onChange={(v) => setDraft((d) => ({ ...d, local: v }))}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--ink-3)',
                  }}
                >
                  –
                </span>
                <ScoreStepper
                  label={partido.equipo_visitante}
                  value={draft.visitante}
                  onChange={(v) => setDraft((d) => ({ ...d, visitante: v }))}
                />
              </div>
              <button
                onClick={guardar}
                disabled={saving}
                className="btn-interactive"
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '12px 16px',
                  background:
                    savedTick > 0 ? 'var(--accent-ink)' : 'var(--ink)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 'var(--r-md)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-1)',
                }}
              >
                {saving ? (
                  <>
                    <Spinner /> Guardando…
                  </>
                ) : savedTick > 0 ? (
                  <>
                    <span
                      key={savedTick}
                      className="save-check"
                      style={{ display: 'inline-flex' }}
                    >
                      <Icon.Check style={{ width: 14, height: 14 }} />
                    </span>
                    Pronóstico guardado
                  </>
                ) : (
                  <>Guardar pronóstico</>
                )}
              </button>
              {saveError && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: 'var(--danger)',
                    fontWeight: 600,
                  }}
                >
                  {saveError}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ padding: '18px 20px 0' }}>
        <div
          style={{
            display: 'flex',
            gap: 18,
            borderBottom: '1px solid var(--line)',
          }}
        >
          {[
            ['familia', 'Pronósticos familia'],
            ['picadas', 'Chalequeo'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={tab === k ? 'tabline' : ''}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 0',
                color: tab === k ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: tab === k ? 600 : 500,
                fontSize: 14,
                letterSpacing: -0.1,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px 24px' }}>
        {tab === 'familia' ? (
          <>
            <FamilyPicks
              usuarios={usuarios}
              picksByUser={picksByUser}
              mePartial={user?.id}
              reveal={revealOthers}
            />
            {revealOthers && (
              <div style={{ marginTop: 14 }}>
                <button
                  onClick={compartir}
                  disabled={sharing}
                  className="btn-interactive"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-md)',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: sharing ? 'wait' : 'pointer',
                    opacity: sharing ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: 'var(--shadow-1)',
                  }}
                >
                  {sharing ? (
                    <>
                      <Spinner /> Generando imagen…
                    </>
                  ) : (
                    <>
                      <Icon.Share /> Compartir pronósticos
                    </>
                  )}
                </button>
                {shareMsg && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: 'var(--ink-3)',
                      textAlign: 'center',
                    }}
                  >
                    {shareMsg}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <ChatPanel key={id} partidoId={id} altura="60dvh" />
        )}
      </div>

      {/* Tarjeta oculta que se rasteriza al compartir. Se mantiene fuera de
          pantalla (sin display:none, para conservar dimensiones medibles). */}
      {revealOthers && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: 0,
            left: -100000,
            pointerEvents: 'none',
            opacity: 0,
            zIndex: -1,
          }}
        >
          <div ref={shareRef}>
            <ShareableMatchCard
              faseNombre={fase?.nombre}
              grupo={partido.grupo}
              equipoLocal={partido.equipo_local}
              equipoVisitante={partido.equipo_visitante}
              codeLocal={code(partido.equipo_local)}
              codeVisitante={code(partido.equipo_visitante)}
              isFinal={isFinal}
              golesLocal={partido.goles_local}
              golesVisitante={partido.goles_visitante}
              fechaTexto={formatearFechaHora(partido.fecha)}
              players={sharePlayers}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function FamilyPicks({ usuarios, picksByUser, mePartial, reveal }) {
  const players = (usuarios || []).filter((u) => !u.es_admin)
  if (players.length === 0) {
    return (
      <p style={{ color: 'var(--ink-3)', textAlign: 'center' }}>
        Sin participantes.
      </p>
    )
  }
  // Hasta una hora antes del partido, los pronósticos ajenos permanecen ocultos.
  if (!reveal) {
    return (
      <Card pad={20}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-3)',
            }}
          >
            <Icon.Lock />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
            Pronósticos ocultos
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 260 }}>
            Los pronósticos de la familia se revelan una hora antes del
            partido. Por ahora solo puedes ver el tuyo.
          </div>
        </div>
      </Card>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{ fontSize: 12, color: 'var(--ink-3)', padding: '0 4px 4px' }}
      >
        {picksByUser.size} de {players.length} pronosticaron
      </div>
      {players.map((p) => {
        const pick = picksByUser.get(p.id)
        const isMe = p.id === mePartial
        return (
          <Card
            key={p.id}
            pad={12}
            style={{
              background: isMe ? 'var(--accent-soft)' : 'var(--surface)',
              borderColor: isMe ? 'transparent' : 'var(--line)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={p.nombre} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink)',
                    }}
                  >
                    {p.nombre}
                  </span>
                  {isMe && (
                    <Pill tone="accent" size="sm">
                      Tú
                    </Pill>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {pick?.goles_local != null ? (
                  <>
                    <span
                      className="mono"
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: 'var(--ink)',
                        letterSpacing: -0.5,
                      }}
                    >
                      {pick.goles_local} – {pick.goles_visitante}
                    </span>
                    {pick.puntos_obtenidos != null &&
                      pick.puntos_obtenidos > 0 && (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--accent-ink)',
                            fontWeight: 600,
                          }}
                        >
                          +{pick.puntos_obtenidos} pts
                        </div>
                      )}
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                    Sin pick
                  </span>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      style={{ display: 'inline-block' }}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeOpacity="0.25"
        fill="none"
      />
      <path
        d="M7 1.5 a 5.5 5.5 0 0 1 5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 7 7"
          to="360 7 7"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}

function Centered({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      {children}
    </div>
  )
}

