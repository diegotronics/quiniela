import { useEffect, useState } from 'react'
import { MatchCard } from '@/components/ui'
import { usePrevious } from '@/hooks/useCountUp'
import { useMarcadorEnVivo } from '@/hooks/useMarcadorEnVivo'
import { useAutoSyncFinalEnVivo } from '@/hooks/useAutoSyncResultado'
import { partidoTerminado } from '@/lib/stats'

/**
 * Tarjeta de un partido en vivo, autocontenida: consulta su propio marcador en
 * tiempo real a ESPN, detecta los cambios de gol para animar el marcador y, al
 * pitazo final, dispara la sincronización del resultado. Al ser un componente
 * por partido, la sección puede mostrar varias tarjetas en vivo a la vez sin
 * romper las reglas de los hooks.
 */
export function LiveMatchCard({ match, pred, rightLabel, ahora, onClick }) {
  const { marcador } = useMarcadorEnVivo(match)
  // Con datos de ESPN su estado manda (cubre prórrogas y penales más allá de
  // la ventana); sin ellos decide la BD o el vencimiento de la ventana.
  const finished = Boolean(
    marcador ? marcador.finalizado : partidoTerminado(match, ahora),
  )
  // Al pitazo final se guarda el resultado de una vez (un intento por partido).
  useAutoSyncFinalEnVivo(match, marcador)

  // Marcador real de ESPN; si la fuente no responde se cae al guardado en la BD
  // (normalmente null hasta el final, en cuyo caso la tarjeta muestra "vs").
  const liveLocal = marcador?.golesLocal ?? match?.goles_local
  const liveVisitante = marcador?.golesVisitante ?? match?.goles_visitante
  const prevLiveLocal = usePrevious(liveLocal)
  const prevLiveVisitante = usePrevious(liveVisitante)
  const [pulseLocal, setPulseLocal] = useState(0)
  const [pulseVisitante, setPulseVisitante] = useState(0)
  useEffect(() => {
    if (
      prevLiveLocal != null &&
      liveLocal != null &&
      liveLocal !== prevLiveLocal
    ) {
      setPulseLocal((k) => k + 1)
    }
  }, [liveLocal, prevLiveLocal])
  useEffect(() => {
    if (
      prevLiveVisitante != null &&
      liveVisitante != null &&
      liveVisitante !== prevLiveVisitante
    ) {
      setPulseVisitante((k) => k + 1)
    }
  }, [liveVisitante, prevLiveVisitante])

  return (
    <MatchCard
      variant="live"
      match={match}
      pred={pred}
      rightLabel={rightLabel}
      liveLocal={liveLocal}
      liveVisitante={liveVisitante}
      liveMinute={marcador?.minuto}
      halftime={marcador?.medioTiempo}
      finished={finished}
      pulseLocal={pulseLocal}
      pulseVisitante={pulseVisitante}
      goleadores={marcador?.goleadores}
      onClick={onClick}
    />
  )
}
