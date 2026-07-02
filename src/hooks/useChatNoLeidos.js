import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Marca local de la última visita al chat global. Vive en localStorage: es
// por dispositivo, suficiente para el badge del inicio sin tocar la BD.
const KEY = "lcf:chat-visto";

function leerVisto() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function marcarChatVisto() {
  try {
    localStorage.setItem(KEY, new Date().toISOString());
  } catch {
    // Modo privado sin storage: el badge simplemente no cuenta.
  }
}

// Cantidad de mensajes del chat global posteriores a la última visita.
// La primera vez (sin marca) toma "ahora" como línea base, así el badge
// arranca en 0 y a partir de ahí solo cuenta lo nuevo. Mientras el
// componente está montado, los INSERT en vivo suman al contador.
export function useChatNoLeidos() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let visto = leerVisto();
    if (!visto) {
      marcarChatVisto();
      visto = leerVisto();
      if (!visto) return; // sin storage: no hay línea base posible
    }

    let cancel = false;
    supabase
      .from("mensajes")
      .select("id", { count: "exact", head: true })
      .is("partido_id", null)
      .gt("created_at", visto)
      .then(({ count: c, error }) => {
        if (!cancel && !error && typeof c === "number") setCount(c);
      });

    const channel = supabase
      .channel("chat-no-leidos")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: "partido_id=is.null",
        },
        () => setCount((c) => c + 1),
      )
      .subscribe();

    return () => {
      cancel = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
