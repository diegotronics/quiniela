// Galería de componentes UI — accesible solo en /dev/ui-test.
// Renderiza todos los componentes en sus variantes para inspección
// visual y para que la suite Playwright capture screenshots por bloque.
//
// Cada sección está envuelta en un <section data-ui-block="…"> para que
// los tests puedan localizarla y capturarla individualmente.

import { useState } from "react";
import {
  Avatar,
  BallLoader,
  Button,
  Card,
  ChampionReveal,
  Countdown,
  EmptyState,
  Flag,
  Icon,
  LiveBadge,
  Logo,
  MatchCard,
  Pill,
  RankRow,
  ScoreStepper,
  SectionTitle,
  Skeleton,
  SkeletonMatchCard,
  SkeletonMatchList,
  SkeletonPodium,
  SkeletonRankRow,
  SkeletonText,
  StatTile,
  StreakFlame,
  TeamRow,
} from "@/components/ui";
import { code } from "@/lib/constants";

const MATCH_PENDIENTE = {
  id: 1,
  grupo: "A",
  fecha: "2026-06-11T18:00:00Z",
  equipo_local: "México",
  equipo_visitante: "Estados Unidos",
  resultado_ingresado: false,
};

const MATCH_PRONOSTICADO = {
  ...MATCH_PENDIENTE,
  id: 2,
  equipo_local: "Brasil",
  equipo_visitante: "Argentina",
};

const MATCH_FINAL = {
  id: 3,
  grupo: "C",
  fecha: "2026-06-12T20:00:00Z",
  equipo_local: "España",
  equipo_visitante: "Alemania",
  resultado_ingresado: true,
  goles_local: 2,
  goles_visitante: 1,
};

const MATCH_EMPATE = {
  id: 4,
  grupo: "D",
  fecha: "2026-06-12T22:00:00Z",
  equipo_local: "Francia",
  equipo_visitante: "Argentina",
  resultado_ingresado: true,
  goles_local: 1,
  goles_visitante: 1,
};

const PRED_EXACTO = {
  goles_local: 2,
  goles_visitante: 1,
  puntos_obtenidos: 5,
};

const PRED_PENDIENTE = {
  goles_local: 1,
  goles_visitante: 0,
};

function Block({ id, title, children }) {
  return (
    <section
      data-ui-block={id}
      style={{
        marginBottom: 36,
        padding: 16,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
      }}
    >
      <h2
        style={{
          margin: "0 0 14px",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </section>
  );
}

function Row({ children, label }) {
  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div
      data-ui-block="theme-switcher"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        gap: 8,
        padding: "10px 12px",
        marginBottom: 18,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink-2)",
          alignSelf: "center",
          marginRight: 6,
        }}
      >
        Tema:
      </span>
      <Button
        size="sm"
        variant={theme === "light" ? "primary" : "ghost"}
        data-test="theme-light"
        onClick={() => setTheme("light")}
      >
        Claro
      </Button>
      <Button
        size="sm"
        variant={theme === "dark" ? "primary" : "ghost"}
        data-test="theme-dark"
        onClick={() => setTheme("dark")}
      >
        Oscuro
      </Button>
    </div>
  );
}

