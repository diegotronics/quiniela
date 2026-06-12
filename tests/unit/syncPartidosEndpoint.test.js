import { beforeEach, describe, expect, test, vi } from "vitest";

// Estado compartido del Supabase falso, configurable por test.
const state = { gateOk: true, partidos: [], updates: [] };

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from(table) {
      if (table === "sync_partidos_estado") {
        const chain = {
          update: () => chain,
          eq: () => chain,
          lt: () => chain,
          select: async () => ({
            data: state.gateOk ? [{ id: "global" }] : [],
            error: null,
          }),
        };
        return chain;
      }
      if (table === "partidos") {
        return {
          select: async () => ({ data: state.partidos, error: null }),
          update: (patch) => ({
            eq: async (_col, id) => {
              state.updates.push({ id, patch });
              return { error: null };
            },
          }),
        };
      }
      throw new Error(`tabla inesperada: ${table}`);
    },
  }),
}));

import handler from "../../api/sync-partidos.js";

const SECRET = "secreto-de-prueba";

function eventoEspn({ id, home, away, homeScore, awayScore, statusName, completed }) {
  return {
    id,
    competitions: [
      {
        status: { type: { name: statusName, completed } },
        competitors: [
          { homeAway: "home", team: { displayName: home }, score: homeScore },
          { homeAway: "away", team: { displayName: away }, score: awayScore },
        ],
      },
    ],
  };
}

function makeReq({ method = "GET", auth } = {}) {
  return { method, headers: auth ? { authorization: auth } : {} };
}

function makeRes() {
  const r = { statusCode: null, body: null };
  r.status = (code) => {
    r.statusCode = code;
    return r;
  };
  r.json = (body) => {
    r.body = body;
    return r;
  };
  return r;
}

beforeEach(() => {
  state.gateOk = true;
  state.updates = [];
  state.partidos = [
    {
      id: "p1",
      equipo_local: "México",
      equipo_visitante: "Sudáfrica",
      goles_local: null,
      goles_visitante: null,
      resultado_ingresado: false,
      api_fixture_id: null,
    },
  ];
  process.env.SUPABASE_URL = "http://supabase.local";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
  process.env.CRON_SECRET = SECRET;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        events: [
          eventoEspn({
            id: "777",
            home: "Mexico",
            away: "South Africa",
            homeScore: "2",
            awayScore: "1",
            statusName: "STATUS_FINAL",
          }),
        ],
      }),
    })),
  );
});

describe("/api/sync-partidos", () => {
  test("GET sin secreto → 401 y no toca nada", async () => {
    const res = makeRes();
    await handler(makeReq({ method: "GET" }), res);
    expect(res.statusCode).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(state.updates).toEqual([]);
  });

  test("POST público con cooldown vigente → 429 sin consultar ESPN", async () => {
    state.gateOk = false;
    const res = makeRes();
    await handler(makeReq({ method: "POST" }), res);
    expect(res.statusCode).toBe(429);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(state.updates).toEqual([]);
  });

  test("POST público con cooldown vencido → sincroniza el partido terminado", async () => {
    const res = makeRes();
    await handler(makeReq({ method: "POST" }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.actualizados).toBe(1);
    expect(state.updates).toEqual([
      {
        id: "p1",
        patch: {
          goles_local: 2,
          goles_visitante: 1,
          resultado_ingresado: true,
          api_fixture_id: 777,
        },
      },
    ]);
  });

  test("los partidos aún en juego no se guardan", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          eventoEspn({
            id: "777",
            home: "Mexico",
            away: "South Africa",
            homeScore: "1",
            awayScore: "0",
            statusName: "STATUS_IN_PROGRESS",
            completed: false,
          }),
        ],
      }),
    });
    const res = makeRes();
    await handler(makeReq({ method: "POST" }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.actualizados).toBe(0);
    expect(state.updates).toEqual([]);
  });

  test("STATUS_FULL_TIME (el final normal en fútbol) sí se guarda", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          eventoEspn({
            id: "777",
            home: "Canada",
            away: "Bosnia-Herzegovina",
            homeScore: "1",
            awayScore: "1",
            statusName: "STATUS_FULL_TIME",
            completed: true,
          }),
        ],
      }),
    });
    state.partidos = [
      {
        id: "B1",
        equipo_local: "Canadá",
        equipo_visitante: "Bosnia y Herzegovina",
        goles_local: null,
        goles_visitante: null,
        resultado_ingresado: false,
        api_fixture_id: null,
      },
    ];
    const res = makeRes();
    await handler(makeReq({ method: "POST" }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.actualizados).toBe(1);
    expect(state.updates).toEqual([
      {
        id: "B1",
        patch: {
          goles_local: 1,
          goles_visitante: 1,
          resultado_ingresado: true,
          api_fixture_id: 777,
        },
      },
    ]);
  });

  test("completed=true basta aunque el nombre del status sea otro", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          eventoEspn({
            id: "777",
            home: "Mexico",
            away: "South Africa",
            homeScore: "2",
            awayScore: "1",
            statusName: "STATUS_ALGO_NUEVO",
            completed: true,
          }),
        ],
      }),
    });
    const res = makeRes();
    await handler(makeReq({ method: "POST" }), res);
    expect(res.body.actualizados).toBe(1);
  });

  test("un partido cancelado (post pero no completado) no se guarda", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          eventoEspn({
            id: "777",
            home: "Mexico",
            away: "South Africa",
            homeScore: "0",
            awayScore: "0",
            statusName: "STATUS_CANCELED",
            completed: false,
          }),
        ],
      }),
    });
    const res = makeRes();
    await handler(makeReq({ method: "POST" }), res);
    expect(res.body.actualizados).toBe(0);
    expect(state.updates).toEqual([]);
  });

  test("el cron con secreto no pasa por el cooldown", async () => {
    state.gateOk = false; // el candado diría "espera"…
    const res = makeRes();
    await handler(
      makeReq({ method: "GET", auth: `Bearer ${SECRET}` }),
      res,
    );
    // …pero el cron entra igual y sincroniza.
    expect(res.statusCode).toBe(200);
    expect(res.body.actualizados).toBe(1);
  });

  test("resultado ya sincronizado es idempotente (sin cambios)", async () => {
    state.partidos[0] = {
      ...state.partidos[0],
      goles_local: 2,
      goles_visitante: 1,
      resultado_ingresado: true,
      api_fixture_id: 777,
    };
    const res = makeRes();
    await handler(makeReq({ method: "POST" }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.actualizados).toBe(0);
    expect(state.updates).toEqual([]);
  });
});
