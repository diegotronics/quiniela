import { useCallback, useState } from "react";
import { listPrediccionesByUsuario, upsertPrediccion } from "@/api/predicciones";
import { useAsync } from "./useAsync";

// Devuelve un mapa partido_id → prediccion, y un saver que hace upsert optimista.
export function usePrediccionesUsuario(usuarioId) {
  const fetcher = useCallback(async () => {
    if (!usuarioId) return {};
    const lista = await listPrediccionesByUsuario(usuarioId);
    return Object.fromEntries(lista.map(p => [p.partido_id, p]));
  }, [usuarioId]);

  const { data, loading, error, refresh, setData } = useAsync(fetcher, [usuarioId]);
  const predicciones = data || {};

  const [savingIds, setSavingIds] = useState(new Set());

  const setPrediccion = useCallback(async (partido_id, field, value) => {
    if (!usuarioId) return;
    const prev = predicciones[partido_id] || {};
    const next = { ...prev, [field]: value };

    setData(current => ({ ...(current || {}), [partido_id]: next }));

    if (next.goles_local == null || next.goles_visitante == null) return;

    setSavingIds(s => new Set(s).add(partido_id));
    try {
      const saved = await upsertPrediccion({
        usuario_id: usuarioId,
        partido_id,
        goles_local: next.goles_local,
        goles_visitante: next.goles_visitante,
      });
      setData(current => ({ ...(current || {}), [partido_id]: saved }));
    } catch (e) {
      setData(current => ({ ...(current || {}), [partido_id]: prev }));
      throw e;
    } finally {
      setSavingIds(s => {
        const n = new Set(s);
        n.delete(partido_id);
        return n;
      });
    }
  }, [usuarioId, predicciones, setData]);

  return { predicciones, loading, error, refresh, setPrediccion, savingIds };
}
