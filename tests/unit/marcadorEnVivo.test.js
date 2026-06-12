import { describe, expect, test } from "vitest";
import { buscarEvento } from "@/hooks/useMarcadorEnVivo";

// Evento con la forma del scoreboard de ESPN, reducido a lo que se usa.
function evento({ home, away, homeScore, awayScore, state = "in" }) {
  return {
    competitions: [
      {
        status: { type: { state, name: "STATUS_IN_PROGRESS" }, displayClock: "67'" },
        competitors: [
          { homeAway: "home", team: { displayName: home }, score: homeScore },
          { homeAway: "away", team: { displayName: away }, score: awayScore },
        ],
      },
    ],
  };
}

describe("buscarEvento", () => {
  const partido = { equipo_local: "México", equipo_visitante: "Sudáfrica" };

  test("encuentra el evento con la misma orientación local/visitante", () => {
    const events = [
      evento({ home: "Brazil", away: "Morocco", homeScore: "1", awayScore: "0" }),
      evento({ home: "Mexico", away: "South Africa", homeScore: "2", awayScore: "1" }),
    ];
    const hit = buscarEvento(events, partido);
    expect(hit).not.toBeNull();
    expect(hit.local.score).toBe("2");
    expect(hit.visitante.score).toBe("1");
  });

  test("encuentra el evento aunque ESPN invierta local y visitante", () => {
    const events = [
      evento({ home: "South Africa", away: "Mexico", homeScore: "1", awayScore: "3" }),
    ];
    const hit = buscarEvento(events, partido);
    expect(hit).not.toBeNull();
    // Los scores quedan reorientados a nuestro local/visitante.
    expect(hit.local.score).toBe("3");
    expect(hit.visitante.score).toBe("1");
  });

  test("devuelve null si el partido no aparece", () => {
    const events = [
      evento({ home: "Brazil", away: "Morocco", homeScore: "1", awayScore: "0" }),
    ];
    expect(buscarEvento(events, partido)).toBeNull();
    expect(buscarEvento([], partido)).toBeNull();
    expect(buscarEvento(undefined, partido)).toBeNull();
  });

  test("ignora eventos malformados sin competidores", () => {
    const events = [{ competitions: [{}] }, {}];
    expect(buscarEvento(events, partido)).toBeNull();
  });
});
