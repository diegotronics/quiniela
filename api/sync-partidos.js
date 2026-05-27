// ============================================================
// /api/sync-partidos
//
// Función serverless de Vercel (Node 18+). Consulta API-Football
// (league=1, season=2026) y trae los fixtures terminados del
// Mundial 2026. Para cada fixture FT/AET/PEN actualiza el partido
// correspondiente en Supabase con goles_local, goles_visitante y
// resultado_ingresado=true. El trigger `trg_partido_recalc`
// recalcula los puntos de todas las predicciones en cascada.
//
// Variables de entorno requeridas (Vercel → Project Settings →
// Environment Variables):
//   SUPABASE_URL              — https://TUPROYECTO.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — service role key (NUNCA en el frontend)
//   API_FOOTBALL_KEY          — key de https://www.api-football.com
//   CRON_SECRET               — string aleatorio largo (32+ caracteres)
//
// Auth:
//   - Vercel Cron envía automáticamente `Authorization: Bearer ${CRON_SECRET}`.
//   - Crons externos (cron-job.org, etc.) y disparo manual deben enviar
//     el mismo header. Cualquier otra llamada → 401.
//
// La primera ejecución hace match por nombre de equipos y guarda
// `api_fixture_id` en cada partido para acelerar futuras corridas.
// ============================================================

import { createClient } from '@supabase/supabase-js'

const API_BASE = 'https://v3.football.api-sports.io'
const LEAGUE_ID = 1 // FIFA World Cup en API-Football
const SEASON = 2026

// Mapeo de nombres de API-Football (inglés) → nombres en nuestra BD (español)
const TEAM_MAP = {
    mexico: 'México',
    'south africa': 'Sudáfrica',
    'south korea': 'Corea del Sur',
    'korea republic': 'Corea del Sur',
    'czech republic': 'Chequia',
    czechia: 'Chequia',
    canada: 'Canadá',
    'bosnia and herzegovina': 'Bosnia y Herzegovina',
    bosnia: 'Bosnia y Herzegovina',
    qatar: 'Qatar',
    switzerland: 'Suiza',
    brazil: 'Brasil',
    morocco: 'Marruecos',
    haiti: 'Haití',
    scotland: 'Escocia',
    'united states': 'EEUU',
    usa: 'EEUU',
    paraguay: 'Paraguay',
    australia: 'Australia',
    turkey: 'Turquía',
    turkiye: 'Turquía',
    germany: 'Alemania',
    curacao: 'Curazao',
    'ivory coast': 'Costa de Marfil',
    "cote d'ivoire": 'Costa de Marfil',
    ecuador: 'Ecuador',
    netherlands: 'Holanda',
    japan: 'Japón',
    sweden: 'Suecia',
    tunisia: 'Túnez',
    belgium: 'Bélgica',
    egypt: 'Egipto',
    iran: 'Irán',
    'new zealand': 'Nueva Zelanda',
    spain: 'España',
    'cape verde': 'Cabo Verde',
    'cabo verde': 'Cabo Verde',
    'saudi arabia': 'Arabia Saudita',
    uruguay: 'Uruguay',
    france: 'Francia',
    senegal: 'Senegal',
    iraq: 'Irak',
    norway: 'Noruega',
    argentina: 'Argentina',
    algeria: 'Argelia',
    austria: 'Austria',
    jordan: 'Jordania',
    portugal: 'Portugal',
    'dr congo': 'RD Congo',
    'congo dr': 'RD Congo',
    'democratic republic of the congo': 'RD Congo',
    'democratic republic of congo': 'RD Congo',
    uzbekistan: 'Uzbekistán',
    colombia: 'Colombia',
    england: 'Inglaterra',
    croatia: 'Croacia',
    ghana: 'Ghana',
    panama: 'Panamá',
}

// Estados de API-Football que indican partido terminado
const STATUS_FINISHED = new Set(['FT', 'AET', 'PEN'])

function normalize(s) {
    return (s || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // quita diacríticos combinantes
        .toLowerCase()
        .trim()
}

function mapTeam(apiName) {
    const key = normalize(apiName)
    return TEAM_MAP[key] || apiName
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

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, API_FOOTBALL_KEY } =
        process.env
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !API_FOOTBALL_KEY) {
        return res
            .status(500)
            .json({ error: 'missing env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / API_FOOTBALL_KEY)' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    })

    // 1) Bajar todos los partidos de nuestra BD (solo grupos por ahora)
    const { data: partidos, error: errPartidos } = await supabase
        .from('partidos')
        .select(
            'id, equipo_local, equipo_visitante, goles_local, goles_visitante, resultado_ingresado, api_fixture_id',
        )
    if (errPartidos) {
        return res.status(500).json({ error: `supabase: ${errPartidos.message}` })
    }

    // 2) Consultar API-Football
    const apiUrl = `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}`
    const apiRes = await fetch(apiUrl, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
    })
    if (!apiRes.ok) {
        return res
            .status(502)
            .json({ error: `api-football: HTTP ${apiRes.status}` })
    }
    const apiJson = await apiRes.json()
    const fixtures = apiJson.response || []

    // 3) Cruzar y actualizar
    const actualizados = []
    const ignorados = []
    const noEncontrados = []

    for (const fx of fixtures) {
        const apiId = fx.fixture?.id
        const status = fx.fixture?.status?.short
        const home = fx.teams?.home?.name
        const away = fx.teams?.away?.name
        const golesL = fx.goals?.home
        const golesV = fx.goals?.away

        if (!STATUS_FINISHED.has(status)) {
            ignorados.push({ apiId, status, motivo: 'no terminado' })
            continue
        }
        if (golesL == null || golesV == null) {
            ignorados.push({ apiId, status, motivo: 'goles null' })
            continue
        }

        const homeEs = mapTeam(home)
        const awayEs = mapTeam(away)

        // Match: primero por api_fixture_id, luego por equipos
        let partido = partidos.find((p) => p.api_fixture_id === apiId)
        if (!partido) {
            partido = partidos.find(
                (p) =>
                    p.equipo_local === homeEs &&
                    p.equipo_visitante === awayEs,
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
        totalFixtures: fixtures.length,
        actualizados: actualizados.length,
        ignorados: ignorados.length,
        noEncontrados: noEncontrados.length,
        detalleActualizados: actualizados,
        detalleNoEncontrados: noEncontrados,
    })
}
