import { describe, expect, test } from "vitest";
import {
  familyScoreboard,
  partidoEnVivo,
  partidosEnVivo,
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

describe("partidosEnVivo", () => {
  test("dos partidos en juego a la vez → ambos destacados (más reciente primero)", () => {
    const partidos = [partido("a", -1), partido("b", -0.25)];
    expect(partidosEnVivo(partidos, AHORA).map((p) => p.id)).toEqual(["b", "a"]);
  });

  test("uno en juego y otro ya terminado → solo el que sigue en juego", () => {
    const partidos = [
      partido("viejo", -3, { resultado_ingresado: true }),
      partido("vivo", -1),
    ];
    expect(partidosEnVivo(partidos, AHORA).map((p) => p.id)).toEqual(["vivo"]);
  });

  test("ninguno en juego → conserva el último terminado como finalizado", () => {
    const partidos = [
      partido("a", -3, { resultado_ingresado: true }),
      partido("b", +2),
    ];
    expect(partidosEnVivo(partidos, AHORA).map((p) => p.id)).toEqual(["a"]);
  });

  test("sin partidos comenzados → arreglo vacío", () => {
    expect(partidosEnVivo([partido("x", +5)], AHORA)).toEqual([]);
    expect(partidosEnVivo([], AHORA)).toEqual([]);
    expect(partidosEnVivo(null, AHORA)).toEqual([]);
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

describe("familyScoreboard", () => {
  const usuarios = [
    { id: "ana", nombre: "Ana López", es_admin: false },
    { id: "ben", nombre: "Ben Pérez", es_admin: false },
    { id: "cid", nombre: "Cid Ruiz", es_admin: false },
    { id: "root", nombre: "Admin", es_admin: true },
  ];

  // Dos jornadas (días distintos). pts_exacto=3, pts_ganador=1 (de la fase).
  const partidos = [
    { id: "J1A", fecha: "2026-06-11T15:00:00-04:00", resultado_ingresado: true, goles_local: 2, goles_visitante: 0 },
    { id: "J1B", fecha: "2026-06-11T18:00:00-04:00", resultado_ingresado: true, goles_local: 1, goles_visitante: 1 },
    { id: "J2A", fecha: "2026-06-12T15:00:00-04:00", resultado_ingresado: true, goles_local: 0, goles_visitante: 3 },
    { id: "futuro", fecha: "2026-06-20T15:00:00-04:00", resultado_ingresado: false },
  ];

  const pred = (usuario_id, partido_id, gl, gv, puntos_obtenidos) => ({
    usuario_id,
    partido_id,
    goles_local: gl,
    goles_visitante: gv,
    puntos_obtenidos,
  });

  test("cuenta exactos y aciertos por jugador, ignorando admin y partidos sin resultado", () => {
    const predicciones = [
      // Ana: J1A exacto (2-0), J1B acierto de signo no exacto (1-0→empate? no) ...
      pred("ana", "J1A", 2, 0, 3), // exacto
      pred("ana", "J1B", 1, 1, 3), // exacto (empate)
      pred("ana", "futuro", 1, 0, 0), // partido sin resultado → no cuenta
      // Ben: J1A acierto de ganador (1-0), no exacto
      pred("ben", "J1A", 1, 0, 1),
      pred("ben", "J1B", 2, 0, 0), // falló (no empate)
      // Cid: predicción sin goles → no cuenta
      pred("cid", "J1A", null, null, 0),
      // Admin: se ignora
      pred("root", "J1A", 2, 0, 3),
    ];
    const sb = familyScoreboard(usuarios, predicciones, partidos);

    const exactos = Object.fromEntries(sb.exactos.map((r) => [r.id, r.valor]));
    expect(exactos).toEqual({ ana: 2, ben: 0, cid: 0 });

    const acertados = Object.fromEntries(sb.acertados.map((r) => [r.id, r.valor]));
    expect(acertados).toEqual({ ana: 2, ben: 1, cid: 0 });

    // Admin nunca aparece en los rankings.
    expect(sb.exactos.find((r) => r.id === "root")).toBeUndefined();
  });

  test("jornadas en primer y último lugar respetan empates y diferencia de puntos", () => {
    const predicciones = [
      // Jornada 1 (J1A + J1B): Ana 3+3=6, Ben 1+0=1 → Ana primero, Ben último.
      pred("ana", "J1A", 2, 0, 3),
      pred("ana", "J1B", 1, 1, 3),
      pred("ben", "J1A", 1, 0, 1),
      pred("ben", "J1B", 2, 0, 0),
      // Jornada 2 (J2A): Ana 0, Ben 3 → Ben primero, Ana último.
      pred("ana", "J2A", 1, 0, 0),
      pred("ben", "J2A", 0, 3, 3),
    ];
    const sb = familyScoreboard(usuarios, predicciones, partidos);
    expect(sb.totalJornadas).toBe(2);

    const primero = Object.fromEntries(sb.primero.map((r) => [r.id, r.valor]));
    const ultimo = Object.fromEntries(sb.ultimo.map((r) => [r.id, r.valor]));
    expect(primero).toEqual({ ana: 1, ben: 1, cid: 0 });
    expect(ultimo).toEqual({ ana: 1, ben: 1, cid: 0 });
  });

  test("jornada con empate total no asigna líder ni colero", () => {
    const predicciones = [
      pred("ana", "J2A", 0, 3, 3),
      pred("ben", "J2A", 0, 3, 3),
    ];
    const sb = familyScoreboard(usuarios, predicciones, partidos);
    expect(sb.totalJornadas).toBe(0);
    expect(sb.primero.every((r) => r.valor === 0)).toBe(true);
    expect(sb.ultimo.every((r) => r.valor === 0)).toBe(true);
  });

  test("sin datos devuelve rankings vacíos sin romper", () => {
    const sb = familyScoreboard(usuarios, [], []);
    expect(sb.totalJornadas).toBe(0);
    expect(sb.exactos).toHaveLength(3);
    expect(sb.exactos.every((r) => r.valor === 0)).toBe(true);
  });
});
