// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/api/partidos", () => ({
  listPartidosSinResultado: vi.fn(),
}));

import { listPartidosSinResultado } from "@/api/partidos";
import {
  useSyncResultadosPendientes,
  useAutoSyncFinalEnVivo,
  useOnResultadosSincronizados,
  _resetSyncState,
} from "@/hooks/useAutoSyncResultado";

const H = 60 * 60 * 1000;

const partido = (id, horasDesdeAhora, extra = {}) => ({
  id,
  fecha: new Date(Date.now() + horasDesdeAhora * H).toISOString(),
  resultado_ingresado: false,
  ...extra,
});

let fetchMock;

beforeEach(() => {
  _resetSyncState();
  vi.mocked(listPartidosSinResultado).mockReset();
  fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("{}", { status: 200 }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

function dispararVisibilidad() {
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useSyncResultadosPendientes — al abrir la app", () => {
  test("con resultados pendientes dispara el sync", async () => {
    listPartidosSinResultado.mockResolvedValue([partido("a", -5)]);
    renderHook(() => useSyncResultadosPendientes());
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/sync-partidos", {
        method: "POST",
      }),
    );
  });

  test("sin pendientes no dispara nada", async () => {
    listPartidosSinResultado.mockResolvedValue([
      partido("en-juego", -1),
      partido("futuro", +3),
    ]);
    renderHook(() => useSyncResultadosPendientes());
    await waitFor(() => expect(listPartidosSinResultado).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("respeta el cooldown: remontar el componente no repite el chequeo", async () => {
    listPartidosSinResultado.mockResolvedValue([partido("a", -5)]);
    const r1 = renderHook(() => useSyncResultadosPendientes());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    r1.unmount();
    renderHook(() => useSyncResultadosPendientes());
    await new Promise((r) => setTimeout(r, 50));
    expect(listPartidosSinResultado).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("al volver al primer plano (cooldown vencido) vuelve a verificar", async () => {
    listPartidosSinResultado.mockResolvedValue([]);
    renderHook(() => useSyncResultadosPendientes());
    await waitFor(() => expect(listPartidosSinResultado).toHaveBeenCalledTimes(1));

    // Simular que pasó el cooldown y que ahora hay un pendiente.
    _resetSyncState();
    listPartidosSinResultado.mockResolvedValue([partido("b", -4)]);
    dispararVisibilidad();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(listPartidosSinResultado).toHaveBeenCalledTimes(2);
  });

  test("si la verificación falla por red, libera el cooldown para reintentar", async () => {
    listPartidosSinResultado.mockRejectedValueOnce(new TypeError("offline"));
    listPartidosSinResultado.mockResolvedValue([partido("c", -4)]);
    renderHook(() => useSyncResultadosPendientes());
    await waitFor(() => expect(listPartidosSinResultado).toHaveBeenCalledTimes(1));

    // De vuelta online y al primer plano: reintenta sin esperar cooldown.
    dispararVisibilidad();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});

describe("useAutoSyncFinalEnVivo — final del partido en vivo", () => {
  test("cuando ESPN da el partido por terminado, guarda el resultado", async () => {
    const live = partido("live-1", -1.5);
    const { rerender } = renderHook(
      ({ marcador }) => useAutoSyncFinalEnVivo(live, marcador),
      {
        initialProps: {
          marcador: { golesLocal: 1, golesVisitante: 0, finalizado: false },
        },
      },
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).not.toHaveBeenCalled();

    rerender({ marcador: { golesLocal: 2, golesVisitante: 0, finalizado: true } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    // Re-render con el mismo final no repite el disparo.
    rerender({ marcador: { golesLocal: 2, golesVisitante: 0, finalizado: true } });
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("no dispara si la BD ya tiene el resultado", async () => {
    const live = partido("live-2", -2, {
      resultado_ingresado: true,
      goles_local: 2,
      goles_visitante: 0,
    });
    renderHook(() =>
      useAutoSyncFinalEnVivo(live, {
        golesLocal: 2,
        golesVisitante: 0,
        finalizado: true,
      }),
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("useOnResultadosSincronizados", () => {
  test("toda sincronización anuncia a los suscriptores, incluso con 429 o sin red", async () => {
    const callback = vi.fn();
    renderHook(() => useOnResultadosSincronizados(callback));

    // Un 429 (otro cliente sincronizó primero) igual refresca la UI.
    fetchMock.mockResolvedValue(new Response("", { status: 429 }));
    const live = partido("live-3", -1.5);
    renderHook(() =>
      useAutoSyncFinalEnVivo(live, {
        golesLocal: 0,
        golesVisitante: 0,
        finalizado: true,
      }),
    );
    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));

    // Sin red tampoco revienta y aun así anuncia.
    fetchMock.mockRejectedValue(new TypeError("network down"));
    const live2 = partido("live-4", -1.5);
    renderHook(() =>
      useAutoSyncFinalEnVivo(live2, {
        golesLocal: 1,
        golesVisitante: 1,
        finalizado: true,
      }),
    );
    await waitFor(() => expect(callback).toHaveBeenCalledTimes(2));
  });

  test("al desmontar deja de escuchar", async () => {
    const callback = vi.fn();
    const sub = renderHook(() => useOnResultadosSincronizados(callback));
    sub.unmount();
    const live = partido("live-5", -1.5);
    renderHook(() =>
      useAutoSyncFinalEnVivo(live, {
        golesLocal: 1,
        golesVisitante: 0,
        finalizado: true,
      }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 50));
    expect(callback).not.toHaveBeenCalled();
  });
});
