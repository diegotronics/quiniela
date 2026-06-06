import { useCallback, useEffect, useRef, useState } from "react";

// Sugerencia de instalación como app (PWA).
//
// En Android/Chrome capturamos el evento nativo `beforeinstallprompt` para
// ofrecer un botón "Instalar". En iOS (Safari) no existe ese evento, así que
// mostramos instrucciones para añadir la app a la pantalla de inicio.
//
// Solo se ofrece en celulares, cuando la app aún no está instalada y si el
// usuario no la ha descartado recientemente.

const DISMISS_KEY = "lcf-install-dismissed";
const DISMISS_DAYS = 14; // se vuelve a ofrecer pasadas dos semanas

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.navigator.standalone === true // iOS
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iPhoneLike = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ se reporta como Mac con pantalla táctil.
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iPhoneLike || iPadOS;
}

function isSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /safari/i.test(ua) && !/crios|fxios|edgios|chrome|android/i.test(ua);
}

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");
}

function dismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function useInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null); // "android" | "ios"
  const deferredRef = useRef(null);

  useEffect(() => {
    if (isStandalone() || dismissedRecently() || !isMobile()) return undefined;

    function onBeforeInstall(e) {
      // Evitamos el mini-infobar de Chrome y mostramos nuestra sugerencia.
      e.preventDefault();
      deferredRef.current = e;
      setPlatform("android");
      setVisible(true);
    }

    function onInstalled() {
      deferredRef.current = null;
      setVisible(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari: sin evento nativo, mostramos instrucciones tras un instante
    // para no competir con la carga inicial.
    let iosTimer;
    if (isIOS() && isSafari()) {
      iosTimer = window.setTimeout(() => {
        setPlatform("ios");
        setVisible(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const remember = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // sin persistencia disponible; no es crítico
    }
  }, []);

  const dismiss = useCallback(() => {
    remember();
    setVisible(false);
  }, [remember]);

  const promptInstall = useCallback(async () => {
    const evt = deferredRef.current;
    if (!evt) return;
    evt.prompt();
    try {
      await evt.userChoice;
    } catch {
      // el usuario cerró el diálogo; igual lo recordamos
    }
    deferredRef.current = null;
    remember();
    setVisible(false);
  }, [remember]);

  return { visible, platform, promptInstall, dismiss };
}
