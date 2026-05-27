import { useEffect, useMemo, useState } from "react";
import { clearResultadoPartido, setResultadoPartido } from "@/api/partidos";
import { useFases } from "@/hooks/useFases";
import { usePartidosByFase } from "@/hooks/usePartidos";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { Avatar, Button, Card, Flag, Icon, Pill } from "@/components/ui";
import { code } from "@/lib/constants";

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const TABS = [
  { id: "proximos", label: "Próximos" },
  { id: "live", label: "En vivo" },
  { id: "final", label: "Finalizados" },
];

const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000;

function isLive(p, now) {
  if (!p || p.resultado_ingresado || !p.fecha) return false;
  const t = new Date(p.fecha).getTime();
  if (Number.isNaN(t)) return false;
  return Math.abs(t - now) <= LIVE_WINDOW_MS;
}

export default function AdminPartidos() {
  const { fases } = useFases();
  const [selectedFase, setSelectedFase] = useState("grupos");
  const [grupo, setGrupo] = useState("A");
  const [tab, setTab] = useState("proximos");
  const { partidos: faseMatches, refresh } = usePartidosByFase(selectedFase);
  const { partidos: allMatches } = useAllPartidos(fases);

  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({ local: 0, visitante: 0 });
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const all = allMatches || [];
    const now = Date.now();
    return {
      proximos: all.filter((p) => !p.resultado_ingresado && !isLive(p, now)).length,
      live: all.filter((p) => isLive(p, now)).length,
      final: all.filter((p) => p.resultado_ingresado).length,
    };
  }, [allMatches]);

  useEffect(() => {
    setSelected(null);
  }, [selectedFase, grupo, tab]);

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = selectedFase === "grupos" ? faseMatches.filter((p) => p.grupo === grupo) : faseMatches;
    if (tab === "proximos") list = list.filter((p) => !p.resultado_ingresado && !isLive(p, now));
    else if (tab === "final") list = list.filter((p) => p.resultado_ingresado);
    else if (tab === "live") list = list.filter((p) => isLive(p, now));
    return list.sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
  }, [faseMatches, selectedFase, grupo, tab]);

  const seleccionar = (p) => {
    setSelected(p);
    setDraft({
      local: p.goles_local ?? 0,
      visitante: p.goles_visitante ?? 0,
    });
  };

  const guardar = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await setResultadoPartido(selected.id, draft.local, draft.visitante);
      await refresh();
      setSelected(null);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const eliminarResultado = async () => {
    if (!selected) return;
    if (!confirm(`¿Eliminar el resultado de ${selected.equipo_local} vs ${selected.equipo_visitante}? Se recalcularán los puntos de todas las predicciones.`)) return;
    setBusy(true);
    try {
      await clearResultadoPartido(selected.id);
      await refresh();
      setSelected(null);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Selector fase + grupo */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {fases.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFase(f.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: selectedFase === f.id ? "var(--ink)" : "var(--surface)",
              color: selectedFase === f.id ? "var(--bg)" : "var(--ink-2)",
              border: selectedFase === f.id ? "none" : "0.5px solid var(--line)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {f.nombre}
          </button>
        ))}
      </div>

      {selectedFase === "grupos" && (
        <div className="scroll-hide" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14 }}>
          {GRUPOS.map((g) => (
            <button
              key={g}
              onClick={() => setGrupo(g)}
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: grupo === g ? "var(--ink)" : "var(--surface)",
                color: grupo === g ? "var(--bg)" : "var(--ink-2)",
                border: grupo === g ? "none" : "0.5px solid var(--line)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Tabs estado */}
      <div style={{ display: "flex", gap: 22, borderBottom: "1px solid var(--line)", marginBottom: 18, overflowX: "auto" }} className="scroll-hide">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "tabline" : ""}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              padding: "10px 0",
              color: tab === t.id ? "var(--ink)" : "var(--ink-3)",
              fontWeight: tab === t.id ? 600 : 500,
              fontSize: 14,
              letterSpacing: -0.1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
            <span
              style={{
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: 999,
                background: tab === t.id ? "var(--ink)" : "var(--surface-2)",
                color: tab === t.id ? "var(--bg)" : "var(--ink-3)",
              }}
            >
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      <Card pad={0} style={{ overflow: "hidden", marginBottom: 22 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)" }}>
            {tab === "live" ? "No hay partidos en vivo." : "Sin partidos en esta vista."}
          </div>
        ) : (
          filtered.map((p, i) => (
            <button
              key={p.id}
              onClick={() => seleccionar(p)}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(90px, 130px) 1fr 100px 110px",
                padding: "14px 18px",
                alignItems: "center",
                gap: 12,
                borderBottom: i < filtered.length - 1 ? "0.5px solid var(--line-2)" : "none",
                fontSize: 13,
                background: selected?.id === p.id ? "var(--accent-soft)" : "transparent",
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                color: "var(--ink)",
              }}
            >
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                {formatDate(p.fecha)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Flag code={code(p.equipo_local)} w={22} h={16} />
                  <span style={{ fontWeight: 600 }}>{p.equipo_local}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>vs</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Flag code={code(p.equipo_visitante)} w={22} h={16} />
                  <span style={{ fontWeight: 600 }}>{p.equipo_visitante}</span>
                </div>
              </div>
              <span className="mono" style={{ fontWeight: 600, color: p.resultado_ingresado ? "var(--ink)" : "var(--ink-4)" }}>
                {p.resultado_ingresado ? `${p.goles_local} – ${p.goles_visitante}` : "— · —"}
              </span>
              <div>
                {p.resultado_ingresado ? (
                  <Pill tone="accent">
                    <Icon.Check /> Final
                  </Pill>
                ) : (
                  <Pill tone="outline">Programado</Pill>
                )}
              </div>
            </button>
          ))
        )}
      </Card>

      {/* Card de cargar resultado */}
      {selected && (
        <Card pad={20}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
                {selected.resultado_ingresado ? "Actualizar resultado oficial" : "Cargar resultado oficial"}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                Al guardar se recalculan los puntos de todas las predicciones.
              </div>
            </div>
            <Pill tone="outline">
              {selected.equipo_local} vs {selected.equipo_visitante}
            </Pill>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: "var(--r-lg)",
              background: "var(--surface-2)",
              border: "0.5px solid var(--line)",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 20,
            }}
          >
            <ResultStepper
              flag={code(selected.equipo_local)}
              label={selected.equipo_local}
              value={draft.local}
              onChange={(v) => setDraft((d) => ({ ...d, local: v }))}
            />
            <span className="mono" style={{ fontSize: 14, color: "var(--ink-3)" }}>vs</span>
            <ResultStepper
              flag={code(selected.equipo_visitante)}
              label={selected.equipo_visitante}
              value={draft.visitante}
              onChange={(v) => setDraft((d) => ({ ...d, visitante: v }))}
              right
            />
          </div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon.Lock /> Recalcula puntos automáticamente
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.resultado_ingresado && (
                <Button variant="danger" onClick={eliminarResultado} disabled={busy}>
                  <Icon.Trash /> Eliminar resultado
                </Button>
              )}
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Cancelar
              </Button>
              <Button onClick={guardar} disabled={busy}>
                <Icon.Check /> {busy ? "Guardando…" : "Guardar resultado"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function ResultStepper({ flag, label, value, onChange, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: right ? "row-reverse" : "row" }}>
      <Flag code={flag} w={36} h={26} rounded={4} />
      <div style={{ flex: 1, textAlign: right ? "right" : "left" }}>
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Goles a favor</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--surface)",
          border: "0.5px solid var(--line)",
          borderRadius: 10,
        }}
      >
        <button onClick={() => onChange(Math.max(0, value - 1))} style={qtyBtn}>
          –
        </button>
        <span className="mono" style={{ width: 40, textAlign: "center", fontSize: 20, fontWeight: 600 }}>
          {value}
        </span>
        <button onClick={() => onChange(value + 1)} style={qtyBtn}>
          +
        </button>
      </div>
    </div>
  );
}

const qtyBtn = {
  width: 32,
  height: 36,
  background: "none",
  border: "none",
  color: "var(--ink-2)",
  fontSize: 18,
  fontWeight: 500,
  cursor: "pointer",
};

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}
