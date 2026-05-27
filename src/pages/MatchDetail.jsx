import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPartidosByFase } from "@/api/partidos";
import { listPrediccionesByUsuario } from "@/api/predicciones";
import { supabase } from "@/lib/supabase";
import {
  Avatar,
  Card,
  Flag,
  Icon,
  Pill,
  ScoreStepper,
} from "@/components/ui";
import { code } from "@/lib/constants";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fases } = useFases();
  const { usuarios } = useUsuariosPublic();
  const { predicciones, setPrediccion } = usePrediccionesUsuario(user?.id);

  // Cargar el partido específico
  const { data: partido, loading: loadingPartido, refresh: refreshPartido } = useAsync(
    async () => {
      const { data, error } = await supabase
        .from("partidos")
        .select(
          "id, fase_id, grupo, equipo_local, equipo_visitante, fecha, goles_local, goles_visitante, resultado_ingresado",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    [id],
  );

  // Predicciones de TODA la familia para este partido
  const { data: picksFamilia } = useAsync(
    async () => {
      const { data, error } = await supabase
        .from("predicciones")
        .select("usuario_id, goles_local, goles_visitante, puntos_obtenidos")
        .eq("partido_id", id);
      if (error) throw error;
      return data || [];
    },
    [id],
  );

  const fase = useMemo(() => fases.find((f) => f.id === partido?.fase_id), [fases, partido]);
  const locked = !fase || fase.estado !== "activa" || partido?.resultado_ingresado;

  const myPred = predicciones[id];
  const [draft, setDraft] = useState({ local: null, visitante: null });
  useEffect(() => {
    setDraft({
      local: myPred?.goles_local ?? null,
      visitante: myPred?.goles_visitante ?? null,
    });
  }, [myPred?.goles_local, myPred?.goles_visitante]);

  const [saving, setSaving] = useState(false);
  const guardar = async () => {
    if (draft.local == null || draft.visitante == null) return;
    setSaving(true);
    try {
      await setPrediccion(id, "goles_local", draft.local);
      await setPrediccion(id, "goles_visitante", draft.visitante);
    } finally {
      setSaving(false);
    }
  };

  const [tab, setTab] = useState("familia");

  if (loadingPartido) {
    return (
      <Centered>
        <p style={{ color: "var(--ink-3)" }}>Cargando partido…</p>
      </Centered>
    );
  }
  if (!partido) {
    return (
      <Centered>
        <p style={{ color: "var(--ink-3)" }}>Partido no encontrado.</p>
        <button
          onClick={() => navigate("/app/partidos")}
          style={{ marginTop: 12, background: "var(--ink)", color: "var(--bg)", padding: "10px 16px", border: "none", borderRadius: 10, fontWeight: 600 }}
        >
          Volver
        </button>
      </Centered>
    );
  }

  const isFinal = partido.resultado_ingresado;
  const picksByUser = new Map((picksFamilia || []).map((p) => [p.usuario_id, p]));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: locked ? 60 : 140 }}>
      {/* Header oscuro */}
      <div style={{ background: "var(--ink)", color: "var(--bg)", paddingTop: 24, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 14px" }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            style={{ width: 36, height: 36, background: "transparent", border: "none", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Icon.ChevronL />
          </button>
          <span style={{ fontSize: 13, color: "oklch(0.75 0.02 60)" }}>
            {fase?.nombre || "Partido"}{partido.grupo ? ` · Grupo ${partido.grupo}` : ""}
          </span>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, padding: "8px 16px" }}>
          <div style={{ textAlign: "center" }}>
            <Flag code={code(partido.equipo_local)} w={56} h={40} rounded={6} />
            <div style={{ marginTop: 8, fontWeight: 600, fontSize: 15, letterSpacing: -0.1 }}>{partido.equipo_local}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            {isFinal ? (
              <>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    color: "var(--bg)",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  Finalizado
                </div>
                <span className="mono" style={{ fontSize: 44, fontWeight: 600, letterSpacing: -2, color: "var(--bg)", lineHeight: 1 }}>
                  {partido.goles_local} – {partido.goles_visitante}
                </span>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, color: "oklch(0.75 0.02 60)", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>
                  vs
                </div>
                <span className="mono" style={{ fontSize: 18, color: "oklch(0.75 0.02 60)" }}>
                  {formatDateTime(partido.fecha)}
                </span>
              </>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <Flag code={code(partido.equipo_visitante)} w={56} h={40} rounded={6} />
            <div style={{ marginTop: 8, fontWeight: 600, fontSize: 15, letterSpacing: -0.1 }}>{partido.equipo_visitante}</div>
          </div>
        </div>
      </div>

      {/* Mi pronóstico / Editor */}
      <div style={{ padding: "14px 20px 0" }}>
        <Card pad={14}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>
              Tu pronóstico {locked ? "(bloqueado)" : ""}
            </div>
            {locked ? (
              <Pill tone="default" size="sm">
                <Icon.Lock /> {isFinal ? "Finalizado" : "Bloqueado"}
              </Pill>
            ) : (
              <Pill tone="accent" size="sm">Editable</Pill>
            )}
          </div>

          {locked ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                {myPred?.goles_local != null
                  ? `${myPred.goles_local} – ${myPred.goles_visitante}`
                  : "Sin pronóstico"}
              </span>
              {isFinal && myPred?.puntos_obtenidos != null && (
                <span style={{ fontSize: 12, color: myPred.puntos_obtenidos > 0 ? "var(--accent-ink)" : "var(--ink-3)", fontWeight: 600 }}>
                  {myPred.puntos_obtenidos > 0 ? `+${myPred.puntos_obtenidos} pts` : "0 pts"}
                </span>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  background: "var(--surface-2)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <ScoreStepper
                  label={partido.equipo_local}
                  value={draft.local}
                  onChange={(v) => setDraft((d) => ({ ...d, local: v }))}
                />
                <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-3)" }}>–</span>
                <ScoreStepper
                  label={partido.equipo_visitante}
                  value={draft.visitante}
                  onChange={(v) => setDraft((d) => ({ ...d, visitante: v }))}
                />
              </div>
              <button
                onClick={guardar}
                disabled={saving || draft.local == null || draft.visitante == null}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px 16px",
                  background: "var(--ink)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: "var(--r-md)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  opacity: saving || draft.local == null || draft.visitante == null ? 0.6 : 1,
                }}
              >
                {saving ? "Guardando…" : "Guardar pronóstico"}
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", gap: 18, borderBottom: "1px solid var(--line)" }}>
          {[
            ["familia", "Pronósticos familia"],
            ["picadas", "Picadas"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={tab === k ? "tabline" : ""}
              style={{
                background: "none",
                border: "none",
                padding: "10px 0",
                color: tab === k ? "var(--ink)" : "var(--ink-3)",
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

      <div style={{ padding: "14px 20px 24px" }}>
        {tab === "familia" ? (
          <FamilyPicks usuarios={usuarios} picksByUser={picksByUser} mePartial={user?.id} />
        ) : (
          <ChatPanel partidoId={id} altura="60vh" />
        )}
      </div>
    </div>
  );
}

function FamilyPicks({ usuarios, picksByUser, mePartial }) {
  const players = (usuarios || []).filter((u) => !u.es_admin);
  if (players.length === 0) {
    return <p style={{ color: "var(--ink-3)", textAlign: "center" }}>Sin participantes.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, color: "var(--ink-3)", padding: "0 4px 4px" }}>
        {picksByUser.size} de {players.length} pronosticaron
      </div>
      {players.map((p) => {
        const pick = picksByUser.get(p.id);
        const isMe = p.id === mePartial;
        return (
          <Card
            key={p.id}
            pad={12}
            style={{
              background: isMe ? "var(--accent-soft)" : "var(--surface)",
              borderColor: isMe ? "transparent" : "var(--line)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={p.nombre} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{p.nombre}</span>
                  {isMe && <Pill tone="accent" size="sm">Vos</Pill>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {pick?.goles_local != null ? (
                  <>
                    <span className="mono" style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
                      {pick.goles_local} – {pick.goles_visitante}
                    </span>
                    {pick.puntos_obtenidos != null && pick.puntos_obtenidos > 0 && (
                      <div style={{ fontSize: 11, color: "var(--accent-ink)", fontWeight: 600 }}>
                        +{pick.puntos_obtenidos} pts
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Sin pick</span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Centered({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      {children}
    </div>
  );
}

function formatDateTime(iso) {
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
