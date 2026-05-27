import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  agruparReacciones,
  alternarReaccion as apiAlternarReaccion,
  borrarMensaje as apiBorrar,
  editarMensaje as apiEditar,
  enviarMensaje as apiEnviar,
  listarMensajes,
  listarReaccionesPorMensaje,
  obtenerMensaje,
} from "@/api/mensajes";

function ordenar(mensajes) {
  return [...mensajes].sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return ta - tb;
  });
}

// Hook completo de chat con realtime, optimistic UI y mutaciones.
// partidoId: string para chat de partido | null para chat global.
export function useChat(partidoId) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(false);
  const [error, setError] = useState(null);
  const mensajesRef = useRef(mensajes);
  mensajesRef.current = mensajes;

  // Set de ids para lookups O(1) en handlers de realtime sin filtro (DELETE).
  const idsRef = useRef(new Set());
  useEffect(() => {
    idsRef.current = new Set(mensajes.map((m) => m.id));
  }, [mensajes]);

  // Fetch inicial.
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);
    listarMensajes(partidoId, { userId })
      .then(({ mensajes: data, hayMas: more }) => {
        if (cancel) return;
        setMensajes(data);
        setHayMas(more);
      })
      .catch((e) => { if (!cancel) setError(e); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [partidoId, userId]);

  // Helpers de mutación de estado local con dedup por id.
  const upsertMensaje = useCallback((nuevo) => {
    setMensajes((prev) => {
      const sinDuplicado = prev.filter((m) => m.id !== nuevo.id);
      return ordenar([...sinDuplicado, nuevo]);
    });
  }, []);

  const aplicarUpdate = useCallback((parcial) => {
    setMensajes((prev) =>
      prev.map((m) => (m.id === parcial.id ? { ...m, ...parcial } : m))
    );
  }, []);

  const quitarMensaje = useCallback((id) => {
    setMensajes((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const refrescarReaccionesDe = useCallback(async (mensajeId) => {
    try {
      const rows = await listarReaccionesPorMensaje(mensajeId);
      setMensajes((prev) =>
        prev.map((m) =>
          m.id === mensajeId
            ? { ...m, reacciones: agruparReacciones(rows, userId) }
            : m
        )
      );
    } catch {
      // Silencioso: el próximo evento o refresh lo corregirá.
    }
  }, [userId]);

  // Suscripción realtime.
  useEffect(() => {
    const filtro = partidoId
      ? `partido_id=eq.${partidoId}`
      : `partido_id=is.null`;
    const canalNombre = `chat:${partidoId ?? "global"}`;

    const channel = supabase.channel(canalNombre);

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "mensajes", filter: filtro },
      async (payload) => {
        const id = payload.new?.id;
        if (!id) return;
        // Si ya está optimistic con id real, evitar refetch innecesario.
        const ya = mensajesRef.current.find((m) => m.id === id);
        if (ya && ya.usuario) return;
        try {
          const completo = await obtenerMensaje(id);
          if (completo) upsertMensaje({ ...completo, reacciones: ya?.reacciones || [] });
        } catch {
          // ignore — la próxima sincronización lo corregirá
        }
      },
    );

    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "mensajes", filter: filtro },
      (payload) => {
        const nuevo = payload.new;
        if (!nuevo?.id) return;
        aplicarUpdate({
          id: nuevo.id,
          texto: nuevo.texto,
          updated_at: nuevo.updated_at,
          editado: nuevo.editado,
        });
      },
    );

    // DELETE: el WAL solo incluye la PK con REPLICA IDENTITY default, por lo
    // que un filter sobre partido_id no es fiable. Recibimos todos los DELETE
    // y descartamos en cliente con un Set de ids (O(1)).
    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "mensajes" },
      (payload) => {
        const id = payload.old?.id;
        if (!id) return;
        if (idsRef.current.has(id)) quitarMensaje(id);
      },
    );

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reacciones_mensaje" },
      (payload) => {
        const mensajeId = payload.new?.mensaje_id || payload.old?.mensaje_id;
        if (!mensajeId) return;
        if (idsRef.current.has(mensajeId)) refrescarReaccionesDe(mensajeId);
      },
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partidoId, upsertMensaje, aplicarUpdate, quitarMensaje, refrescarReaccionesDe]);

  // Acciones.

  const enviar = useCallback(async (texto) => {
    if (!userId) throw new Error("Usuario no autenticado");
    const limpio = (texto || "").trim();
    if (!limpio) return;

    const tmpId = `tmp-${(crypto?.randomUUID?.() || Math.random().toString(36).slice(2))}`;
    const optimista = {
      id: tmpId,
      usuario_id: userId,
      partido_id: partidoId ?? null,
      texto: limpio,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      editado: false,
      usuario: {
        id: userId,
        nombre: user?.nombre,
        avatar: user?.avatar,
        color: user?.color,
      },
      reacciones: [],
      pending: true,
    };
    upsertMensaje(optimista);

    try {
      const real = await apiEnviar({ usuarioId: userId, partidoId, texto: limpio });
      setMensajes((prev) => {
        const sinTmp = prev.filter((m) => m.id !== tmpId && m.id !== real.id);
        return ordenar([...sinTmp, { ...real, reacciones: [] }]);
      });
      return real;
    } catch (e) {
      quitarMensaje(tmpId);
      setError(e);
      throw e;
    }
  }, [userId, partidoId, user?.nombre, user?.avatar, user?.color, upsertMensaje, quitarMensaje]);

  const editar = useCallback(async (id, texto) => {
    const prev = mensajesRef.current.find((m) => m.id === id);
    if (!prev) return;
    const limpio = (texto || "").trim();
    if (!limpio || limpio === prev.texto) return;

    aplicarUpdate({ id, texto: limpio, editado: true });
    try {
      const actualizado = await apiEditar(id, limpio);
      aplicarUpdate({
        id,
        texto: actualizado.texto,
        updated_at: actualizado.updated_at,
        editado: actualizado.editado,
      });
    } catch (e) {
      aplicarUpdate({ id, texto: prev.texto, editado: prev.editado });
      setError(e);
      throw e;
    }
  }, [aplicarUpdate]);

  const borrar = useCallback(async (id) => {
    const prev = mensajesRef.current.find((m) => m.id === id);
    if (!prev) return;
    quitarMensaje(id);
    try {
      await apiBorrar(id);
    } catch (e) {
      upsertMensaje(prev);
      setError(e);
      throw e;
    }
  }, [quitarMensaje, upsertMensaje]);

  const alternarReaccion = useCallback(async (mensajeId, emoji) => {
    if (!userId) return;
    // Optimistic: alterna localmente y luego se sincroniza por realtime/refetch.
    setMensajes((prev) =>
      prev.map((m) => {
        if (m.id !== mensajeId) return m;
        const reacciones = [...(m.reacciones || [])];
        const idx = reacciones.findIndex((r) => r.emoji === emoji);
        if (idx >= 0) {
          const g = reacciones[idx];
          if (g.miReaccion) {
            const count = g.count - 1;
            if (count <= 0) reacciones.splice(idx, 1);
            else reacciones[idx] = { ...g, count, miReaccion: false };
          } else {
            reacciones[idx] = { ...g, count: g.count + 1, miReaccion: true };
          }
        } else {
          reacciones.push({ emoji, count: 1, miReaccion: true });
        }
        return { ...m, reacciones };
      })
    );

    try {
      await apiAlternarReaccion({ mensajeId, usuarioId: userId, emoji });
    } catch (e) {
      // Revertir consultando el estado real y propagar al caller para feedback.
      refrescarReaccionesDe(mensajeId);
      setError(e);
      throw e;
    }
  }, [userId, refrescarReaccionesDe]);

  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hayMas) return;
    const masAntiguo = mensajesRef.current[0];
    if (!masAntiguo) return;
    setCargandoMas(true);
    try {
      const { mensajes: pagina, hayMas: more } = await listarMensajes(partidoId, {
        userId,
        antesDe: masAntiguo.created_at,
      });
      setMensajes((prev) => {
        const yaPresentes = new Set(prev.map((m) => m.id));
        const nuevos = pagina.filter((m) => !yaPresentes.has(m.id));
        return [...nuevos, ...prev];
      });
      setHayMas(more);
    } catch (e) {
      setError(e);
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, hayMas, partidoId, userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { mensajes: data, hayMas: more } = await listarMensajes(partidoId, { userId });
      setMensajes(data);
      setHayMas(more);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [partidoId, userId]);

  return {
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
    refresh,
  };
}
