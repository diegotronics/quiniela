import { listFases } from "@/api/fases";
import { useAsync } from "./useAsync";

export function useFases() {
  const { data, loading, error, refresh } = useAsync(listFases, []);
  return { fases: data || [], loading, error, refresh };
}
