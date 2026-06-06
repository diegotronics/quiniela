import { Avatar, Card, EmptyState, Skeleton } from "@/components/ui";
import { formatearHora } from "@/lib/fechas";
import { usePreviewChat } from "@/hooks/usePreviewChat";

export function ChatPreview({ limit = 3 }) {
  const { mensajes, loading } = usePreviewChat(limit);

  if (loading) {
    return (
      <Card pad={0} style={{ overflow: "hidden" }}>
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 14px",
              borderBottom: i < limit - 1 ? "0.5px solid var(--line-2)" : "none",
            }}
          >
            <Skeleton w={28} h={28} r={999} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton w="45%" h={11} />
              <Skeleton w="80%" h={11} />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (mensajes.length === 0) {
    return (
      <EmptyState
        illustration="chat"
        title="Aún no hay chalequeo"
        description="Sé el primero en escribir."
        compact
      />
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
