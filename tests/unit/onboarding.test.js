import { describe, expect, test } from "vitest";
import { countPrediccionesDe, getNextUnpredictedIndex } from "@/lib/onboarding";

// Partidos de grupos de ejemplo y un partido de eliminatoria, para verificar
// que el progreso del onboarding se mide solo sobre los grupos.
const grupos = [
  { id: "A1", fase_id: "grupos" },
  { id: "A2", fase_id: "grupos" },
  { id: "A3", fase_id: "grupos" },
];

describe("countPrediccionesDe", () => {
  test("cuenta solo los partidos del conjunto dado con marcador completo", () => {
    const predicciones = {
      A1: { goles_local: 1, goles_visitante: 0 },
      A2: { goles_local: 2, goles_visitante: 2 },
      // A3 sin pronóstico
    };
    expect(countPrediccionesDe(grupos, predicciones)).toBe(2);
  });

  test("ignora pronósticos de partidos fuera del conjunto (p. ej. eliminatorias)", () => {
    const predicciones = {
      A1: { goles_local: 1, goles_visitante: 0 },
      "d16-01": { goles_local: 3, goles_visitante: 1 },
    };
    // Solo A1 pertenece a `grupos`: la predicción de eliminatoria no suma.
    expect(countPrediccionesDe(grupos, predicciones)).toBe(1);
  });

  test("no cuenta marcadores incompletos", () => {
    const predicciones = {
      A1: { goles_local: 1, goles_visitante: null },
      A2: { goles_local: null, goles_visitante: null },
    };
    expect(countPrediccionesDe(grupos, predicciones)).toBe(0);
  });

  test("tolera entradas vacías", () => {
    expect(countPrediccionesDe(null, {})).toBe(0);
    expect(countPrediccionesDe(grupos, null)).toBe(0);
    expect(countPrediccionesDe([], {})).toBe(0);
  });

  test("banner y asistente coinciden: todo grupos pronosticado ⇒ completo", () => {
    const predicciones = {
      A1: { goles_local: 1, goles_visitante: 0 },
      A2: { goles_local: 2, goles_visitante: 2 },
      A3: { goles_local: 0, goles_visitante: 1 },
      // Una predicción extra de eliminatoria no debe afectar el conteo.
      "d16-01": { goles_local: 3, goles_visitante: 1 },
    };
    expect(countPrediccionesDe(grupos, predicciones)).toBe(grupos.length);
    // El asistente, que recorre los mismos partidos, también se da por completo.
    expect(getNextUnpredictedIndex(grupos, predicciones)).toBe(grupos.length);
  });
});
