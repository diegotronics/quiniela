// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useAutoSyncResultados,
  _resetIntentados,
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
  _resetIntentados();
  fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("{}", { status: 200 }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAutoSyncResultados — al abrir la app", () => {
  test("con resultados pendientes dispara el sync y refresca", async () => {
    const onSincronizado = vi.fn();
    renderHook(() =>
      useAutoSyncResultados({
        partidos: [partido("a", -5)],
        live: undefined,
        marcador: null,
        onSincronizado,
      }),
    );
    await waitFor(() => expect(onSincronizado).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/sync-partidos", {
      method: "POST",
    });
  });

  test("sin pendientes no dispara nada", async () => {
    const onSincronizado = vi.fn();
    renderHook(() =>
      useAutoSyncResultados({
        partidos: [
          partido("a", -5, { resultado_ingresado: true }),
          partido("b", +3),
        ],
        live: undefined,
        marcador: null,
        onSincronizado,
      }),
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onSincronizado).not.toHaveBeenCalled();
  });

  test("solo dispara una vez por sesión aunque el componente se remonte", async () => {
    const props = {
      partidos: [partido("a", -5)],
      live: undefined,
      marcador: null,
      onSincronizado: vi.fn(),
    };
    const r1 = renderHook(() => useAutoSyncResultados(props));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    r1.unmount();
    renderHook(() => useAutoSyncResultados(props));
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("useAutoSyncResultados — final del partido en vivo", () => {
  test("cuando ESPN da el partido por terminado, guarda el resultado", async () => {
    const onSincronizado = vi.fn();
    const live = partido("live-1", -1.5);
    const { rerender } = renderHook(
      ({ marcador }) =>
        useAutoSyncResultados({
          partidos: [live],
          live,
          marcador,
          onSincronizado,
        }),
      { initialProps: { marcador: { golesLocal: 1, golesVisitante: 0, finalizado: false } } },
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).not.toHaveBeenCalled();

    rerender({ marcador: { golesLocal: 2, golesVisitante: 0, finalizado: true } });
    await waitFor(() => expect(onSincronizado).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("no dispara si la BD ya tiene el resultado", async () => {
    const live = partido("live-2", -2, {
      resultado_ingresado: true,
      goles_local: 2,
      goles_visitante: 0,
    });
    renderHook(() =>
      useAutoSyncResultados({
        partidos: [live],
        live,
        marcador: { golesLocal: 2, golesVisitante: 0, finalizado: true },
        onSincronizado: vi.fn(),
      }),
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("un 429 (otro cliente sincronizó primero) igual refresca la UI", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 429 }));
    const onSincronizado = vi.fn();
    const live = partido("live-3", -1.5);
    renderHook(() =>
      useAutoSyncResultados({
        partidos: [live],
        live,
        marcador: { golesLocal: 0, golesVisitante: 0, finalizado: true },
        onSincronizado,
      }),
    );
    await waitFor(() => expect(onSincronizado).toHaveBeenCalledTimes(1));
  });

  test("sin red no revienta y aun así intenta refrescar", async () => {
    fetchMock.mockRejectedValue(new TypeError("network down"));
    const onSincronizado = vi.fn();
    const live = partido("live-4", -1.5);
    renderHook(() =>
      useAutoSyncResultados({
        partidos: [live],
        live,
        marcador: { golesLocal: 1, golesVisitante: 1, finalizado: true },
        onSincronizado,
      }),
    );
    await waitFor(() => expect(onSincronizado).toHaveBeenCalledTimes(1));
  });
});
