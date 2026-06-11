// ============================================================
// /api/sync-partidos
//
// Función serverless de Vercel (Node 18+). Consulta el endpoint
// público de ESPN para el Mundial 2026 y, para cada partido
// terminado (STATUS_FINAL*), actualiza el partido correspondiente
// en Supabase con goles_local, goles_visitante y
// resultado_ingresado=true. El trigger `trg_partido_recalc`
// recalcula los puntos de todas las predicciones en cascada.
//
// ¿Por qué ESPN y no API-Football?
//   El plan free de API-Football solo cubre temporadas 2022-2024;
//   el Mundial 2026 requeriría plan pago. ESPN expone su endpoint
//   interno sin autenticación, cubre los 100 partidos en una sola
//   llamada y no tiene cuota documentada. Riesgo: es un endpoint
//   no oficial; puede romper sin aviso. Si rompe, hay que cambiar
//   de fuente (TheSportsDB o pagar API-Football).
//
// Variables de entorno requeridas:
//   SUPABASE_URL              — https://TUPROYECTO.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — service role key (NUNCA en el frontend)
//   CRON_SECRET               — string aleatorio largo (32+ caracteres)
//
// Auth: header `Authorization: Bearer ${CRON_SECRET}`.
//
// La primera ejecución hace match por nombre de equipos y guarda
// `api_fixture_id` (el id de ESPN) en cada partido para acelerar
// futuras corridas.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { ESPN_SCOREBOARD_URL, mapTeam } from '../src/lib/equiposEspn.js'

const ESPN_URL = `${ESPN_SCOREBOARD_URL}?dates=20260601-20260720`

// ESPN devuelve varios status. Tratamos como "terminado" todo lo que
// empiece con STATUS_FINAL (FINAL, FINAL_AET, FINAL_PEN, etc).
function isFinished(statusName) {
    return typeof statusName === 'string' && statusName.startsWith('STATUS_FINAL')
}

function isAuthorized(req) {
    const secret = process.env.CRON_SECRET
    if (!secret) return false
    const header = req.headers.authorization || ''
    return header === `Bearer ${secret}`
}

export default async function handler(req, res) {
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'unauthorized' })
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
            error: 'missing env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
        })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    })

    // 1) Bajar partidos actuales
    const { data: partidos, error: errPartidos } = await supabase
        .from('partidos')
        .select(
            'id, equipo_local, equipo_visitante, goles_local, goles_visitante, resultado_ingresado, api_fixture_id',
        )
    if (errPartidos) {
        return res.status(500).json({ error: `supabase: ${errPartidos.message}` })
    }

    // 2) Consultar ESPN
    const espnRes = await fetch(ESPN_URL)
    if (!espnRes.ok) {
        return res.status(502).json({ error: `espn: HTTP ${espnRes.status}` })
    }
    const espnJson = await espnRes.json()
    const events = espnJson.events || []

    // 3) Cruzar y actualizar
    const actualizados = []
    const ignorados = []
    const noEncontrados = []

    for (const ev of events) {
        const apiId = Number(ev.id)
        const comp = ev.competitions?.[0]
        if (!comp) continue
        const statusName = comp.status?.type?.name
        const competitors = comp.competitors || []
        const homeC = competitors.find((c) => c.homeAway === 'home')
        const awayC = competitors.find((c) => c.homeAway === 'away')
        if (!homeC || !awayC) continue

        const home = homeC.team?.displayName
        const away = awayC.team?.displayName
        const golesL = homeC.score == null ? null : Number(homeC.score)
        const golesV = awayC.score == null ? null : Number(awayC.score)

        if (!isFinished(statusName)) {
            ignorados.push({ apiId, statusName, motivo: 'no terminado' })
            continue
        }
        if (Number.isNaN(golesL) || Number.isNaN(golesV) || golesL == null || golesV == null) {
            ignorados.push({ apiId, statusName, motivo: 'goles invalidos' })
            continue
        }

        const homeEs = mapTeam(home)
        const awayEs = mapTeam(away)

        // Match: primero por api_fixture_id, luego por equipos
        let partido = partidos.find((p) => p.api_fixture_id === apiId)
        if (!partido) {
            partido = partidos.find(
                (p) =>
                    p.equipo_local === homeEs && p.equipo_visitante === awayEs,
            )
        }
        if (!partido) {
            noEncontrados.push({ apiId, home, away, homeEs, awayEs })
            continue
        }

        // Idempotencia: skip si ya está igual
        if (
            partido.resultado_ingresado &&
            partido.goles_local === golesL &&
            partido.goles_visitante === golesV &&
            partido.api_fixture_id === apiId
        ) {
            ignorados.push({ id: partido.id, motivo: 'sin cambios' })
            continue
        }

        const { error: errUpdate } = await supabase
            .from('partidos')
            .update({
                goles_local: golesL,
                goles_visitante: golesV,
                resultado_ingresado: true,
                api_fixture_id: apiId,
            })
            .eq('id', partido.id)
        if (errUpdate) {
            ignorados.push({
                id: partido.id,
                motivo: `update fallo: ${errUpdate.message}`,
            })
            continue
        }
        actualizados.push({
            id: partido.id,
            marcador: `${homeEs} ${golesL}-${golesV} ${awayEs}`,
        })
    }

    return res.status(200).json({
        ok: true,
        totalFixtures: events.length,
        actualizados: actualizados.length,
        ignorados: ignorados.length,
        noEncontrados: noEncontrados.length,
        detalleActualizados: actualizados,
        detalleNoEncontrados: noEncontrados,
    })
}
