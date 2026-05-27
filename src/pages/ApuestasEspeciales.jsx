import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  useApuestasEspecialesConfig,
  useApuestaEspecialUsuario,
} from "@/hooks/useApuestasEspeciales";
import {
  Avatar,
  Button,
  Card,
  Flag,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
} from "@/components/ui";
import { code, TEAMS_MUNDIAL_2026 } from "@/lib/constants";

export default function ApuestasEspeciales() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { config, loading: loadingCfg } = useApuestasEspecialesConfig();
  const { apuesta, loading: loadingApuesta, guardar } = useApuestaEspecialUsuario(
    user?.id
  );

  const [draft, setDraft] = useState({
    campeon: "",
    subcampeon: "",
    goleador: "",
    sorpresa: "",
  });
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (apuesta) {
      setDraft({
        campeon: apuesta.campeon || "",
        subcampeon: apuesta.subcampeon || "",
        goleador: apuesta.goleador || "",
        sorpresa: apuesta.sorpresa || "",
      });
    }
  }, [apuesta]);

  const cierraEn = config?.cierra_en ? new Date(config.cierra_en) : null;
  const ahora = Date.now();
  const cerrada = cierraEn ? cierraEn.getTime() <= ahora : false;
  const torneoFinalizado = Boolean(
    config?.campeon || config?.subcampeon || config?.goleador || config?.sorpresa
  );

  const dirty = useMemo(() => {
    if (!apuesta) {
      return Boolean(draft.campeon || draft.subcampeon || draft.goleador || draft.sorpresa);
    }
    return (
      (draft.campeon || "") !== (apuesta.campeon || "") ||
      (draft.subcampeon || "") !== (apuesta.subcampeon || "") ||
      (draft.goleador || "") !== (apuesta.goleador || "") ||
      (draft.sorpresa || "") !== (apuesta.sorpresa || "")
    );
  }, [draft, apuesta]);

  const completa =
    draft.campeon &&
    draft.subcampeon &&
    draft.goleador.trim() &&
    draft.sorpresa.trim();

  const onGuardar = async () => {
    if (!dirty || cerrada || busy) return;
    setBusy(true);
    try {
      await guardar({
        campeon: draft.campeon || null,
        subcampeon: draft.subcampeon || null,
        goleador: draft.goleador.trim() || null,
        sorpresa: draft.sorpresa.trim() || null,
      });
      setSavedAt(Date.now());
    } catch (e) {
      alert("Error al guardar: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const loading = loadingCfg || loadingApuesta;

  return (
    <MobileShell
      activeTab="perfil"
      header={
        <MobileHeader
          title="Apuestas especiales"
          subtitle="Pronósticos pre-mundial: Campeón, Sub-campeón, Goleador y Sorpresa"
          leading={<Avatar name={user?.nombre} size={36} />}
        />
      }
    >
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card pad={16}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Cómo funciona
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.45 }}>
                Hacé tus apuestas antes de que arranque el Mundial. Cuando termine el torneo, el admin carga los resultados oficiales y se reparten los puntos.
              </div>
            </div>
            <Pill tone={cerrada ? "coral" : "accent"}>
              {cerrada ? (
                <>
                  <Icon.Lock /> Cerradas
                </>
              ) : (
                <>
                  <Icon.Clock /> Abierto
                </>
              )}
            </Pill>
          </div>
          {cierraEn && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)" }}>
              {cerrada ? "Cierre: " : "Cierra: "}
              <span className="mono" style={{ color: "var(--ink)" }}>
                {formatDate(cierraEn)}
              </span>
            </div>
          )}
        </Card>

        {loading ? (
          <Card pad={20}>
            <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Cargando…</div>
          </Card>
        ) : (
          <>
            {/* Campeón */}
            <PickCard
              kicker="Categoría 1"
              titulo="Campeón del Mundo"
              hint="Equipo que levanta la copa"
              pts={config?.pts_campeon ?? 0}
              resultado={config?.campeon}
              acierto={
                torneoFinalizado &&
                apuesta?.campeon &&
                config?.campeon &&
                norm(apuesta.campeon) === norm(config.campeon)
              }
            >
              <TeamSelect
                value={draft.campeon}
                onChange={(v) => setDraft((d) => ({ ...d, campeon: v }))}
                excluir={draft.subcampeon}
                disabled={cerrada}
                placeholder="Elegí el campeón"
              />
            </PickCard>

            {/* Sub-campeón */}
            <PickCard
              kicker="Categoría 2"
              titulo="Sub-campeón"
              hint="Finalista que pierde la final"
              pts={config?.pts_subcampeon ?? 0}
              resultado={config?.subcampeon}
              acierto={
                torneoFinalizado &&
                apuesta?.subcampeon &&
                config?.subcampeon &&
                norm(apuesta.subcampeon) === norm(config.subcampeon)
              }
            >
              <TeamSelect
                value={draft.subcampeon}
                onChange={(v) => setDraft((d) => ({ ...d, subcampeon: v }))}
                excluir={draft.campeon}
                disabled={cerrada}
                placeholder="Elegí el sub-campeón"
              />
            </PickCard>

            {/* Goleador */}
            <PickCard
              kicker="Categoría 3"
              titulo="Goleador del torneo"
              hint="Jugador que se lleva la Bota de Oro"
              pts={config?.pts_goleador ?? 0}
              resultado={config?.goleador}
              acierto={
                torneoFinalizado &&
                apuesta?.goleador &&
                config?.goleador &&
                norm(apuesta.goleador) === norm(config.goleador)
              }
            >
              <TextField
                value={draft.goleador}
                onChange={(v) => setDraft((d) => ({ ...d, goleador: v }))}
                placeholder="Nombre del jugador"
                disabled={cerrada}
              />
            </PickCard>

            {/* Sorpresa */}
            <PickCard
              kicker="Categoría 4"
              titulo="Sorpresa del Mundial"
              hint="Equipo, jugador o evento inesperado"
              pts={config?.pts_sorpresa ?? 0}
              resultado={config?.sorpresa}
              acierto={
                torneoFinalizado &&
                apuesta?.sorpresa &&
                config?.sorpresa &&
                norm(apuesta.sorpresa) === norm(config.sorpresa)
              }
            >
              <TextField
                value={draft.sorpresa}
                onChange={(v) => setDraft((d) => ({ ...d, sorpresa: v }))}
                placeholder="Ej. Selección X llega a semis"
                disabled={cerrada}
              />
            </PickCard>

            {/* Resumen + acción */}
            <Card pad={16}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
                    Puntos posibles
                  </div>
                  <div className="mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
                    {(config?.pts_campeon ?? 0) +
                      (config?.pts_subcampeon ?? 0) +
                      (config?.pts_goleador ?? 0) +
                      (config?.pts_sorpresa ?? 0)}{" "}
                    <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>pts</span>
                  </div>
                  {torneoFinalizado && apuesta && (
                    <div style={{ marginTop: 4, fontSize: 12, color: "var(--accent-ink)", fontWeight: 600 }}>
                      Obtuviste {apuesta.puntos_obtenidos || 0} pts
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/app/inicio")}
                  >
                    Volver
                  </Button>
                  {!cerrada && (
                    <Button
                      onClick={onGuardar}
                      disabled={!dirty || busy}
                    >
                      <Icon.Check />
                      {busy ? "Guardando…" : "Guardar apuestas"}
                    </Button>
                  )}
                </div>
              </div>
              {!cerrada && !completa && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)" }}>
                  Podés guardar parcialmente y volver más tarde para completar.
                </div>
              )}
              {savedAt && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--accent-ink)", fontWeight: 600 }}>
                  Guardado · {new Date(savedAt).toLocaleTimeString()}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </MobileShell>
  );
}

