import { useCallback } from "react";
import {
  getApuestasEspecialesConfig,
  getApuestaEspecialUsuario,
  listApuestasEspecialesGrupo,
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

// Apuestas de todos los miembros, para la vista pública de transparencia.
// `enabled` debe ser el estado de cierre: mientras se puede editar no se piden
// los picks ajenos, así la app no los expone antes de tiempo.
export function useApuestasEspecialesGrupo(enabled) {
  const fetcher = useCallback(
    () => (enabled ? listApuestasEspecialesGrupo() : Promise.resolve([])),
    [enabled]
  );
  const { data, loading, error } = useAsync(fetcher, [enabled]);
  return { apuestas: data || [], loading, error };
}

export { updateApuestasEspecialesConfig };
