import { useEffect, useRef } from "react";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "😢", "⚽"];

export function EmojiPicker({ onSelect, onClose, anclaDerecha = false }) {
  const ref = useRef(null);

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

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        [anclaDerecha ? "right" : "left"]: 0,
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
