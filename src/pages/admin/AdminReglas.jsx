import { useEffect, useMemo, useState } from "react";
import { updateFasePuntos } from "@/api/fases";
import { useFases } from "@/hooks/useFases";
import {
  useApuestasEspecialesConfig,
  updateApuestasEspecialesConfig,
} from "@/hooks/useApuestasEspeciales";
import { Button, Card, Flag, Icon, Pill, SearchSelect, Skeleton } from "@/components/ui";
import {
  FASES_INFO,
  code,
  formatSemifinalistas,
  parseSemifinalistas,
  TEAMS_MUNDIAL_2026,
} from "@/lib/constants";
import { GOLEADOR_OPTIONS } from "@/lib/jugadores";
import { apuestasEspecialesCerradas } from "@/lib/apuestasEspeciales";

export default function AdminReglas() {
  const { fases, refresh } = useFases();

  const guardarPuntos = async (id, pts_exacto, pts_ganador) => {
    await updateFasePuntos(id, pts_exacto, pts_ganador);
    await refresh();
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
        gap: 22,
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        {/* Puntos por fase (editable) */}
        <Card pad={0}>
          <div style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--line-2)" }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>Puntos por fase</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
              Cuánto otorga cada acierto. El recálculo de puntajes corre automáticamente al guardar.
            </div>
          </div>
          <div>
            {fases.map((f, i) => (
              <RuleRow
                key={f.id}
                fase={f}
                hint={FASES_INFO[f.id] || ""}
                last={i === fases.length - 1}
                onSave={guardarPuntos}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Vista previa */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <Card pad={16}>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            Vista previa de cálculo
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flag code={code("México")} w={26} h={18} rounded={3} />
              <span style={{ fontWeight: 600 }}>México</span>
            </div>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>
              2 – 0
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600 }}>Polonia</span>
              <Flag code={code("Polonia")} w={26} h={18} rounded={3} />
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)" }}>
            Tu pick: <span className="mono" style={{ color: "var(--ink)" }}>2–0</span>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              background: "var(--accent-soft)",
              color: "var(--accent-ink)",
            }}
          >
            <RowItem label="Marcador exacto" pts={fases[0]?.pts_exacto || 5} />
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "0.5px dashed color-mix(in oklab, var(--accent-ink) 30%, transparent)",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 600,
              }}
            >
              <span>Total</span>
              <span className="mono">+{fases[0]?.pts_exacto || 5} pts</span>
            </div>
          </div>
        </Card>

        <ApuestasEspecialesAdminCard />
      </div>
    </div>
  );
}

function ApuestasEspecialesAdminCard() {
  const { config, loading, refresh } = useApuestasEspecialesConfig();

  return (
    <Card pad={0}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--line-2)" }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
          Apuestas especiales
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
          Predicciones premundiales. Cada jugador elige Campeón, Subcampeón, Goleador y Sorpresa.
        </div>
      </div>

      {loading || !config ? (
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} h={40} r={10} />
          ))}
        </div>
      ) : (
        <>
          <AperturaRow config={config} onSave={refresh} />
          <CierreRow config={config} onSave={refresh} />
          <CategoriaRow
            label="Campeón"
            hint="Equipo que levanta la copa."
            ptsKey="pts_campeon"
            resultKey="campeon"
            kind="team"
            config={config}
            onSave={refresh}
          />
          <CategoriaRow
            label="Subcampeón"
            hint="Finalista que pierde la final."
            ptsKey="pts_subcampeon"
            resultKey="subcampeon"
            kind="team"
            config={config}
            onSave={refresh}
          />
          <CategoriaRow
            label="Goleador"
            hint="Jugador con más goles (Bota de Oro)."
            ptsKey="pts_goleador"
            resultKey="goleador"
            kind="goleador"
            config={config}
            onSave={refresh}
          />
          <CategoriaRow
            label="Se queda en semifinales"
            hint="Los dos equipos que pierden en semifinales (3.º y 4.º puesto)."
            ptsKey="pts_sorpresa"
            resultKey="sorpresa"
            kind="sorpresa"
            config={config}
            onSave={refresh}
            last
          />
        </>
      )}
    </Card>
  );
}

