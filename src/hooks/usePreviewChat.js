import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { obtenerMensaje } from "@/api/mensajes";

// Versión ligera para el preview de Inicio: trae los últimos N mensajes
// del chat global y se suscribe SOLO a INSERTs. No expone acciones.
export function usePreviewChat(limit = 3) {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const limitRef = useRef(limit);
  limitRef.current = limit;

  useEffect(() => {
    let cancel = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("mensajes")
        .select(
          "id, usuario_id, partido_id, texto, created_at, editado, usuario:usuarios(id, nombre, avatar, color)"
        )
        .is("partido_id", null)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (cancel) return;
      if (error) {
        setMensajes([]);
      } else {
        setMensajes((data || []).slice().reverse());
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("preview-chat-global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensajes", filter: "partido_id=is.null" },
        async (payload) => {
          const id = payload.new?.id;
          if (!id) return;
          try {
            const completo = await obtenerMensaje(id);
            if (!completo) return;
            setMensajes((prev) => {
              const sinDup = prev.filter((m) => m.id !== completo.id);
              const next = [...sinDup, completo].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
              );
              return next.slice(-limitRef.current);
            });
          } catch {
            // Silencioso
          }
        },
      )
      .subscribe();

    return () => {
      cancel = true;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { mensajes, loading };
}
