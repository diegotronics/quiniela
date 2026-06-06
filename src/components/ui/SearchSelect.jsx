import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flag } from "./Flag.jsx";
import { Icon } from "./Icon.jsx";

// Combobox con buscador para listas largas (p. ej. la nómina del Mundial).
//
// El panel desplegable se renderiza en un portal con posición fija anclada al
// botón. Así escapa del "overflow: hidden" de la tarjeta contenedora (PickCard),
// que en móvil recortaba la lista y no dejaba elegir bien.
//
// Props:
//   - value: valor seleccionado (string) o "".
//   - onChange(value): callback al elegir/limpiar.
//   - options: array de { value, label, sublabel?, code? }.
//       · value: lo que se guarda.
//       · label: texto principal visible.
//       · sublabel: texto secundario (p. ej. la selección del jugador).
//       · code: código ISO-3 para mostrar la bandera (opcional).
//   - placeholder: texto cuando no hay selección.
//   - searchPlaceholder: texto del campo de búsqueda.
//   - disabled: deshabilita el control.
//   - emptyLabel: texto cuando la búsqueda no arroja resultados.

function normalize(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  searchPlaceholder = "Buscar…",
  disabled = false,
  emptyLabel = "Sin resultados",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value],
  );

  const filtradas = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return options.slice(0, 80);
    return options
      .filter(
        (o) =>
          normalize(o.label).includes(q) || normalize(o.sublabel).includes(q),
      )
      .slice(0, 80);
  }, [options, query]);

  // Calcula la posición del panel respecto al botón y decide si abre hacia
  // abajo o hacia arriba según el espacio disponible en la ventana.
  const recolocar = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margen = 8;
    const espacioAbajo = window.innerHeight - r.bottom - margen;
    const espacioArriba = r.top - margen;
    const abrirArriba = espacioAbajo < 200 && espacioArriba > espacioAbajo;
    const maxHeight = Math.max(
      160,
      Math.min(360, (abrirArriba ? espacioArriba : espacioAbajo)),
    );
    setPos({
      left: r.left,
      width: r.width,
      maxHeight,
      ...(abrirArriba
        ? { bottom: window.innerHeight - r.top + 6 }
        : { top: r.bottom + 6 }),
    });
  }, []);

  // Recolocar al abrir y al hacer scroll/resize mientras está abierto.
  useLayoutEffect(() => {
    if (!open) return undefined;
    recolocar();
    const onScroll = () => recolocar();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, recolocar]);

  // Cerrar al hacer clic fuera (considerando que el panel vive en un portal).
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      const dentroBoton = rootRef.current && rootRef.current.contains(e.target);
      const dentroPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!dentroBoton && !dentroPanel) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Enfocar el buscador al abrir.
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const abrir = () => {
    if (disabled) return;
    setQuery("");
    setOpen((v) => !v);
  };

  const elegir = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const limpiar = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={abrir}
        disabled={disabled}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          border: "0.5px solid var(--line)",
          background: "var(--surface-2)",
          fontSize: 14,
          fontWeight: 500,
          color: selected ? "var(--ink)" : "var(--ink-3)",
          fontFamily: "var(--font-sans)",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          boxSizing: "border-box",
          outline: "none",
        }}
      >
        {selected?.code && (
          <Flag code={selected.code} w={28} h={20} rounded={4} />
        )}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selected ? selected.label : placeholder}
          {selected?.sublabel && (
            <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>
              {" · "}
              {selected.sublabel}
            </span>
          )}
        </span>
        {selected && !disabled ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={limpiar}
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "var(--ink-3)",
              padding: 2,
            }}
            aria-label="Quitar selección"
          >
            <Icon.X size={16} />
          </span>
        ) : (
          <Icon.ChevronD size={16} style={{ color: "var(--ink-3)" }} />
        )}
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              zIndex: 1000,
              left: pos.left,
              width: pos.width,
              ...(pos.top != null ? { top: pos.top } : { bottom: pos.bottom }),
              display: "flex",
              flexDirection: "column",
              maxHeight: pos.maxHeight,
              background: "var(--surface)",
              border: "0.5px solid var(--line)",
              borderRadius: 12,
              boxShadow: "0 12px 32px rgba(20,17,13,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderBottom: "0.5px solid var(--line-2)",
                flexShrink: 0,
              }}
            >
              <Icon.Search size={16} style={{ color: "var(--ink-3)" }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: "var(--ink)",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {filtradas.length === 0 ? (
                <div
                  style={{
                    padding: "16px 12px",
                    fontSize: 13,
                    color: "var(--ink-3)",
                    textAlign: "center",
                  }}
                >
                  {emptyLabel}
                </div>
              ) : (
                filtradas.map((opt) => {
                  const activa = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => elegir(opt)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        border: "none",
                        borderBottom: "0.5px solid var(--line-2)",
                        background: activa ? "var(--accent-soft)" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {opt.code && (
                        <Flag code={opt.code} w={26} h={18} rounded={3} />
                      )}
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--ink)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span
                            style={{
                              display: "block",
                              fontSize: 12,
                              color: "var(--ink-3)",
                            }}
                          >
                            {opt.sublabel}
                          </span>
                        )}
                      </span>
                      {activa && (
                        <Icon.Check size={16} style={{ color: "var(--accent-ink)" }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