// Control manual de la edición de apuestas. Tiene prioridad sobre la fecha
// de cierre: permite reabrir las apuestas (p. ej. para quienes no las hicieron)
// y volver a cerrarlas sin tocar la fecha.
function AperturaRow({ config, onSave }) {
  // Valor del override mapeado a las opciones del selector.
  const toOpcion = (v) => (v === true ? "abierta" : v === false ? "cerrada" : "auto");
  const [opcion, setOpcion] = useState(() => toOpcion(config.abierta_manual));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOpcion(toOpcion(config.abierta_manual));
  }, [config.abierta_manual]);

  const original = toOpcion(config.abierta_manual);
  const dirty = opcion !== original;
  const cerrada = apuestasEspecialesCerradas(config);

  const guardar = async () => {
    if (!dirty || busy) return;
    setBusy(true);
    try {
      const abierta_manual =
        opcion === "abierta" ? true : opcion === "cerrada" ? false : null;
      await updateApuestasEspecialesConfig({ abierta_manual });
      await onSave();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        padding: "14px 18px",
        borderBottom: "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
            Estado de edición
          </span>
          <Pill tone={cerrada ? "coral" : "accent"}>
            {cerrada ? "Cerradas" : "Abiertas"}
          </Pill>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>
          Habilita o cierra la edición manualmente. El modo manual ignora la
          fecha de cierre; usa "Automático" para volver a respetarla.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          justifyContent: "flex-end",
          flex: "0 1 auto",
        }}
      >
        <select
          value={opcion}
          onChange={(e) => setOpcion(e.target.value)}
          disabled={busy}
          style={teamSelectStyle}
        >
          <option value="auto">Automático (por fecha)</option>
          <option value="abierta">Abiertas (manual)</option>
          <option value="cerrada">Cerradas (manual)</option>
        </select>
        <Button
          size="sm"
          variant={dirty ? "primary" : "ghost"}
          disabled={!dirty || busy}
          onClick={guardar}
        >
          <Icon.Check /> {busy ? "…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function CierreRow({ config, onSave }) {
  const [value, setValue] = useState(() => toLocalInput(config.cierra_en));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(toLocalInput(config.cierra_en));
  }, [config.cierra_en]);

  const original = toLocalInput(config.cierra_en);
  const dirty = value !== original;

  const guardar = async () => {
    if (!dirty || busy) return;
    setBusy(true);
    try {
      const iso = value ? new Date(value).toISOString() : null;
      await updateApuestasEspecialesConfig({ cierra_en: iso });
      await onSave();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        padding: "14px 18px",
        borderBottom: "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
          Fecha de cierre
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>
          Después de esta fecha, los jugadores no pueden editar sus apuestas.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          justifyContent: "flex-end",
          flex: "0 1 auto",
        }}
      >
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
          style={{
            minWidth: 0,
            maxWidth: "100%",
            padding: "7px 10px",
            borderRadius: 8,
            border: "0.5px solid var(--line)",
            background: "var(--surface-2)",
            fontSize: 12,
            color: "var(--ink)",
            fontFamily: "var(--font-mono)",
            outline: "none",
          }}
        />
        <Button
          size="sm"
          variant={dirty ? "primary" : "ghost"}
          disabled={!dirty || busy}
          onClick={guardar}
        >
          <Icon.Check /> {busy ? "…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function CategoriaRow({ label, hint, ptsKey, resultKey, kind, config, onSave, last }) {
  const [pts, setPts] = useState(String(config[ptsKey] ?? 0));
  const [resultado, setResultado] = useState(config[resultKey] || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPts(String(config[ptsKey] ?? 0));
    setResultado(config[resultKey] || "");
  }, [config, ptsKey, resultKey]);

  const ptsNum = Number.parseInt(pts, 10);
  const ptsValid = Number.isFinite(ptsNum) && ptsNum >= 0;
  const dirty =
    (ptsValid && ptsNum !== config[ptsKey]) ||
    (resultado || "") !== (config[resultKey] || "");

  const guardar = async () => {
    if (!dirty || !ptsValid || busy) return;
    setBusy(true);
    try {
      await updateApuestasEspecialesConfig({
        [ptsKey]: ptsNum,
        [resultKey]: resultado.trim() || null,
      });
      await onSave();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        padding: "14px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{label}</span>
          {config[resultKey] && <Pill tone="accent">Resultado cargado</Pill>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>
          {hint}
        </div>
        {kind === "team" && resultado && (
          <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Flag code={code(resultado)} w={22} h={16} rounded={3} />
            <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{resultado}</span>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "flex-end",
          flexWrap: "wrap",
          flex: "1 1 240px",
          minWidth: 0,
        }}
      >
        {kind === "team" ? (
          <select
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            disabled={busy}
            style={teamSelectStyle}
          >
            <option value="">— Sin resultado —</option>
            {TEAMS_MUNDIAL_2026.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : kind === "goleador" ? (
          <div style={{ flex: "1 1 220px", minWidth: 200 }}>
            <SearchSelect
              value={resultado}
              onChange={setResultado}
              options={GOLEADOR_OPTIONS}
              placeholder="— Sin resultado —"
              searchPlaceholder="Buscar jugador o selección…"
              disabled={busy}
              emptyLabel="Ningún jugador coincide"
            />
          </div>
        ) : kind === "sorpresa" ? (
          <SemifinalistasResultSelect
            value={resultado}
            onChange={setResultado}
            disabled={busy}
          />
        ) : (
          <input
            type="text"
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            disabled={busy}
            placeholder="Sin resultado"
            style={teamSelectStyle}
          />
        )}
        <PtsInput label="Pts" value={pts} onChange={setPts} disabled={busy} />
        <Button
          size="sm"
          variant={dirty && ptsValid ? "primary" : "ghost"}
          disabled={!dirty || !ptsValid || busy}
          onClick={guardar}
        >
          <Icon.Check /> {busy ? "…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

const teamSelectStyle = {
  flex: "1 1 140px",
  minWidth: 140,
  padding: "7px 10px",
  borderRadius: 8,
  border: "0.5px solid var(--line)",
  background: "var(--surface-2)",
  fontSize: 12,
  color: "var(--ink)",
  fontFamily: "var(--font-sans)",
  outline: "none",
};

// Resultado oficial de "Se queda en semifinales": los dos equipos que pierden
// en semifinales (3.º y 4.º puesto), combinados en el mismo valor canónico que
// compara la apuesta del usuario.
function SemifinalistasResultSelect({ value, onChange, disabled }) {
  const parsed = parseSemifinalistas(value);
  const [a, setA] = useState(parsed[0] || "");
  const [b, setB] = useState(parsed[1] || "");

  useEffect(() => {
    const p = parseSemifinalistas(value);
    if (formatSemifinalistas(p[0], p[1]) !== formatSemifinalistas(a, b)) {
      setA(p[0] || "");
      setB(p[1] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setParte = (nextA, nextB) => {
    setA(nextA);
    setB(nextB);
    onChange(formatSemifinalistas(nextA, nextB));
  };

  const opcionesPara = (otro) =>
    TEAMS_MUNDIAL_2026.filter((t) => t !== otro);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px", minWidth: 180 }}>
      <select
        value={a}
        onChange={(e) => setParte(e.target.value, b)}
        disabled={disabled}
        style={teamSelectStyle}
      >
        <option value="">— Semifinalista 1 —</option>
        {opcionesPara(b).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={b}
        onChange={(e) => setParte(a, e.target.value)}
        disabled={disabled}
        style={teamSelectStyle}
      >
        <option value="">— Semifinalista 2 —</option>
        {opcionesPara(a).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function RuleRow({ fase, hint, last, onSave }) {
  const max = 15;
  const [exacto, setExacto] = useState(String(fase.pts_exacto ?? 0));
  const [ganador, setGanador] = useState(String(fase.pts_ganador ?? 0));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setExacto(String(fase.pts_exacto ?? 0));
    setGanador(String(fase.pts_ganador ?? 0));
  }, [fase.pts_exacto, fase.pts_ganador]);

  const exactoNum = Number.parseInt(exacto, 10);
  const ganadorNum = Number.parseInt(ganador, 10);
  const valid =
    Number.isFinite(exactoNum) &&
    Number.isFinite(ganadorNum) &&
    exactoNum >= 0 &&
    ganadorNum >= 0 &&
    exactoNum >= ganadorNum;
  const dirty = exactoNum !== fase.pts_exacto || ganadorNum !== fase.pts_ganador;

  const guardar = async () => {
    if (!dirty || !valid || busy) return;
    setBusy(true);
    try {
      await onSave(fase.id, exactoNum, ganadorNum);
    } finally {
      setBusy(false);
    }
  };

  const fillPct = valid ? Math.min(100, (exactoNum / max) * 100) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        padding: "14px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div style={{ flex: "1 1 180px", minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{fase.nombre}</div>
        {hint && (
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>{hint}</div>
        )}
        <div style={{ marginTop: 8, height: 4, background: "var(--line)", borderRadius: 4, position: "relative", maxWidth: 220 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${fillPct}%`,
              background: "var(--accent)",
              borderRadius: 4,
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "flex-end",
          flexWrap: "wrap",
          flex: "1 1 240px",
          minWidth: 0,
        }}
      >
        <PtsInput label="Exacto" value={exacto} onChange={setExacto} disabled={busy} />
        <PtsInput label="Ganador" value={ganador} onChange={setGanador} disabled={busy} />
        <Button
          size="sm"
          variant={dirty && valid ? "primary" : "ghost"}
          disabled={!dirty || !valid || busy}
          onClick={guardar}
        >
          <Icon.Check /> {busy ? "…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function PtsInput({ label, value, onChange, disabled }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 500, letterSpacing: 0.2, textTransform: "uppercase" }}>
        {label}
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        style={{
          width: 56,
          padding: "6px 8px",
          borderRadius: 8,
          background: "var(--surface-2)",
          border: "0.5px solid var(--line)",
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--ink)",
          textAlign: "center",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function RowItem({ label, pts }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span>{label}</span>
      <span className="mono" style={{ fontWeight: 600 }}>
        +{pts}
      </span>
    </div>
  );
}

