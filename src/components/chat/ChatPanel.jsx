import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { MensajeItem } from "./MensajeItem";
import { ChatInput } from "./ChatInput";
import { EmptyState, SkeletonChatMessages } from "@/components/ui";

export function ChatPanel({ partidoId = null, altura = "60dvh" }) {
  const { user } = useAuth();
  const {
    mensajes,
    loading,
    cargandoMas,
    hayMas,
    error,
    enviar,
    editar,
    borrar,
    alternarReaccion,
    cargarMas,
  } = useChat(partidoId);

  const [borrador, setBorrador] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState(null);

  const scrollRef = useRef(null);
  const cerquitaDelFondoRef = useRef(true);
  const cantidadPrevRef = useRef(0);
  const yaHizoScrollInicialRef = useRef(false);
  // Preservar el scroll cuando se prependen mensajes antiguos.
  const alturaPrevRef = useRef(0);
  const idMasAntiguoRef = useRef(null);

  // Auto-dismiss del error de acción.
  useEffect(() => {
    if (!errorAccion) return;
    const t = setTimeout(() => setErrorAccion(null), 4000);
    return () => clearTimeout(t);
  }, [errorAccion]);

  const irAlFondo = useCallback((suave = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: suave ? "smooth" : "auto" });
  }, []);

  // Track si el usuario está cerca del fondo (para decidir auto-scroll) y
  // detectar cuando llega cerca del tope para cargar más mensajes antiguos.
  function manejarScroll(e) {
    const el = e.currentTarget;
    const distancia = el.scrollHeight - el.scrollTop - el.clientHeight;
    cerquitaDelFondoRef.current = distancia < 80;
    if (
      yaHizoScrollInicialRef.current &&
      el.scrollTop < 80 &&
      hayMas &&
      !cargandoMas &&
      !loading
    ) {
      alturaPrevRef.current = el.scrollHeight;
      cargarMas();
    }
  }

  // Scroll inicial al final cuando llegan los primeros mensajes.
  useLayoutEffect(() => {
    if (loading || yaHizoScrollInicialRef.current) return;
    if (mensajes.length > 0) {
      irAlFondo(false);
      yaHizoScrollInicialRef.current = true;
      cantidadPrevRef.current = mensajes.length;
      idMasAntiguoRef.current = mensajes[0]?.id ?? null;
    }
  }, [loading, mensajes.length, irAlFondo]);

  // Auto-scroll suave al recibir/enviar mensajes nuevos si el usuario estaba
  // cerca del fondo. Si se prependieron mensajes antiguos (cambia el id más
  // antiguo), preservamos la posición visual del usuario.
  useLayoutEffect(() => {
    if (!yaHizoScrollInicialRef.current) return;
    const el = scrollRef.current;
    const idMasAntiguo = mensajes[0]?.id ?? null;
    const prependidos = idMasAntiguo !== idMasAntiguoRef.current;
    if (prependidos && el && alturaPrevRef.current > 0) {
      const delta = el.scrollHeight - alturaPrevRef.current;
      el.scrollTop = delta;
      alturaPrevRef.current = 0;
    } else if (
      mensajes.length > cantidadPrevRef.current &&
      cerquitaDelFondoRef.current
    ) {
      irAlFondo(true);
    }
    cantidadPrevRef.current = mensajes.length;
    idMasAntiguoRef.current = idMasAntiguo;
  }, [mensajes, irAlFondo]);

  const mensajeEditando = editandoId
    ? mensajes.find((m) => m.id === editandoId)
    : null;

  const empezarEdicion = useCallback((m) => {
    setEditandoId(m.id);
    setBorrador(m.texto);
  }, []);

  const cancelarEdicion = useCallback(() => {
    setEditandoId(null);
    setBorrador("");
  }, []);

  const manejarEnviar = useCallback(async () => {
    const texto = borrador.trim();
    if (!texto) return;
    setEnviando(true);
    try {
      if (editandoId) {
        await editar(editandoId, texto);
        cancelarEdicion();
      } else {
        await enviar(texto);
        setBorrador("");
      }
    } catch (e) {
      setErrorAccion(e.message || "No se pudo enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  }, [borrador, editandoId, editar, enviar, cancelarEdicion]);

  const manejarBorrar = useCallback(async (id) => {
    try {
      await borrar(id);
      if (editandoId === id) cancelarEdicion();
    } catch (e) {
      setErrorAccion(e.message || "No se pudo borrar el mensaje");
    }
  }, [borrar, editandoId, cancelarEdicion]);

  const manejarReaccion = useCallback(async (id, emoji) => {
    try {
      await alternarReaccion(id, emoji);
    } catch (e) {
      setErrorAccion(e.message || "No se pudo aplicar la reacción");
    }
  }, [alternarReaccion]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: altura,
        background: "var(--bg)",
        border: "0.5px solid var(--line)",
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
      }}
    >
      <div
        ref={scrollRef}
        onScroll={manejarScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {loading && <SkeletonChatMessages count={5} />}
        {!loading && cargandoMas && (
          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--ink-3)",
              padding: "4px 0",
            }}
          >
            Cargando mensajes anteriores…
          </div>
        )}
        {!loading && error && (
          <div style={{ color: "var(--danger)", textAlign: "center", padding: 20, fontSize: 13 }}>
            Error al cargar el chat.
          </div>
        )}
        {!loading && !error && mensajes.length === 0 && (
          <EmptyState
            illustration="chat"
            title="Chat sin mensajes"
            description="Sé el primero en escribir. Comparte tu pronóstico o chalequeo."
            compact
          />
        )}
        {mensajes.map((m) => (
          <MensajeItem
            key={m.id}
            mensaje={m}
            esPropio={m.usuario_id === user?.id}
            esAdmin={!!user?.es_admin}
            onEditar={empezarEdicion}
            onBorrar={manejarBorrar}
            onReaccionar={manejarReaccion}
          />
        ))}
      </div>

      {errorAccion && (
        <div
          style={{
            background: "var(--danger-soft)",
            color: "var(--danger)",
            fontSize: 12,
            padding: "8px 14px",
            textAlign: "center",
          }}
        >
          {errorAccion}
        </div>
      )}

      <ChatInput
        value={borrador}
        onChange={setBorrador}
        onEnviar={manejarEnviar}
        enviando={enviando}
        modoEdicion={!!mensajeEditando}
        onCancelar={cancelarEdicion}
        placeholder={user ? "Escribe un mensaje…" : "Inicia sesión para escribir"}
      />
    </div>
  );
}
