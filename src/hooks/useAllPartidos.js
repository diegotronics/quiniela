import { useCallback } from "react";
import { listPartidosByFase } from "@/api/partidos";
import { useAsync } from "./useAsync";

export function useAllPartidos(fases) {
  const faseIds = (fases || []).map((f) => f.id).join(",");
  const fetcher = useCallback(async () => {
    if (!fases || fases.length === 0) return [];
    const all = await Promise.all(fases.map((f) => listPartidosByFase(f.id)));
    return all.flat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faseIds]);
  const { data, loading, error, refresh } = useAsync(fetcher, [faseIds]);
  return { partidos: data || [], loading, error, refresh };
}
