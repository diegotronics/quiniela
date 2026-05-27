import { useEffect, useState } from "react";

function computeRemaining(target) {
  if (!target) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const total = target - Date.now();
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);
  return { total, days, hours, minutes, seconds, expired: false };
}

export function useCountdown(targetIso) {
  const target = targetIso ? new Date(targetIso).getTime() : null;
  const [remaining, setRemaining] = useState(() => computeRemaining(target));

  useEffect(() => {
    if (!target) {
      setRemaining({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      return;
    }
    setRemaining(computeRemaining(target));
    const id = setInterval(() => {
      setRemaining(computeRemaining(target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}
