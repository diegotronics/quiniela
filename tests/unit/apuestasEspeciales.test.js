import { describe, expect, test } from "vitest";
import { apuestasEspecialesCerradas } from "@/lib/apuestasEspeciales";

const AHORA = Date.parse("2026-06-15T20:00:00Z");
const PASADO = "2026-06-11T19:00:00Z";
const FUTURO = "2026-06-20T19:00:00Z";

describe("apuestasEspecialesCerradas", () => {
  test("sin config no está cerrada", () => {
    expect(apuestasEspecialesCerradas(null, AHORA)).toBe(false);
  });

  test("automático: cerrada cuando la fecha ya pasó", () => {
    expect(
      apuestasEspecialesCerradas({ cierra_en: PASADO, abierta_manual: null }, AHORA),
    ).toBe(true);
  });

  test("automático: abierta cuando la fecha es futura", () => {
    expect(
      apuestasEspecialesCerradas({ cierra_en: FUTURO, abierta_manual: null }, AHORA),
    ).toBe(false);
  });

  test("automático: sin fecha de cierre no está cerrada", () => {
    expect(
      apuestasEspecialesCerradas({ cierra_en: null, abierta_manual: null }, AHORA),
    ).toBe(false);
  });

  test("override abierto: abierta aunque la fecha haya pasado", () => {
    expect(
      apuestasEspecialesCerradas({ cierra_en: PASADO, abierta_manual: true }, AHORA),
    ).toBe(false);
  });

  test("override cerrado: cerrada aunque la fecha sea futura", () => {
    expect(
      apuestasEspecialesCerradas({ cierra_en: FUTURO, abierta_manual: false }, AHORA),
    ).toBe(true);
  });
});
