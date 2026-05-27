import { useEffect, useLayoutEffect, useRef, useState } from "react";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "😢", "⚽"];

const MARGEN = 8;

export function EmojiPicker({ onSelect, onClose, anclaDerecha = false }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ vertical: "arriba", horizontal: anclaDerecha ? "derecha" : "izquierda" });

  useEffect(() => {
    function manejarClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    }
    function manejarTecla(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("mousedown", manejarClick);
    document.addEventListener("keydown", manejarTecla);
    return () => {
      document.removeEventListener("mousedown", manejarClick);
      document.removeEventListener("keydown", manejarTecla);
    };
  }, [onClose]);

  // Ajuste de borde: si se sale del viewport, voltea de lado correspondiente.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vertical = rect.top < MARGEN ? "abajo" : "arriba";
    let horizontal = anclaDerecha ? "derecha" : "izquierda";
    if (horizontal === "izquierda" && rect.right > window.innerWidth - MARGEN) {
      horizontal = "derecha";
    } else if (horizontal === "derecha" && rect.left < MARGEN) {
      horizontal = "izquierda";
    }
    setPos((prev) =>
      prev.vertical === vertical && prev.horizontal === horizontal ? prev : { vertical, horizontal }
    );
  }, [anclaDerecha]);

  const verticalCss = pos.vertical === "arriba"
    ? { bottom: "calc(100% + 6px)" }
    : { top: "calc(100% + 6px)" };
  const horizontalCss = pos.horizontal === "derecha"
    ? { right: 0 }
    : { left: 0 };

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "absolute",
        ...verticalCss,
        ...horizontalCss,
        zIndex: 30,
        background: "var(--surface)",
        border: "0.5px solid var(--line)",
        borderRadius: 12,
        padding: 8,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 4,
        boxShadow: "var(--shadow-3)",
      }}
    >
      {EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => { onSelect?.(e); onClose?.(); }}
          aria-label={`Reaccionar con ${e}`}
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            fontSize: 20,
            cursor: "pointer",
          }}
          onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--surface-2)")}
          onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
