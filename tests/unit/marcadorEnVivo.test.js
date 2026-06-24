import { describe, expect, test } from "vitest";
import { buscarEvento, extraerGoleadores } from "@/hooks/useMarcadorEnVivo";

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

describe("extraerGoleadores", () => {
  const local = { id: "10", team: { id: "10" } };
  const visitante = { id: "20", team: { id: "20" } };

  function gol({ teamId, nombre, clock = "23'", type = "Goal", ownGoal, penaltyKick }) {
    return {
      scoringPlay: true,
      type: { text: type },
      clock: { displayValue: clock },
      team: { id: teamId },
      athletesInvolved: [{ shortName: nombre }],
      ownGoal,
      penaltyKick,
    };
  }

  test("reparte los goles por equipo y limpia el minuto", () => {
    const comp = {
      details: [
        gol({ teamId: "10", nombre: "L. Messi", clock: "23'" }),
        gol({ teamId: "20", nombre: "K. Mbappé", clock: "45'+2'" }),
        gol({ teamId: "10", nombre: "Á. Di María", clock: "78'" }),
      ],
    };
    const r = extraerGoleadores(comp, local, visitante);
    expect(r.local.map((g) => g.nombre)).toEqual(["L. Messi", "Á. Di María"]);
    expect(r.visitante.map((g) => g.nombre)).toEqual(["K. Mbappé"]);
    expect(r.local[0].minuto).toBe("23");
    expect(r.visitante[0].minuto).toBe("45+2");
  });

  test("marca penales y autogoles", () => {
    const comp = {
      details: [
        gol({ teamId: "10", nombre: "Penalista", type: "Penalty - Scored", penaltyKick: true }),
        gol({ teamId: "20", nombre: "Despistado", type: "Own Goal", ownGoal: true }),
      ],
    };
    const r = extraerGoleadores(comp, local, visitante);
    expect(r.local[0].penal).toBe(true);
    expect(r.visitante[0].autogol).toBe(true);
  });

  test("ignora jugadas que no son goles y sin detalles devuelve listas vacías", () => {
    const comp = {
      details: [
        { scoringPlay: false, athletesInvolved: [{ shortName: "Nadie" }] },
        { scoringPlay: true, team: { id: "10" }, athletesInvolved: [] },
      ],
    };
    const r = extraerGoleadores(comp, local, visitante);
    expect(r).toEqual({ local: [], visitante: [] });
    expect(extraerGoleadores({}, local, visitante)).toEqual({ local: [], visitante: [] });
  });
});
