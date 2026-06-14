import { describe, expect, test } from "vitest";
import {
  MARGEN_CIERRE_MS,
  esErrorCierre,
  instanteCierre,
  partidoAbierto,
  pronosticoCerrado,
} from "@/lib/pronosticos";
import {
  prediccionesPendientesByUsuario,
  proximoPartido,
} from "@/lib/stats";

const H = 60 * 60 * 1000;
const AHORA = Date.parse("2026-06-15T20:00:00Z");

// Partido cuyo saque ocurre `horasDesdeAhora` horas respecto a AHORA.
const partido = (id, horasDesdeAhora, extra = {}) => ({
  id,
  fecha: new Date(AHORA + horasDesdeAhora * H).toISOString(),
  resultado_ingresado: false,
  ...extra,
});

describe("instanteCierre", () => {
  test("es el saque menos una hora", () => {
    const p = partido("a", +2);
    expect(instanteCierre(p.fecha)).toBe(new Date(p.fecha).getTime() - MARGEN_CIERRE_MS);
  });

  test("fecha ausente o inválida → null", () => {
    expect(instanteCierre(null)).toBeNull();
    expect(instanteCierre("no-es-fecha")).toBeNull();
  });
});

describe("pronosticoCerrado", () => {
  test("a más de una hora del saque sigue abierto", () => {
    expect(pronosticoCerrado(partido("a", +2), AHORA)).toBe(false);
    expect(partidoAbierto(partido("a", +2), AHORA)).toBe(true);
  });

  test("justo a una hora del saque ya está cerrado", () => {
    expect(pronosticoCerrado(partido("a", +1), AHORA)).toBe(true);
  });

  test("a menos de una hora del saque está cerrado", () => {
    expect(pronosticoCerrado(partido("a", +0.5), AHORA)).toBe(true);
    expect(partidoAbierto(partido("a", +0.5), AHORA)).toBe(false);
  });

  test("con resultado cargado está cerrado aunque falte tiempo", () => {
    expect(pronosticoCerrado(partido("a", +5, { resultado_ingresado: true }), AHORA)).toBe(true);
  });

  test("fecha inválida → no se cierra por tiempo", () => {
    const p = { id: "raro", fecha: "no-es-fecha", resultado_ingresado: false };
    expect(pronosticoCerrado(p, AHORA)).toBe(false);
  });
});

describe("esErrorCierre", () => {
  test("reconoce los códigos de cierre del servidor", () => {
    expect(esErrorCierre(new Error("PRONOSTICO_CERRADO: ..."))).toBe(true);
    expect(esErrorCierre(new Error("PARTIDO_CERRADO: ..."))).toBe(true);
    expect(esErrorCierre(new Error("PARTIDO_INICIADO: ..."))).toBe(true);
    expect(esErrorCierre("PRONOSTICO_CERRADO")).toBe(true);
  });

  test("no marca otros errores (red, etc.)", () => {
    expect(esErrorCierre(new Error("network timeout"))).toBe(false);
    expect(esErrorCierre(null)).toBe(false);
  });
});

describe("proximoPartido", () => {
  test("toma el más cercano que siga abierto y sin pronóstico", () => {
    const partidos = [
      partido("cerrado-pronto", +0.5), // dentro de 1h → cerrado
      partido("abierto-1", +2),
      partido("abierto-2", +4),
    ];
    expect(proximoPartido(partidos, {}, AHORA)?.id).toBe("abierto-1");
  });

  test("salta los que ya tienen pronóstico", () => {
    const partidos = [partido("a", +2), partido("b", +4)];
    const preds = { a: { goles_local: 1, goles_visitante: 0 } };
    expect(proximoPartido(partidos, preds, AHORA)?.id).toBe("b");
  });

  test("ignora partidos con resultado y ya cerrados", () => {
    const partidos = [
      partido("con-resultado", +2, { resultado_ingresado: true }),
      partido("cerrado", +0.5),
    ];
    expect(proximoPartido(partidos, {}, AHORA)).toBeUndefined();
  });
});

describe("prediccionesPendientesByUsuario", () => {
  const usuarios = [
    { id: "u1", nombre: "Ana" },
    { id: "u2", nombre: "Beto" },
  ];

  test("total cuenta solo partidos abiertos; pendientes descuenta los hechos", () => {
    const partidos = [
      partido("abierto-1", +2),
      partido("abierto-2", +4),
      partido("cerrado", +0.5), // no cuenta: ya cerrado
      partido("con-resultado", +6, { resultado_ingresado: true }), // no cuenta
    ];
    // u1 ya pronosticó uno de los abiertos; u2 ninguno. La predicción sobre el
    // partido cerrado no debe contar como "hecha de los abiertos".
    const puntajes = [
      { usuario_id: "u1", partido_id: "abierto-1" },
      { usuario_id: "u2", partido_id: "cerrado" },
    ];
    const { total, pendientes } = prediccionesPendientesByUsuario(
      usuarios,
      puntajes,
      partidos,
      AHORA,
    );
    expect(total).toBe(2);
    expect(pendientes.get("u1")).toBe(1);
    expect(pendientes.get("u2")).toBe(2);
  });
});
