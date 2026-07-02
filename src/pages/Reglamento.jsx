import { useNavigate } from 'react-router-dom'
import { useFases } from '@/hooks/useFases'
import { useApuestasEspecialesConfig } from '@/hooks/useApuestasEspeciales'
import {
  Card,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
  Skeleton,
} from '@/components/ui'
import { GROUP_NAME } from '@/lib/constants'
import { formatearFechaHora } from '@/lib/fechas'

// Reglamento oficial de la quiniela. El texto documenta las reglas tal como
// están implementadas (cierres, scoring, casos de eliminatoria); los puntos
// por fase y por apuesta especial se leen en vivo de la base de datos, así
// que si el admin los ajusta esta página nunca queda desactualizada.
export default function Reglamento() {
  const navigate = useNavigate()
  const { fases } = useFases()
  const { config, loading: cfgLoading } = useApuestasEspecialesConfig()

  const totalEspeciales =
    (config?.pts_campeon ?? 0) +
    (config?.pts_subcampeon ?? 0) +
    (config?.pts_goleador ?? 0) +
    (config?.pts_sorpresa ?? 0)

  const cierreEspeciales =
    config?.abierta_manual == null && config?.cierra_en
      ? formatearFechaHora(config.cierra_en)
      : null

  return (
    <MobileShell
      activeTab="inicio"
      header={
        <MobileHeader
          title="Reglamento"
          subtitle={`Las reglas oficiales de ${GROUP_NAME}`}
          onBack={() => navigate(-1)}
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
        <Card pad={16}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
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
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Este reglamento es la referencia oficial de la quiniela. Los
              puntos que ves aquí son los vigentes: si se ajustan, esta página
              se actualiza sola.
            </div>
          </div>
        </Card>

        {/* 1. Cómo se juega */}
        <SectionTitle>1 · Cómo se juega</SectionTitle>
        <Card pad={16}>
          <Regla>
            Pronosticas el marcador exacto de cada partido del Mundial, desde
            la fase de grupos hasta la final.
          </Regla>
          <Regla>
            Además, antes del torneo haces cuatro apuestas especiales:
            Campeón, Subcampeón, Goleador y Sorpresa.
          </Regla>
          <Regla last>
            Todos los puntos suman en una sola tabla general. Gana quien
            termine con más puntos al cerrar el torneo.
          </Regla>
        </Card>

        {/* 2. Puntos por partido */}
        <SectionTitle>2 · Puntos por partido</SectionTitle>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px' }}>
            <Regla>
              <b>Marcador exacto</b>: aciertas los goles de los dos equipos.
            </Regla>
            <Regla>
              <b>Resultado</b>: aciertas quién gana, o el empate, sin pegar el
              marcador.
            </Regla>
            <Regla>
              Exacto y resultado no se suman: el marcador exacto otorga
              únicamente los puntos de exacto, que son el premio completo del
              partido.
            </Regla>
            <Regla last>
              Partido sin pronóstico (o con el marcador incompleto) al
              momento del cierre: 0 puntos.
            </Regla>
          </div>
          <div
            style={{
              borderTop: '0.5px solid var(--line-2)',
              padding: '6px 16px 10px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '0 10px',
                alignItems: 'center',
              }}
            >
              <span />
              <span style={cabeceraTabla}>Exacto</span>
              <span style={cabeceraTabla}>Resultado</span>
              {fases.length === 0
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ gridColumn: '1 / -1', padding: '6px 0' }}
                    >
                      <Skeleton w="100%" h={18} />
                    </div>
                  ))
                : fases.map((f) => (
                    <FaseRow key={f.id} fase={f} />
                  ))}
            </div>
          </div>
        </Card>

        {/* 3. Cierre de pronósticos */}
        <SectionTitle>3 · Cierre de cada pronóstico</SectionTitle>
        <Card pad={16}>
          <Regla>
            Cada pronóstico cierra <b>una hora antes del saque</b> de su
            partido. Hasta ese momento puedes crearlo o editarlo cuantas veces
            quieras.
          </Regla>
          <Regla>
            Al cerrar, los pronósticos de toda la familia para ese partido se
            hacen visibles. Nadie puede ver los pronósticos ajenos mientras
            todavía se puede apostar.
          </Regla>
          <Regla last>
            El bloqueo lo aplica el servidor: un pronóstico enviado tarde se
            rechaza aunque la app estuviera abierta desde antes.
          </Regla>
        </Card>

        {/* 4. Resultados oficiales */}
        <SectionTitle>4 · Resultados oficiales</SectionTitle>
        <Card pad={16}>
          <Regla>
            Los marcadores se sincronizan automáticamente desde ESPN al
            terminar cada partido. Nadie carga goles a mano; el admin solo
            corrige errores de la fuente.
          </Regla>
          <Regla>
            El marcador que puntúa es el del final del juego: en eliminatorias
            incluye la prórroga si la hubo.
          </Regla>
          <Regla>
            Los penales no suman goles. Si el partido termina empatado y se
            define por penales, para el puntaje vale el empate; la tanda solo
            decide quién avanza de ronda.
          </Regla>
          <Caso>
            Ejemplo: pronosticaste 1–1, el partido terminó 1–1 y se definió
            por penales. Es marcador exacto y cobras los puntos de exacto.
          </Caso>
          <Regla last>
            Un partido con resultado cargado ya no se modifica, salvo
            corrección de un error de la fuente por parte del admin.
          </Regla>
        </Card>

        {/* 5. Eliminatorias */}
        <SectionTitle>5 · Eliminatorias y cambios de cruce</SectionTitle>
        <Card pad={16}>
          <Regla>
            Los partidos de cada ronda se crean cuando quedan definidos sus
            dos clasificados, y desde ese momento se pueden pronosticar.
          </Regla>
          <Regla>
            Si se corrige el resultado de una ronda anterior y cambian los
            equipos de un cruce aún no jugado, los pronósticos hechos para el
            cruce viejo se borran automáticamente: eran de otro partido.
          </Regla>
          <Regla last>
            En ese caso hay que pronosticar el cruce de nuevo; el aviso de
            pronósticos pendientes del inicio lo recuerda.
          </Regla>
        </Card>

        {/* 6. Apuestas especiales */}
        <SectionTitle>6 · Apuestas especiales</SectionTitle>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '6px 16px 10px' }}>
            {cfgLoading ? (
              <div style={{ padding: '8px 0' }}>
                <Skeleton w="100%" h={72} r={10} />
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '0 10px',
                  alignItems: 'center',
                }}
              >
                <EspecialRow label="Campeón del Mundo" pts={config?.pts_campeon} />
                <EspecialRow label="Subcampeón" pts={config?.pts_subcampeon} />
                <EspecialRow label="Goleador del torneo" pts={config?.pts_goleador} />
                <EspecialRow label="Sorpresa del Mundial" pts={config?.pts_sorpresa} />
                <span
                  style={{
                    padding: '8px 0 2px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Total en juego
                </span>
                <span
                  className="mono"
                  style={{
                    padding: '8px 0 2px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    textAlign: 'right',
                  }}
                >
                  {totalEspeciales} pts
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              borderTop: '0.5px solid var(--line-2)',
              padding: '14px 16px',
            }}
          >
            <Regla>
              {cierreEspeciales ? (
                <>
                  Cierran el <b>{cierreEspeciales}</b>. Hasta entonces puedes
                  editarlas cuantas veces quieras.
                </>
              ) : (
                <>
                  La apertura y el cierre los controla el admin. Mientras
                  estén abiertas puedes editarlas cuantas veces quieras.
                </>
              )}
            </Regla>
            <Regla>
              Al cierre quedan congeladas y se hacen públicas para todo el
              grupo, con la fecha de última edición de cada una como
              constancia de que nadie las tocó después.
            </Regla>
            <Regla>
              El Goleador es el ganador oficial de la Bota de Oro. Si hay
              empate en goles, vale el desempate oficial de la FIFA.
            </Regla>
            <Regla>
              La Sorpresa exige acertar la selección y la fase exacta a la que
              llega. Equipo correcto con fase errada no puntúa.
            </Regla>
            <Regla last>
              Al terminar el torneo, el admin carga los resultados oficiales y
              los puntos se suman solos a la tabla general.
            </Regla>
          </div>
        </Card>

        {/* 7. Tabla y desempates */}
        <SectionTitle>7 · Tabla y desempates</SectionTitle>
        <Card pad={16}>
          <Regla>
            La tabla general suma los puntos de partidos más los de apuestas
            especiales. Los filtros por semana o por fase muestran solo puntos
            de partidos.
          </Regla>
          <Regla>
            El admin no participa en la quiniela ni aparece en la tabla.
          </Regla>
          <Regla>
            Empate en puntos: se comparte la posición, y la siguiente se
            salta. Dos primeros lugares hacen que el que sigue sea tercero.
          </Regla>
          <Regla last>
            Si al cerrar el torneo persiste un empate en un puesto con premio,
            el premio de ese puesto se reparte en partes iguales.
          </Regla>
        </Card>

        {/* 8. Inscripción y premios */}
        <SectionTitle>8 · Inscripción y premios</SectionTitle>
        <Card pad={16}>
          <Regla>
            Para optar a premios hay que estar al día con la inscripción. El
            estado de pago de cada jugador es visible en la tabla.
          </Regla>
          <Regla last>
            El monto de la inscripción y la repartición de los premios son los
            acordados por el grupo.
          </Regla>
        </Card>

        {/* 9. Casos no previstos */}
        <SectionTitle>9 · Casos no previstos</SectionTitle>
        <Card pad={16} style={{ marginBottom: 8 }}>
          <Regla>
            Cualquier situación que este reglamento no cubra la resuelve el
            admin, después de consultarla con el grupo en el chat.
          </Regla>
          <Regla last>
            Los registros de la app —pronósticos, fechas de última edición y
            resultados sincronizados— son la referencia oficial ante
            cualquier duda.
          </Regla>
        </Card>
      </div>
    </MobileShell>
  )
}

