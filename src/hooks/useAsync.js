import { useCallback, useEffect, useRef, useState } from "react";

// Hook base para llamadas async con cancelación segura y refresh manual.
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fnRef.current()
      .then(result => { if (!cancel) { setData(result); setError(null); } })
      .catch(e => { if (!cancel) setError(e); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refresh: run, setData };
}
