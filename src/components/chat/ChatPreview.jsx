import { Avatar, Card } from "@/components/ui";
import { formatearHora } from "@/lib/fechas";
import { usePreviewChat } from "@/hooks/usePreviewChat";

export function ChatPreview({ limit = 3 }) {
  const { mensajes, loading } = usePreviewChat(limit);

  if (loading) {
    return (
      <Card pad={14}>
        <div style={{ color: "var(--ink-3)", fontSize: 13, textAlign: "center" }}>
          Cargando picadas…
        </div>
      </Card>
    );
  }

  if (mensajes.length === 0) {
    return (
      <Card pad={14}>
        <div style={{ color: "var(--ink-3)", fontSize: 13, textAlign: "center" }}>
          Aún no hay picadas. Inicia la conversación.
        </div>
      </Card>
    );
  }

  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      {mensajes.map((m, i) => {
        const nombre = m.usuario?.nombre || "Anónimo";
        return (
          <div
            key={m.id}
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 14px",
              borderBottom: i < mensajes.length - 1 ? "0.5px solid var(--line-2)" : "none",
            }}
          >
            <Avatar name={nombre} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {nombre}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-3)", flexShrink: 0 }} className="mono">
                  {formatearHora(m.created_at)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--ink-2)",
                  marginTop: 2,
                  lineHeight: 1.35,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {m.texto}
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
