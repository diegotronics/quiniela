import { useEffect, useRef, useState } from "react";
import { Avatar, Icon } from "@/components/ui";
import { formatearHora } from "@/lib/fechas";
import { ReaccionesBar } from "./ReaccionesBar";
import { EmojiPicker } from "./EmojiPicker";

export function MensajeItem({
  mensaje,
  esPropio,
  esAdmin,
  onEditar,
  onBorrar,
  onReaccionar,
}) {
  const [picker, setPicker] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    function fuera(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    }
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [menu]);

  const puedeEditar = esPropio;
  const puedeBorrar = esPropio || esAdmin;
  const hayAcciones = puedeEditar || puedeBorrar;
  const nombre = mensaje.usuario?.nombre || "Anónimo";
  const hora = formatearHora(mensaje.created_at);

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        flexDirection: esPropio ? "row-reverse" : "row",
        opacity: mensaje.pending ? 0.65 : 1,
      }}
    >
      {!esPropio && <Avatar name={nombre} size={28} />}

      <div style={{ maxWidth: "78%", minWidth: 0, position: "relative" }}>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginBottom: 3,
            padding: esPropio ? "0 4px 0 0" : "0 0 0 4px",
            justifyContent: esPropio ? "flex-end" : "flex-start",
          }}
        >
          {!esPropio && (
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{nombre}</span>
          )}
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{hora}</span>
          {mensaje.editado && (
            <span style={{ fontSize: 10, color: "var(--ink-3)", fontStyle: "italic" }}>
              (editado)
            </span>
          )}
        </div>

        <div
          style={{
            position: "relative",
            padding: "10px 14px",
            background: esPropio ? "var(--accent-soft)" : "var(--surface)",
            color: esPropio ? "var(--accent-ink)" : "var(--ink)",
            border: esPropio ? "1px solid transparent" : "0.5px solid var(--line)",
            borderRadius: esPropio ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
            fontSize: 14,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {mensaje.texto}
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 4,
            alignItems: "center",
            flexDirection: esPropio ? "row-reverse" : "row",
            justifyContent: esPropio ? "flex-end" : "flex-start",
            position: "relative",
          }}
        >
          <ReaccionesBar
            reacciones={mensaje.reacciones}
            onToggle={(emoji) => onReaccionar?.(mensaje.id, emoji)}
            alineacion={esPropio ? "derecha" : "izquierda"}
          />

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setPicker((v) => !v)}
              aria-label="Agregar reacción"
              style={accionBtn}
            >
              <Icon.Plus />
            </button>
            {picker && (
              <EmojiPicker
                onSelect={(emoji) => onReaccionar?.(mensaje.id, emoji)}
                onClose={() => setPicker(false)}
                anclaDerecha={esPropio}
              />
            )}
          </div>

          {hayAcciones && (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-label="Más opciones"
                style={accionBtn}
              >
                <Icon.More />
              </button>
              {menu && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    [esPropio ? "right" : "left"]: 0,
                    zIndex: 25,
                    background: "var(--surface)",
                    border: "0.5px solid var(--line)",
                    borderRadius: 10,
                    padding: 4,
                    minWidth: 130,
                    boxShadow: "var(--shadow-3)",
                  }}
                >
                  {puedeEditar && (
                    <button
                      type="button"
                      onClick={() => { setMenu(false); onEditar?.(mensaje); }}
                      style={menuItem}
                    >
                      <Icon.Edit /> Editar
                    </button>
                  )}
                  {puedeBorrar && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        if (window.confirm("¿Borrar este mensaje?")) onBorrar?.(mensaje.id);
                      }}
                      style={{ ...menuItem, color: "var(--danger)" }}
                    >
                      <Icon.Trash /> Borrar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const accionBtn = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "transparent",
  border: "0.5px solid var(--line)",
  color: "var(--ink-3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
};

const menuItem = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  background: "transparent",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  color: "var(--ink-2)",
  textAlign: "left",
  cursor: "pointer",
};
