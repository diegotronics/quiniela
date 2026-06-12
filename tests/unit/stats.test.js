import { describe, expect, test } from "vitest";
import {
  partidoEnVivo,
  partidoTerminado,
  resultadosPendientes,
} from "@/lib/stats";

const H = 60 * 60 * 1000;
const AHORA = Date.parse("2026-06-15T20:00:00Z");

const partido = (id, horasDesdeAhora, extra = {}) => ({
  id,
  fecha: new Date(AHORA + horasDesdeAhora * H).toISOString(),
  resultado_ingresado: false,
  ...extra,
});

describe("partidoEnVivo", () => {
  test("partido en juego dentro de la ventana → destacado y no terminado", () => {
    const partidos = [partido("a", -1)];
    expect(partidoEnVivo(partidos, AHORA)?.id).toBe("a");
    expect(partidoTerminado(partidos[0], AHORA)).toBe(false);
  });

  test("terminado con próximo en agenda → sigue destacado como finalizado", () => {
    const partidos = [
      partido("a", -2, { resultado_ingresado: true, goles_local: 2, goles_visitante: 1 }),
      partido("b", +3),
    ];
    expect(partidoEnVivo(partidos, AHORA)?.id).toBe("a");
    expect(partidoTerminado(partidos[0], AHORA)).toBe(true);
  });

  test("cuando comienza el próximo, lo reemplaza", () => {
    const partidos = [
      partido("a", -2, { resultado_ingresado: true }),
      partido("b", +3),
    ];
    const despues = AHORA + 3 * H + 60 * 1000;
    expect(partidoEnVivo(partidos, despues)?.id).toBe("b");
    expect(partidoTerminado(partidos[1], despues)).toBe(false);
  });

  test("sin resultado y fuera de la ventana de 150 min → terminado", () => {
    const p = partido("c", -3);
    expect(partidoTerminado(p, AHORA)).toBe(true);
    // Sin próximo en agenda sigue visible dentro de las 24h…
    expect(partidoEnVivo([p], AHORA)?.id).toBe("c");
    // …y desaparece pasadas 24h.
    expect(partidoEnVivo([p], AHORA + 26 * H)).toBeUndefined();
  });

  test("ningún partido comenzado → undefined", () => {
    expect(partidoEnVivo([partido("x", +5)], AHORA)).toBeUndefined();
    expect(partidoEnVivo([], AHORA)).toBeUndefined();
    expect(partidoEnVivo(null, AHORA)).toBeUndefined();
  });

  test("con varios comenzados destaca el de inicio más reciente", () => {
    const partidos = [partido("viejo", -2), partido("nuevo", -0.5)];
    expect(partidoEnVivo(partidos, AHORA)?.id).toBe("nuevo");
  });
});

describe("resultadosPendientes", () => {
  test("detecta solo los jugados sin resultado en BD", () => {
    const partidos = [
      partido("jugado-sin-resultado", -5),
      partido("jugado-con-resultado", -5, { resultado_ingresado: true }),
      partido("en-juego", -1),
      partido("futuro", +5),
    ];
    const ids = resultadosPendientes(partidos, AHORA).map((p) => p.id);
    expect(ids).toEqual(["jugado-sin-resultado"]);
  });

  test("sin partidos → lista vacía", () => {
    expect(resultadosPendientes([], AHORA)).toEqual([]);
    expect(resultadosPendientes(null, AHORA)).toEqual([]);
  });

  test("fechas inválidas no cuentan como pendientes", () => {
    const partidos = [{ id: "raro", fecha: "no-es-fecha", resultado_ingresado: false }];
    expect(resultadosPendientes(partidos, AHORA)).toEqual([]);
  });
});
