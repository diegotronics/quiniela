import { useEffect, useRef, useState } from "react";

const REDUCE_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useCountUp(target, { duration = 700, decimals = 0 } = {}) {
  const safe = Number.isFinite(Number(target)) ? Number(target) : 0;
  const [value, setValue] = useState(REDUCE_MOTION ? safe : 0);
  const fromRef = useRef(REDUCE_MOTION ? safe : 0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (REDUCE_MOTION) {
      setValue(safe);
      fromRef.current = safe;
      return;
    }
    const start = performance.now();
    const from = fromRef.current;
    const delta = safe - from;
    if (delta === 0) return;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + delta * eased;
      setValue(decimals > 0 ? Number(next.toFixed(decimals)) : Math.round(next));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = safe;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [safe, duration, decimals]);

  return value;
}

export function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
