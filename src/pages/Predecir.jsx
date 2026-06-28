import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { Button, Card, Icon, Pill, HistorialEquipos } from "@/components/ui";
import { PrediccionWizardStep } from "@/components/PrediccionWizard";
import { esErrorCierre, faltaPronostico, instanteCierre } from "@/lib/pronosticos";
import { formatearFechaHora } from "@/lib/fechas";

// Asistente para completar de corrido las predicciones que faltan de las
// rondas en curso (cualquier fase), sin entrar y salir partido por partido.
export default function Predecir() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fases } = useFases();
  const { partidos, loading: loadingPartidos } = useAllPartidos(fases);
  const { predicciones, setMarcador, loading: loadingPreds } =
    usePrediccionesUsuario(user?.id);

  const [index, setIndex] = useState(0);
  // La cola se fija una sola vez: si la recalculáramos con cada guardado, el
  // partido recién pronosticado saldría de la lista y los índices se correrían.
  const [cola, setCola] = useState(null);

  const faseNombre = useMemo(() => {
    const map = new Map((fases || []).map((f) => [f.id, f.nombre]));
    return (id) => map.get(id) || "";
  }, [fases]);

  useEffect(() => {
    if (cola != null) return;
    if (loadingPartidos || loadingPreds) return;
    const ahora = Date.now();
    const pendientes = (partidos || [])
      .filter((p) => faltaPronostico(p, predicciones[p.id], ahora))
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
    setCola(pendientes);
  }, [cola, loadingPartidos, loadingPreds, partidos, predicciones]);

  if (cola == null) {
    return <Centrado>Buscando lo que te falta por pronosticar…</Centrado>;
  }

  const total = cola.length;
  const completados = cola.filter((p) => {
    const pr = predicciones[p.id];
    return pr && pr.goles_local != null && pr.goles_visitante != null;
  }).length;

  if (total === 0) {
    return (
      <PantallaAlDia
        onIrInicio={() => navigate("/app/inicio")}
        onVerPartidos={() => navigate("/app/partidos")}
      />
    );
  }

  if (index >= total) {
    return (
      <PantallaFinal
        completados={completados}
        total={total}
        onIrInicio={() => navigate("/app/inicio")}
        onRevisar={() => setIndex(0)}
      />
    );
  }

  const partido = cola[index];
  const pct = Math.round((Math.min(index, total) / total) * 100);
  const cierre = instanteCierre(partido.fecha);
  const urgente = cierre != null && cierre - Date.now() < 3 * 60 * 60 * 1000;
  const grupo = partido.grupo ? ` · Grupo ${partido.grupo}` : "";

  return (
    <PrediccionWizardStep
      partido={partido}
      index={index}
      total={total}
      pct={pct}
      prediccionPrevia={predicciones[partido.id]}
      exitLabel="Salir"
      onExit={() => navigate("/app/inicio")}
      onAtras={() => setIndex((i) => Math.max(0, i - 1))}
      instruccion="Elige un atajo rápido o ajusta el marcador exacto. Se guarda solo."
      cierreNode={
        <>
          <span style={{ color: urgente ? "var(--coral-soft)" : undefined }}>
            Cierra 1 h antes del saque
          </span>
          <span style={{ fontWeight: 600 }}>{formatearFechaHora(partido.fecha)}</span>
        </>
      }
      contextoNode={
        <Pill tone="default" size="sm">
          {faseNombre(partido.fase_id)}
          {grupo} · {formatearFechaHora(partido.fecha)}
        </Pill>
      }
      historialNode={
        <HistorialEquipos
          equipoLocal={partido.equipo_local}
          equipoVisitante={partido.equipo_visitante}
          partidos={partidos}
          excluirId={partido.id}
          compacto
        />
      }
      onConfirmar={async (local, visitante) => {
        try {
          await setMarcador(partido.id, local, visitante);
        } catch (e) {
          // Si el partido cerró mientras avanzabas (una hora antes del saque o
          // con resultado), no hay nada que guardar: lo saltamos sin trabar.
          if (!esErrorCierre(e)) throw e;
        }
        setIndex((i) => i + 1);
      }}
    />
  );
}

function PantallaFinal({ completados, total, onIrInicio, onRevisar }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--header-bg)", color: "var(--header-ink)", padding: "32px 20px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 8 }} aria-hidden>
          🎯
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.2 }}>
          ¡Listo!
        </h1>
        <p style={{ marginTop: 8, color: "oklch(0.78 0.02 60)", fontSize: 14, lineHeight: 1.4 }}>
          Pronosticaste {completados} de {total} partidos que tenías pendientes.
        </p>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <Card pad={16} accent>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, color: "var(--ink-3)" }}>
                Completados
              </div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 600, color: "var(--ink)", letterSpacing: -1, marginTop: 4 }}>
                {completados} / {total}
              </div>
            </div>
            <Pill tone={completados >= total ? "accent" : "coral"} size="md">
              {total > 0 ? `${Math.round((completados / total) * 100)}%` : "0%"}
            </Pill>
          </div>
        </Card>

        <Button variant="primary" size="lg" block onClick={onIrInicio}>
          Ir al inicio <Icon.Chevron />
        </Button>
        <Button variant="ghost" size="lg" block onClick={onRevisar}>
          Revisar de nuevo
        </Button>
      </div>
    </div>
  );
}

function PantallaAlDia({ onIrInicio, onVerPartidos }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--header-bg)", color: "var(--header-ink)", padding: "32px 20px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 8 }} aria-hidden>
          ✅
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.2 }}>
          Estás al día
        </h1>
        <p style={{ marginTop: 8, color: "oklch(0.78 0.02 60)", fontSize: 14, lineHeight: 1.4 }}>
          No te falta ningún pronóstico de los partidos abiertos. Cuando se
          definan nuevos cruces aparecerán aquí.
        </p>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <Button variant="primary" size="lg" block onClick={onIrInicio}>
          Ir al inicio <Icon.Chevron />
        </Button>
        <Button variant="ghost" size="lg" block onClick={onVerPartidos}>
          Ver todos los partidos
        </Button>
      </div>
    </div>
  );
}

function Centrado({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
        textAlign: "center",
      }}
    >
      <p style={{ color: "var(--ink-3)", fontSize: 14 }}>{children}</p>
    </div>
  );
}
