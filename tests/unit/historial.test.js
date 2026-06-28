import { describe, expect, test } from "vitest";
import {
  resumenEquipo,
  caraACara,
  hayHistorial,
} from "@/lib/historial";

// Constructor breve de un partido con resultado cargado.
const jugado = (id, local, visitante, gl, gv, extra = {}) => ({
  id,
  fase_id: "grupos",
  fecha: `2026-06-${id}T20:00:00Z`,
  equipo_local: local,
  equipo_visitante: visitante,
  goles_local: gl,
  goles_visitante: gv,
  resultado_ingresado: true,
  ganador: null,
  ...extra,
});

const pendiente = (id, local, visitante) => ({
  id,
  fase_id: "grupos",
  fecha: `2026-06-${id}T20:00:00Z`,
  equipo_local: local,
  equipo_visitante: visitante,
  goles_local: null,
  goles_visitante: null,
  resultado_ingresado: false,
  ganador: null,
});

describe("resumenEquipo", () => {
  const partidos = [
    jugado("11", "Brasil", "Suiza", 2, 0), // Brasil G
    jugado("12", "Serbia", "Brasil", 1, 1), // Brasil E
    jugado("13", "Brasil", "Camerún", 0, 1), // Brasil P
    pendiente("14", "Brasil", "México"), // sin resultado: no cuenta
  ];

  test("cuenta balance y goles desde la óptica del equipo", () => {
    const r = resumenEquipo("Brasil", partidos);
    expect(r.jugados).toBe(3);
    expect(r.ganados).toBe(1);
    expect(r.empatados).toBe(1);
    expect(r.perdidos).toBe(1);
    expect(r.golesFavor).toBe(2 + 1 + 0);
    expect(r.golesContra).toBe(0 + 1 + 1);
  });

  test("ignora partidos sin resultado", () => {
    const r = resumenEquipo("México", partidos);
    expect(r.jugados).toBe(0);
    expect(r.partidos).toEqual([]);
  });

  test("ordena del más reciente al más antiguo", () => {
    const r = resumenEquipo("Brasil", partidos);
    expect(r.partidos.map((p) => p.id)).toEqual(["13", "12", "11"]);
  });

  test("excluye el partido indicado", () => {
    const r = resumenEquipo("Brasil", partidos, { excluirId: "13" });
    expect(r.jugados).toBe(2);
    expect(r.perdidos).toBe(0);
  });

  test("marca el avance por penales", () => {
    const conPenales = [
      jugado("20", "Argentina", "Francia", 1, 1, { ganador: "Argentina" }),
    ];
    const r = resumenEquipo("Argentina", conPenales);
    expect(r.empatados).toBe(1);
    expect(r.partidos[0].porPenales).toBe(true);
    expect(r.partidos[0].avanzoPorPenales).toBe(true);
  });

  test("equipo o lista inválidos devuelven resumen vacío", () => {
    expect(resumenEquipo(null, partidos).jugados).toBe(0);
    expect(resumenEquipo("Brasil", null).jugados).toBe(0);
  });
});

describe("caraACara", () => {
  const partidos = [
    jugado("11", "Brasil", "Argentina", 2, 1),
    jugado("12", "Argentina", "Brasil", 0, 0, { ganador: "Brasil" }),
    jugado("13", "Brasil", "Chile", 3, 0),
  ];

  test("solo enfrentamientos entre ambos equipos, más recientes primero", () => {
    const h2h = caraACara("Brasil", "Argentina", partidos);
    expect(h2h.map((p) => p.id)).toEqual(["12", "11"]);
  });

  test("la óptica es la del primer equipo", () => {
    const h2h = caraACara("Brasil", "Argentina", partidos);
    // id 11: Brasil local 2-1 → gf 2 gc 1
    const p11 = h2h.find((p) => p.id === "11");
    expect(p11.gf).toBe(2);
    expect(p11.gc).toBe(1);
  });
});

describe("hayHistorial", () => {
  const partidos = [jugado("11", "Brasil", "Suiza", 2, 0)];

  test("true si alguno de los dos ya jugó", () => {
    expect(hayHistorial("Brasil", "México", partidos)).toBe(true);
  });

  test("false si ninguno jugó", () => {
    expect(hayHistorial("México", "Canadá", partidos)).toBe(false);
  });
});
