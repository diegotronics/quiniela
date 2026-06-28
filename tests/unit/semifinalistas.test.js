import { describe, expect, test } from "vitest";
import {
  formatSemifinalistas,
  parseSemifinalistas,
  aciertaSemifinalista,
  soloEquipoSemifinalista,
} from "@/lib/constants";

describe("formatSemifinalistas / parseSemifinalistas", () => {
  test("combina y descompone dos equipos", () => {
    const v = formatSemifinalistas("Francia", "Brasil");
    expect(v).toBe("Francia · Brasil");
    expect(parseSemifinalistas(v)).toEqual(["Francia", "Brasil"]);
  });

  test("tolera un solo equipo o vacíos", () => {
    expect(formatSemifinalistas("Francia", "")).toBe("Francia");
    expect(formatSemifinalistas("", "")).toBe("");
    expect(parseSemifinalistas("")).toEqual([]);
    expect(parseSemifinalistas(null)).toEqual([]);
  });
});

describe("aciertaSemifinalista", () => {
  const oficial = "Francia · Brasil";

  test("acierta con cualquiera de los dos semifinalistas", () => {
    expect(aciertaSemifinalista("Francia", oficial)).toBe(true);
    expect(aciertaSemifinalista("Brasil", oficial)).toBe(true);
  });

  test("no acierta con un equipo ajeno", () => {
    expect(aciertaSemifinalista("Argentina", oficial)).toBe(false);
  });

  test("ignora mayúsculas y espacios", () => {
    expect(aciertaSemifinalista("  brasil ", oficial)).toBe(true);
  });

  test("sin pick u oficial devuelve false", () => {
    expect(aciertaSemifinalista("", oficial)).toBe(false);
    expect(aciertaSemifinalista("Francia", "")).toBe(false);
  });
});

describe("soloEquipoSemifinalista", () => {
  test("deja intacto un equipo simple", () => {
    expect(soloEquipoSemifinalista("Brasil")).toBe("Brasil");
  });

  test("tolera el formato anterior 'Equipo — Fase'", () => {
    expect(soloEquipoSemifinalista("Brasil — Octavos de final")).toBe("Brasil");
  });

  test("toma el primero si llega un valor combinado", () => {
    expect(soloEquipoSemifinalista("Francia · Brasil")).toBe("Francia");
  });

  test("vacío devuelve vacío", () => {
    expect(soloEquipoSemifinalista("")).toBe("");
    expect(soloEquipoSemifinalista(null)).toBe("");
  });
});
