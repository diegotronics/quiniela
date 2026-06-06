import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { obtenerMensaje } from "@/api/mensajes";

const COLS =
  "id, usuario_id, partido_id, texto, created_at, editado, usuario:usuarios(id, nombre, avatar, color)";

// Versión ligera para el preview de Inicio: trae los últimos N mensajes
// del chat global y se mantiene en sincronía con INSERT, UPDATE y DELETE.
// No expone acciones (solo lectura).
export function usePreviewChat(limit = 3) {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const limitRef = useRef(limit);
  limitRef.current = limit;
  // Set de ids visibles: el WAL de DELETE solo trae la PK, así que filtramos
  // en cliente igual que en useChat.
  const idsRef = useRef(new Set());

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from("mensajes")
      .select(COLS)
      .is("partido_id", null)
      .order("created_at", { ascending: false })
      .limit(limitRef.current);
    if (error) return { ok: false, data: [] };
    return { ok: true, data: (data || []).slice().reverse() };
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);

    cargar().then(({ data }) => {
      if (cancel) return;
      setMensajes(data);
      idsRef.current = new Set(data.map((m) => m.id));
      setLoading(false);
    });

    const recargar = async () => {
      const { ok, data } = await cargar();
      if (cancel || !ok) return;
      setMensajes(data);
      idsRef.current = new Set(data.map((m) => m.id));
    };

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
              const recortado = next.slice(-limitRef.current);
              idsRef.current = new Set(recortado.map((m) => m.id));
              return recortado;
            });
          } catch {
            // Silencioso
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mensajes", filter: "partido_id=is.null" },
        (payload) => {
          const nuevo = payload.new;
          if (!nuevo?.id) return;
          setMensajes((prev) =>
            prev.map((m) =>
              m.id === nuevo.id
                ? { ...m, texto: nuevo.texto, editado: nuevo.editado }
                : m
            )
          );
        },
      )
      .on(
        // DELETE: el WAL solo trae la PK; recibimos todos y descartamos en
        // cliente. Si el borrado afecta un mensaje visible, recargamos para
        // rellenar el hueco con el siguiente más reciente.
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "mensajes" },
        (payload) => {
          const id = payload.old?.id;
          if (!id || !idsRef.current.has(id)) return;
          recargar();
        },
      )
      .subscribe();

    return () => {
      cancel = true;
      supabase.removeChannel(channel);
    };
  }, [cargar, limit]);

  return { mensajes, loading };
}
