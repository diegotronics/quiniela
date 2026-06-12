import { describe, expect, test } from "vitest";
import { mapTeam, normalize } from "@/lib/equiposEspn";

describe("normalize", () => {
  test("baja a minúsculas y quita acentos y separadores", () => {
    expect(normalize("Türkiye")).toBe("turkiye");
    expect(normalize("Côte d'Ivoire")).toBe("cote d ivoire");
    expect(normalize("  South   Africa ")).toBe("south africa");
    expect(normalize(null)).toBe("");
  });
});

describe("mapTeam", () => {
  test("traduce nombres de ESPN a los de la BD", () => {
    expect(mapTeam("Mexico")).toBe("México");
    expect(mapTeam("Türkiye")).toBe("Turquía");
    expect(mapTeam("United States")).toBe("EEUU");
    expect(mapTeam("Côte d'Ivoire")).toBe("Costa de Marfil");
    expect(mapTeam("Netherlands")).toBe("Holanda");
  });

  test("equipos no mapeados pasan tal cual", () => {
    expect(mapTeam("Atlantis FC")).toBe("Atlantis FC");
  });
});
