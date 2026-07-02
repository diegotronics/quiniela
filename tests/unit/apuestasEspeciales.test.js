import { describe, expect, test } from "vitest";
import {
  aciertoEspecial,
  apuestasEspecialesCerradas,
  apuestasGrupoRows,
} from "@/lib/apuestasEspeciales";

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

describe("aciertoEspecial", () => {
  test("coincide ignorando mayúsculas y espacios extremos", () => {
    expect(aciertoEspecial("  brasil ", "Brasil")).toBe(true);
    expect(aciertoEspecial("Panamá — Cuartos de final", "panamá — cuartos de final")).toBe(true);
  });

  test("falso si el pick y el oficial difieren", () => {
    expect(aciertoEspecial("Argentina", "Brasil")).toBe(false);
  });

  test("falso sin pick o sin resultado oficial", () => {
    expect(aciertoEspecial(null, "Brasil")).toBe(false);
    expect(aciertoEspecial("Brasil", null)).toBe(false);
    expect(aciertoEspecial("", "")).toBe(false);
  });
});

describe("apuestasGrupoRows", () => {
  const USUARIOS = [
    { id: "u1", nombre: "Carlos" },
    { id: "adm", nombre: "Admin", es_admin: true },
    { id: "u2", nombre: "Ana" },
    { id: "u3", nombre: "Beto" },
  ];
  const APUESTAS = [
    { usuario_id: "u1", campeon: "Brasil", puntos_obtenidos: 5 },
    { usuario_id: "u3", campeon: "Argentina", puntos_obtenidos: 20 },
    { usuario_id: "adm", campeon: "Francia", puntos_obtenidos: 0 },
  ];

  test("excluye al admin e incluye a los miembros sin apuesta", () => {
    const rows = apuestasGrupoRows(USUARIOS, APUESTAS);
    expect(rows.map((r) => r.usuario.id).sort()).toEqual(["u1", "u2", "u3"]);
    expect(rows.find((r) => r.usuario.id === "u2").apuesta).toBeNull();
    expect(rows.find((r) => r.usuario.id === "u1").apuesta.campeon).toBe("Brasil");
  });

  test("sin resultados ordena alfabéticamente por nombre", () => {
    const rows = apuestasGrupoRows(USUARIOS, APUESTAS, false);
    expect(rows.map((r) => r.usuario.nombre)).toEqual(["Ana", "Beto", "Carlos"]);
  });

  test("con resultados ordena por puntos y desempata por nombre", () => {
    const rows = apuestasGrupoRows(
      [...USUARIOS, { id: "u4", nombre: "Zoe" }],
      [...APUESTAS, { usuario_id: "u4", campeon: "Brasil", puntos_obtenidos: 5 }],
      true,
    );
    expect(rows.map((r) => r.usuario.nombre)).toEqual(["Beto", "Carlos", "Zoe", "Ana"]);
  });

  test("tolera listas vacías o ausentes", () => {
    expect(apuestasGrupoRows(null, null)).toEqual([]);
    expect(apuestasGrupoRows(USUARIOS, null).length).toBe(3);
  });
});
