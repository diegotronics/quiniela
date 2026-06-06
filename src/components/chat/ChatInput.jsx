import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui";
import { TEXTO_MAX } from "@/api/mensajes";

export function ChatInput({
  value,
  onChange,
  onEnviar,
  placeholder = "Escribe un mensaje…",
  modoEdicion = false,
  onCancelar,
  enviando = false,
  bloqueado = false,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 5 * 22 + 16;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [value]);

  useEffect(() => {
    if (!modoEdicion) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, [modoEdicion]);

  const trimmed = (value || "").trim();
  const tooLong = trimmed.length > TEXTO_MAX;
  const deshabilitado = bloqueado || enviando || trimmed.length === 0 || tooLong;

  function manejarTecla(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!deshabilitado) onEnviar?.();
    } else if (e.key === "Escape" && modoEdicion) {
      e.preventDefault();
      onCancelar?.();
    }
  }

  return (
    <div
      style={{
        background: "var(--bg)",
        borderTop: "0.5px solid var(--line)",
        padding: "10px 12px",
      }}
    >
      {modoEdicion && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 4px 8px",
            fontSize: 11,
            color: "var(--ink-3)",
          }}
        >
          <span>Editando mensaje</span>
          <button
            type="button"
            onClick={onCancelar}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-ink)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 500,
              padding: 0,
            }}
          >
            cancelar
          </button>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          background: "var(--surface)",
          border: "0.5px solid var(--line)",
          borderRadius: 18,
          padding: "8px 8px 8px 14px",
        }}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={manejarTecla}
          placeholder={placeholder}
          rows={1}
          maxLength={TEXTO_MAX}
          disabled={bloqueado}
          style={{
            flex: 1,
            resize: "none",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--ink)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            lineHeight: "22px",
            padding: "4px 0",
            maxHeight: 5 * 22 + 16,
          }}
        />
        <button
          type="button"
          onClick={onEnviar}
          disabled={deshabilitado}
          aria-label={modoEdicion ? "Guardar" : "Enviar"}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: deshabilitado ? "var(--surface-2)" : "var(--ink)",
            color: deshabilitado ? "var(--ink-3)" : "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: deshabilitado ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "background 120ms ease",
          }}
        >
          {modoEdicion ? <Icon.Check /> : <Icon.Send />}
        </button>
      </div>
      {trimmed.length > TEXTO_MAX - 100 && (
        <div
          style={{
            textAlign: "right",
            fontSize: 10,
            color: tooLong ? "var(--danger)" : "var(--ink-3)",
            paddingTop: 4,
            paddingRight: 4,
          }}
          className="mono"
        >
          {trimmed.length}/{TEXTO_MAX}
        </div>
      )}
    </div>
  );
}
