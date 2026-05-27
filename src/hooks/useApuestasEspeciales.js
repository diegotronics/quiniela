import { useCallback } from "react";
import {
  getApuestasEspecialesConfig,
  getApuestaEspecialUsuario,
  upsertApuestaEspecial,
  updateApuestasEspecialesConfig,
} from "@/api/apuestasEspeciales";
import { useAsync } from "./useAsync";

export function useApuestasEspecialesConfig() {
  const { data, loading, error, refresh } = useAsync(getApuestasEspecialesConfig, []);
  return { config: data, loading, error, refresh };
}

export function useApuestaEspecialUsuario(usuarioId) {
  const fetcher = useCallback(
    () => (usuarioId ? getApuestaEspecialUsuario(usuarioId) : Promise.resolve(null)),
    [usuarioId]
  );
  const { data, loading, error, refresh, setData } = useAsync(fetcher, [usuarioId]);

  const guardar = useCallback(
    async (patch) => {
      if (!usuarioId) return null;
      const merged = {
        usuario_id: usuarioId,
        campeon: data?.campeon ?? null,
        subcampeon: data?.subcampeon ?? null,
        goleador: data?.goleador ?? null,
        sorpresa: data?.sorpresa ?? null,
        ...patch,
      };
      const saved = await upsertApuestaEspecial(merged);
      setData(saved);
      return saved;
    },
    [usuarioId, data, setData]
  );

  return { apuesta: data, loading, error, refresh, guardar };
}

export { updateApuestasEspecialesConfig };
