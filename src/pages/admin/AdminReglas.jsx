import { useState } from "react";
import { updateFaseEstado } from "@/api/fases";
import { useFases } from "@/hooks/useFases";
import { Card, Flag, Icon, Pill } from "@/components/ui";
import { FASES_INFO, code } from "@/lib/constants";

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
              Activá la fase para que la familia pueda enviar pronósticos. Bloqueala para ocultarla.
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

        {/* Puntos por fase (solo lectura) */}
        <Card pad={0}>
          <div style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--line-2)" }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>Puntos por fase</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
              Cuánto otorga cada acierto. Por ahora solo lectura · UI editable próximamente.
            </div>
          </div>
          <div>
            {fases.map((f, i) => (
              <RuleRow
                key={f.id}
                label={f.nombre}
                hint={FASES_INFO[f.id] || ""}
                exacto={f.pts_exacto}
                ganador={f.pts_ganador}
                last={i === fases.length - 1}
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

        <Card pad={16}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Apuestas especiales</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            Predicciones pre-mundial · próximamente.
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, opacity: 0.6 }}>
            <SpecialRow label="Campeón" pts={15} />
            <SpecialRow label="Sub-campeón" pts={8} />
            <SpecialRow label="Goleador" pts={10} />
            <SpecialRow label="Sorpresa" pts={6} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function RuleRow({ label, hint, exacto, ganador, last }) {
  const max = 15;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 240px",
        gap: 16,
        padding: "14px 18px",
        borderBottom: last ? "none" : "0.5px solid var(--line-2)",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{label}</div>
        {hint && (
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>{hint}</div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: "var(--line)", borderRadius: 4, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${(exacto / max) * 100}%`,
              background: "var(--accent)",
              borderRadius: 4,
            }}
          />
        </div>
        <div
          style={{
            width: 88,
            padding: "5px 8px",
            borderRadius: 8,
            background: "var(--surface-2)",
            border: "0.5px solid var(--line)",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: 12,
            color: "var(--ink)",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {exacto} / {ganador}
        </div>
      </div>
    </div>
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

function SpecialRow({ label, pts }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        borderRadius: 10,
        background: "var(--surface-2)",
        border: "0.5px solid var(--line)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--ink)" }}>{label}</span>
      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-ink)" }}>
        +{pts} pts
      </span>
    </div>
  );
}
