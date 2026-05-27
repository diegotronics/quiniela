import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import {
  Avatar,
  Card,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
} from "@/components/ui";
import { rankingFromUsers } from "@/lib/stats";
import { GROUP_NAME } from "@/lib/constants";

export default function TablaFamiliar() {
  const { user } = useAuth();
  const { usuarios } = useUsuariosPublic();
  const { data: puntajes, loading } = useAsync(listPuntajesGlobales, []);

  const ranking = useMemo(
    () => rankingFromUsers(usuarios, puntajes || []),
    [usuarios, puntajes],
  );
  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  return (
    <MobileShell
      activeTab="tabla"
      header={
        <MobileHeader
          title="Tabla familiar"
          subtitle={`${GROUP_NAME} · ${ranking.length} jugador${ranking.length === 1 ? "" : "es"}`}
          leading={<Avatar name={user?.nombre} size={36} />}
        />
      }
    >
      {/* Filtros (Total funcional, resto deshabilitado) */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["Total", true],
            ["Semana", false],
            ["Eliminatorias", false],
            ["Grupos", false],
          ].map(([label, on]) => (
            <button
              key={label}
              disabled={!on}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 10,
                background: on ? "var(--ink)" : "var(--surface)",
                color: on ? "var(--bg)" : "var(--ink-4)",
                border: on ? "none" : "0.5px solid var(--line)",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: -0.1,
                cursor: on ? "pointer" : "not-allowed",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p style={{ padding: "0 20px", textAlign: "center", color: "var(--ink-3)" }}>Cargando…</p>
      )}

      {/* Podio */}
      {top3.length > 0 && (
        <div style={{ padding: "0 20px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 8, alignItems: "end" }}>
            <PodiumCard place={2} member={top3[1]} me={user?.id} />
            <PodiumCard place={1} member={top3[0]} me={user?.id} center />
            <PodiumCard place={3} member={top3[2]} me={user?.id} />
          </div>
        </div>
      )}

      {/* Resto */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        <SectionTitle action={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon.Filter /> Filtrar
          </span>
        }>
          Posiciones
        </SectionTitle>
        {resto.map((m) => (
          <LeaderRow key={m.id} member={m} me={m.id === user?.id} />
        ))}
        {resto.length === 0 && top3.length === 0 && !loading && (
          <Card>
            <p style={{ margin: 0, textAlign: "center", color: "var(--ink-3)" }}>
              Aún no hay jugadores en la tabla.
            </p>
          </Card>
        )}
      </div>
    </MobileShell>
  );
}

function PodiumCard({ place, member, center, me }) {
  if (!member) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--line)",
          borderRadius: "var(--r-lg)",
          padding: center ? "18px 10px 16px" : "14px 8px 12px",
          textAlign: "center",
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: center ? 52 : 44,
            height: center ? 52 : 44,
            borderRadius: "50%",
            background: "var(--line)",
            margin: "0 auto",
          }}
        />
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>—</div>
      </div>
    );
  }
  const isMe = me === member.id;
  const ringColor = place === 1 ? "var(--gold)" : place === 2 ? "oklch(0.78 0.02 80)" : "oklch(0.65 0.06 30)";
  return (
    <div
      style={{
        background: "var(--surface)",
        border: isMe ? "1.5px solid var(--accent)" : "0.5px solid var(--line)",
        borderRadius: "var(--r-lg)",
        padding: center ? "18px 10px 16px" : "14px 8px 12px",
        textAlign: "center",
        position: "relative",
        boxShadow: center ? "var(--shadow-2)" : "var(--shadow-1)",
      }}
    >
      {place === 1 && (
        <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", color: "var(--gold)" }}>
          <Icon.Crown />
        </div>
      )}
      <div style={{ position: "relative", display: "inline-block" }}>
        <Avatar name={member.nombre} size={center ? 52 : 44} />
        <div
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: ringColor,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--surface)",
          }}
        >
          {place}
        </div>
      </div>
      <div style={{ marginTop: 8, fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
        {(member.nombre || "").split(" ")[0]}
      </div>
      <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{isMe ? "vos" : ""}</div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
        <span className="mono" style={{ fontSize: center ? 22 : 18, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
          {member.puntos}
        </span>
        <span style={{ fontSize: 10, color: "var(--ink-3)" }}>pts</span>
      </div>
    </div>
  );
}

function LeaderRow({ member, me }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: me ? "var(--accent-soft)" : "var(--surface)",
        border: me
          ? "1px solid color-mix(in oklab, var(--accent) 30%, transparent)"
          : "0.5px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: "10px 12px",
      }}
    >
      <span className="mono" style={{ width: 22, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--ink-3)" }}>
        {member.rank}
      </span>
      <Avatar name={member.nombre} size={32} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
          {member.nombre}
          {me && <span style={{ fontWeight: 400, color: "var(--ink-3)" }}> · vos</span>}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", display: "flex", gap: 8 }}>
          {member.pagado === false && (
            <span style={{ color: "var(--coral)" }}>Pago pendiente</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.3 }}>
          {member.puntos}
        </span>
        <div style={{ fontSize: 10, color: "var(--ink-3)" }}>pts</div>
      </div>
    </div>
  );
}