function PickCard({ kicker, titulo, hint, pts, resultado, acierto, children }) {
  const torneoFinalizado = Boolean(resultado);
  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "0.5px solid var(--line-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
            {kicker}
          </div>
          <div style={{ marginTop: 2, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
            {titulo}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: "var(--ink-3)" }}>{hint}</div>
        </div>
        <Pill tone="accent">+{pts} pts</Pill>
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
      {torneoFinalizado && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: "0.5px dashed var(--line-2)",
            background: acierto ? "var(--accent-soft)" : "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            fontSize: 12,
          }}
        >
          <span style={{ color: "var(--ink-3)" }}>Resultado oficial</span>
          <span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>
            {resultado}
            {acierto && " ✓"}
          </span>
        </div>
      )}
    </Card>
  );
}

function TeamSelect({ value, onChange, excluir, disabled, placeholder }) {
  const opciones = useMemo(
    () => TEAMS_MUNDIAL_2026.filter((t) => t !== excluir),
    [excluir]
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {value && <Flag code={code(value)} w={32} h={22} rounded={4} />}
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 10,
          border: "0.5px solid var(--line)",
          background: "var(--surface-2)",
          fontSize: 14,
          fontWeight: 500,
          color: value ? "var(--ink)" : "var(--ink-3)",
          fontFamily: "var(--font-sans)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <option value="">{placeholder}</option>
        {opciones.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({ value, onChange, placeholder, disabled }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "0.5px solid var(--line)",
        background: "var(--surface-2)",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--ink)",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
        outline: "none",
      }}
    />
  );
}

function norm(s) {
  return (s || "").toString().trim().toLowerCase();
}

function formatDate(d) {
  try {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