const cabeceraTabla = {
  fontSize: 10,
  color: 'var(--ink-3)',
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  textAlign: 'right',
  padding: '6px 0',
}

// Punto del reglamento: viñeta con la marca de la casa.
function Regla({ children, last }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        paddingBottom: last ? 0 : 10,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--accent)',
          flexShrink: 0,
          marginTop: 6,
        }}
      />
      <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
        {children}
      </span>
    </div>
  )
}

// Caso resaltado: el ejemplo concreto que evita la discusión clásica.
function Caso({ children }) {
  return (
    <div
      style={{
        margin: '2px 0 10px 16px',
        padding: '10px 12px',
        borderRadius: 'var(--r-md)',
        background: 'var(--accent-soft)',
        color: 'var(--accent-ink)',
        fontSize: 12.5,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  )
}

function FaseRow({ fase }) {
  return (
    <>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--ink)',
          padding: '6px 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {fase.nombre}
      </span>
      <span style={celdaPts}>+{fase.pts_exacto ?? 0}</span>
      <span style={celdaPts}>+{fase.pts_ganador ?? 0}</span>
    </>
  )
}

const celdaPts = {
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--ink)',
  textAlign: 'right',
  padding: '6px 0',
  fontVariantNumeric: 'tabular-nums',
}

function EspecialRow({ label, pts }) {
  return (
    <>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--ink)',
          padding: '6px 0',
        }}
      >
        {label}
      </span>
      <span style={{ padding: '4px 0', textAlign: 'right' }}>
        <Pill tone="accent">+{pts ?? 0} pts</Pill>
      </span>
    </>
  )
}
