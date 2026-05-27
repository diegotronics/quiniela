import { useCallback } from "react";
import { listPartidosByFase } from "@/api/partidos";
import { useAsync } from "./useAsync";

export function usePartidosByFase(faseId) {
  const fetcher = useCallback(
    () => (faseId ? listPartidosByFase(faseId) : Promise.resolve([])),
    [faseId]
  );
  const { data, loading, error, refresh, setData } = useAsync(fetcher, [faseId]);
  return { partidos: data || [], loading, error, refresh, setPartidos: setData };
}