export default function UITestGallery() {
  const [theme, setThemeState] = useState(
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || "light"
      : "light",
  );
  const [goalsLocal, setGoalsLocal] = useState(1);
  const [goalsVisitante, setGoalsVisitante] = useState(2);

  const setTheme = (t) => {
    setThemeState(t);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  return (
    <div
      data-section="inicio"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        padding: "18px 14px 60px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ marginBottom: 24, textAlign: "center" }}>
          <h1
            className="font-display"
            style={{ margin: 0, fontSize: 26, letterSpacing: -0.4 }}
          >
            Galería de UI
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              color: "var(--ink-3)",
              fontSize: 13,
            }}
          >
            Inventario de componentes y estados — uso interno
          </p>
        </header>

        <ThemeSwitcher theme={theme} setTheme={setTheme} />

        <Block id="tipografia" title="Tipografía">
          <h1 style={{ margin: 0 }} className="font-display">
            Display H1 — Mundial 2026
          </h1>
          <h2 style={{ margin: 0 }}>Encabezado H2 — Tabla familiar</h2>
          <h3 style={{ margin: 0 }}>Encabezado H3 — Próximos partidos</h3>
          <p style={{ margin: 0 }}>
            Texto base. Hoy juegan México y Estados Unidos. ¿Ya enviaste tus
            pronósticos?
          </p>
          <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 13 }}>
            Texto secundario más pequeño con color atenuado.
          </p>
          <p style={{ margin: 0 }} className="mono">
            Mono · 12 + 8 = 20 pts
          </p>
          <p style={{ margin: 0 }} className="font-score">
            Score · 2 – 1
          </p>
        </Block>

        <Block id="colores" title="Tokens de color">
          <Row label="Acentos">
            <Swatch token="--accent" label="accent" />
            <Swatch token="--coral" label="coral" />
            <Swatch token="--gold" label="gold" />
            <Swatch token="--azure" label="azure" />
            <Swatch token="--magenta" label="magenta" />
            <Swatch token="--danger" label="danger" />
          </Row>
          <Row label="Superficies y tinta">
            <Swatch token="--bg" label="bg" />
            <Swatch token="--surface" label="surface" />
            <Swatch token="--surface-2" label="surface-2" />
            <Swatch token="--ink" label="ink" />
            <Swatch token="--ink-2" label="ink-2" />
            <Swatch token="--ink-3" label="ink-3" />
          </Row>
          <Row label="Gradientes">
            <Gradient cls="bg-gradient-cancha" label="cancha" />
            <Gradient cls="bg-gradient-fiesta" label="fiesta" />
            <Gradient cls="bg-gradient-trofeo" label="trofeo" />
            <Gradient cls="bg-gradient-nocturno" label="nocturno" />
          </Row>
        </Block>

        <Block id="buttons" title="Botones">
          <Row label="Variantes">
            <Button variant="primary">Primario</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Eliminar</Button>
            <Button variant="link">Enlace</Button>
          </Row>
          <Row label="Tamaños">
            <Button size="sm">Pequeño</Button>
            <Button size="md">Mediano</Button>
            <Button size="lg">Grande</Button>
          </Row>
          <Row label="Estados">
            <Button>
              Con ícono <Icon.Arrow />
            </Button>
            <Button disabled>Deshabilitado</Button>
            <Button block>Bloque completo</Button>
          </Row>
        </Block>

        <Block id="pills" title="Pills / etiquetas">
          <Row>
            <Pill tone="default">Default</Pill>
            <Pill tone="accent">Acento</Pill>
            <Pill tone="coral" dot>
              Coral con dot
            </Pill>
            <Pill tone="gold">Oro</Pill>
            <Pill tone="danger">Peligro</Pill>
            <Pill tone="ink">Tinta</Pill>
            <Pill tone="outline">Outline</Pill>
            <Pill tone="live">En vivo</Pill>
          </Row>
          <Row label="Tamaño md">
            <Pill tone="accent" size="md">
              Más grande
            </Pill>
            <Pill tone="gold" size="md">
              Resultado exacto
            </Pill>
          </Row>
        </Block>

        <Block id="badges" title="Insignias y estados">
          <Row>
            <LiveBadge />
            <LiveBadge variant="soft" />
            <LiveBadge size="lg" minute={67} />
            <span className="live-dot" />
            <span className="font-score" style={{ fontSize: 20 }}>
              90'
            </span>
          </Row>
          <Row label="Insignia oro pulsante">
            <Card pad={12} elevated className="breathe-gold">
              <Pill tone="gold">Líder de la tabla</Pill>
            </Card>
          </Row>
        </Block>

        <Block id="avatars" title="Avatares">
          <Row label="Tamaños">
            <Avatar name="Diego Pérez" size={28} />
            <Avatar name="María García" size={36} />
            <Avatar name="José Luis" size={48} />
            <Avatar name="Ana Beatriz" size={64} />
          </Row>
          <Row label="Anillos">
            <Avatar name="Líder" size={48} ring="gold" />
            <Avatar name="Segundo" size={48} ring="silver" />
            <Avatar name="Tercero" size={48} ring="bronze" />
            <Avatar name="Racha" size={48} ring="fire" />
            <Avatar name="Sección" size={48} ring="section" />
          </Row>
          <Row label="Con insignia">
            <Avatar
              name="Diego Pérez"
              size={48}
              ring="gold"
              badge={{ label: "1" }}
            />
            <Avatar
              name="Capitán"
              size={48}
              badge={{
                label: "C",
                bg: "var(--coral)",
                fg: "#fff",
              }}
            />
          </Row>
        </Block>

        <Block id="flags" title="Banderas">
          <Row label="Recetas variadas">
            {[
              "MEX",
              "USA",
              "CAN",
              "BRA",
              "ARG",
              "ESP",
              "FRA",
              "GER",
              "ITA",
              "POR",
              "NED",
              "BEL",
              "JPN",
              "KOR",
              "AUS",
              "URU",
              "CHI",
              "SUI",
              "MAR",
              "SAU",
            ].map((c) => (
              <span key={c} style={{ textAlign: "center", width: 60 }}>
                <Flag code={c} w={40} h={28} />
                <div style={{ fontSize: 10, marginTop: 4 }}>{c}</div>
              </span>
            ))}
          </Row>
          <Row label="Tamaños">
            <Flag code="MEX" w={20} h={14} />
            <Flag code="MEX" w={32} h={22} />
            <Flag code="MEX" w={48} h={34} />
            <Flag code="MEX" w={64} h={46} />
          </Row>
        </Block>

        <Block id="cards" title="Tarjetas">
          <Card>
            <strong>Card por defecto</strong>
            <p
              style={{ margin: "6px 0 0", color: "var(--ink-3)", fontSize: 13 }}
            >
              Borde sutil, sombra ligera, padding 16.
            </p>
          </Card>
          <Card elevated>
            <strong>Card elevada</strong>
            <p
              style={{ margin: "6px 0 0", color: "var(--ink-3)", fontSize: 13 }}
            >
              Sombra más marcada, lista para hero o ganador.
            </p>
          </Card>
          <Card accent>
            <strong>Card acento</strong>
            <p
              style={{
                margin: "6px 0 0",
                color: "var(--accent-ink)",
                fontSize: 13,
              }}
            >
              Fondo de acento suave para destacar.
            </p>
          </Card>
          <Card onClick={() => {}}>
            <strong>Card clickeable</strong>
            <p
              style={{ margin: "6px 0 0", color: "var(--ink-3)", fontSize: 13 }}
            >
              Pasa el cursor para ver el hover.
            </p>
          </Card>
        </Block>

        <Block id="section-titles" title="Section titles">
          <SectionTitle>Próximos partidos</SectionTitle>
          <SectionTitle action="Ver todos" onActionClick={() => {}}>
            Tabla familiar
          </SectionTitle>
        </Block>

        <Block id="match-cards" title="MatchCard — variantes y estados">
          <Row label="Lista · pendiente sin pronóstico">
            <div style={{ width: "100%" }}>
              <MatchCard match={MATCH_PENDIENTE} />
            </div>
          </Row>
          <Row label="Lista · pronosticado">
            <div style={{ width: "100%" }}>
              <MatchCard match={MATCH_PRONOSTICADO} pred={PRED_PENDIENTE} />
            </div>
          </Row>
          <Row label="Lista · finalizado con resultado exacto">
            <div style={{ width: "100%" }}>
              <MatchCard match={MATCH_FINAL} pred={PRED_EXACTO} />
            </div>
          </Row>
          <Row label="Lista · empate">
            <div style={{ width: "100%" }}>
              <MatchCard match={MATCH_EMPATE} />
            </div>
          </Row>
          <Row label="Live">
            <div style={{ width: "100%" }}>
              <MatchCard
                variant="live"
                match={MATCH_PRONOSTICADO}
                pred={PRED_PENDIENTE}
                rightLabel="Min 67'"
                liveLocal={1}
                liveVisitante={0}
              />
            </div>
          </Row>
          <Row label="Bracket">
            <div style={{ width: 240 }}>
              <MatchCard
                variant="bracket"
                match={MATCH_FINAL}
                pred={PRED_EXACTO}
              />
            </div>
          </Row>
        </Block>

        <Block id="team-row" title="TeamRow">
          <Row label="Tamaños">
            <div style={{ width: 220 }}>
              <TeamRow team="México" size="xs" />
            </div>
            <div style={{ width: 220 }}>
              <TeamRow team="México" size="sm" />
            </div>
            <div style={{ width: 220 }}>
              <TeamRow team="México" size="md" />
            </div>
            <div style={{ width: 220 }}>
              <TeamRow team="México" size="lg" />
            </div>
          </Row>
          <Row label="Ganador / perdedor">
            <div style={{ width: 220 }}>
              <TeamRow team="México" isFinal isWinner />
            </div>
            <div style={{ width: 220 }}>
              <TeamRow team="Estados Unidos" isFinal isLoser />
            </div>
          </Row>
        </Block>

        <Block id="rank-rows" title="RankRow — tabla familiar">
          <RankRow
            member={{
              rank: 1,
              nombre: "Diego Pérez",
              puntos: 42,
              pagado: true,
            }}
            index={0}
          />
          <RankRow
            member={{
              rank: 2,
              nombre: "María García",
              puntos: 38,
              pagado: true,
            }}
            index={1}
          />
          <RankRow
            member={{
              rank: 3,
              nombre: "José Luis",
              puntos: 35,
              pagado: true,
            }}
            index={2}
          />
          <RankRow
            member={{
              rank: 4,
              nombre: "Ana Beatriz Hernández",
              puntos: 28,
              pagado: true,
            }}
            index={3}
          />
          <RankRow
            member={{
              rank: 12,
              nombre: "Pedro Hernández",
              puntos: 10,
              pagado: false,
            }}
            index={4}
            isMe
            showPagoStatus
          />
        </Block>

        <Block id="stat-tiles" title="StatTile">
          <Row>
            <StatTile label="Puntos" value="42" unit="pts" />
            <StatTile label="Aciertos" value="8/12" tone="accent" />
            <StatTile label="Racha" value="4" tone="coral" />
            <StatTile label="Posición" value="#3" tone="gold" />
          </Row>
        </Block>

        <Block id="score-stepper" title="ScoreStepper">
          <Row label="Editar marcador">
            <ScoreStepper
              label="México"
              value={goalsLocal}
              onChange={setGoalsLocal}
            />
            <span
              className="font-score"
              style={{ fontSize: 28, padding: "0 8px" }}
            >
              –
            </span>
            <ScoreStepper
              label="Estados Unidos"
              value={goalsVisitante}
              onChange={setGoalsVisitante}
            />
          </Row>
          <Row label="Tamaño grande">
            <ScoreStepper label="Argentina" value={3} onChange={() => {}} size="lg" />
            <ScoreStepper label="Francia" value={2} onChange={() => {}} size="lg" />
          </Row>
        </Block>

        <Block id="countdown" title="Countdown">
          <Countdown
            targetIso={new Date(
              Date.now() + 1000 * 60 * 60 * 26,
            ).toISOString()}
          />
          <Countdown
            compact
            targetIso={new Date(
              Date.now() + 1000 * 60 * 60 * 2,
            ).toISOString()}
          />
          <Countdown targetIso={null} fallbackLabel="Sin fecha programada" />
        </Block>

        <Block id="streak-flame" title="StreakFlame">
          <Row>
            <StreakFlame streak={0} />
            <StreakFlame streak={2} />
            <StreakFlame streak={5} />
            <StreakFlame streak={9} />
          </Row>
        </Block>

        <Block id="logo" title="Logo">
          <Row>
            <Logo size={36} />
            <Logo size={56} rounded />
            <Logo size={80} rounded />
          </Row>
        </Block>

        <Block id="empty-states" title="EmptyState">
          <EmptyState
            illustration="ball"
            title="Sin partidos por jugar"
            description="Cuando arranque el Mundial verás aquí los partidos del día."
          />
          <EmptyState
            illustration="trophy"
            title="Aún no hay líder"
            description="Empieza a pronosticar para subir en la tabla."
            cta={{ label: "Pronosticar ahora" }}
          />
          <EmptyState
            illustration="chat"
            title="Sin mensajes"
            description="Sé el primero en romper el hielo."
            compact
          />
        </Block>

        <Block id="skeletons" title="Skeleton loaders">
          <Row label="Texto">
            <div style={{ width: "100%" }}>
              <SkeletonText lines={3} />
            </div>
          </Row>
          <Row label="MatchCard">
            <div style={{ width: "100%" }}>
              <SkeletonMatchCard />
            </div>
          </Row>
          <Row label="Lista de partidos">
            <div style={{ width: "100%" }}>
              <SkeletonMatchList count={2} />
            </div>
          </Row>
          <Row label="Tabla">
            <div style={{ width: "100%" }}>
              <SkeletonRankRow />
              <SkeletonRankRow />
              <SkeletonRankRow />
            </div>
          </Row>
          <Row label="Podio">
            <div style={{ width: "100%" }}>
              <SkeletonPodium />
            </div>
          </Row>
          <Row label="Loader balón">
            <BallLoader />
          </Row>
          <Row label="Bloques sueltos">
            <Skeleton style={{ height: 12, width: 100 }} />
            <Skeleton style={{ height: 12, width: 60 }} />
            <Skeleton style={{ height: 12, width: 140 }} />
          </Row>
        </Block>

        <Block id="champion-reveal" title="ChampionReveal">
          <ChampionReveal teamName="Argentina" code={code} Flag={Flag} />
        </Block>

        <Block id="iconos" title="Iconos">
          <Row>
            {Object.keys(Icon)
              .filter((k) => typeof Icon[k] === "function")
              .map((name) => {
                const C = Icon[name];
                return (
                  <span
                    key={name}
                    style={{
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      width: 64,
                      fontSize: 10,
                      color: "var(--ink-3)",
                    }}
                  >
                    <C />
                    {name}
                  </span>
                );
              })}
          </Row>
        </Block>
      </div>
    </div>
  );
}

function Swatch({ token, label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize: 10,
        color: "var(--ink-3)",
        gap: 4,
        width: 72,
      }}
    >
      <span
        style={{
          width: 56,
          height: 40,
          borderRadius: 8,
          background: `var(${token})`,
          border: "1px solid var(--line)",
        }}
      />
      {label}
    </span>
  );
}

function Gradient({ cls, label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize: 10,
        color: "var(--ink-3)",
        gap: 4,
        width: 96,
      }}
    >
      <span
        className={cls}
        style={{
          width: 88,
          height: 40,
          borderRadius: 8,
          border: "1px solid var(--line)",
        }}
      />
      {label}
    </span>
  );
}
