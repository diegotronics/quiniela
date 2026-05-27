import { useEffect, useMemo, useState } from "react";
import { updateFaseEstado, updateFasePuntos } from "@/api/fases";
import { useFases } from "@/hooks/useFases";
import {
  useApuestasEspecialesConfig,
  updateApuestasEspecialesConfig,
} from "@/hooks/useApuestasEspeciales";
import { Button, Card, Flag, Icon, Pill, Skeleton } from "@/components/ui";
import { FASES_INFO, code, TEAMS_MUNDIAL_2026 } from "@/lib/constants";

const ESTADOS = [
  { value: "activa", label: "Activa", tone: "accent" },
  { value: "cerrada", label: "Cerrada", tone: "default" },
  { value: "bloqueada", label: "Bloqueada", tone: "coral" },
];

export default function AdminReglas() {
  const { fases, refresh } = useFases();
  const [busy, setBusy] = useState(null);

  const setEstado = async (id, estado) => {
    setBusy(id);
    try {
      await updateFaseEstado(id, estado);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

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
        {/* Estado de fases */}
        <Card pad={0}>
          <div style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--line-2)" }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>Estado de las fases</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
              Activa la fase para que la familia pueda enviar pronósticos. Bloquéala para ocultarla.
            </div>
          </div>
          <div>
            {fases.map((f, i) => (
              <div
                key={f.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 220px",
                  gap: 16,
                  padding: "14px 18px",
                  borderBottom: i < fases.length - 1 ? "0.5px solid var(--line-2)" : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{f.nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    {FASES_INFO[f.id] || ""}
                  </div>
                </div>
                <select
                  value={f.estado}
                  disabled={busy === f.id}
                  onChange={(e) => setEstado(f.id, e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "0.5px solid var(--line)",
                    background: "var(--surface)",
                    fontSize: 13,
                    color: "var(--ink)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Card>

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
            kind="text"
            config={config}
            onSave={refresh}
          />
          <CategoriaRow
            label="Sorpresa"
            hint="Evento inesperado del torneo. Coincidencia case-insensitive."
            ptsKey="pts_sorpresa"
            resultKey="sorpresa"
            kind="text"
            config={config}
            onSave={refresh}
            last
          />
        </>
      )}
    </Card>
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
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: 16,
        padding: "14px 18px",
        borderBottom: "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
          Fecha de cierre
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>
          Después de esta fecha, los jugadores no pueden editar sus apuestas.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
          style={{
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
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 16,
        padding: "14px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {kind === "team" ? (
          <select
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            disabled={busy}
            style={{
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
            }}
          >
            <option value="">— Sin resultado —</option>
            {TEAMS_MUNDIAL_2026.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            disabled={busy}
            placeholder="Sin resultado"
            style={{
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
            }}
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
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: 16,
        padding: "14px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
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

