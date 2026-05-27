import { listUsuariosAdmin, listUsuariosPublic } from "@/api/usuarios";
import { useAsync } from "./useAsync";

export function useUsuariosPublic() {
  const { data, loading, error, refresh } = useAsync(listUsuariosPublic, []);
  return { usuarios: data || [], loading, error, refresh };
}

export function useUsuariosAdmin() {
  const { data, loading, error, refresh } = useAsync(listUsuariosAdmin, []);
  return { usuarios: data || [], loading, error, refresh };
}
