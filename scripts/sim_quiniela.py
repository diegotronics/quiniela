#!/usr/bin/env python3
"""
Simulación Monte Carlo del sistema de puntos de "La Copa Familiar".

Objetivo: medir, con tasas de acierto realistas, cómo distintas
configuraciones de puntos afectan:
  1. El equilibrio entre fases (% del total por fase).
  2. La probabilidad de REMONTADA (que el campeón no fuese top tras grupos).
  3. La RETENCIÓN DE HABILIDAD (que el mejor pronosticador suele ganar).

No usa dependencias externas (solo random / statistics).
"""

import random
import statistics
from dataclasses import dataclass

random.seed(42)

# --- Estructura del torneo: (clave, nº de partidos) -------------------
FASES = [
    ("grupos",        72),
    ("dieciseisavos", 16),
    ("octavos",        8),
    ("cuartos",        4),
    ("semifinal",      2),
    ("tercerpuesto",   1),
    ("final",          1),
]
TOTAL_PARTIDOS = sum(n for _, n in FASES)  # 104


@dataclass
class Config:
    nombre: str
    # exacto/ganador por fase
    fase: dict          # {clave: (exacto, ganador)}
    # especiales: campeon, subcampeon, goleador, sorpresa
    esp: tuple

    def max_fase(self, clave):
        ex, _ = self.fase[clave]
        n = dict(FASES)[clave]
        return ex * n

    def max_total(self):
        m = sum(self.max_fase(c) for c, _ in FASES)
        return m + sum(self.esp)

    def max_post_grupos(self):
        m = sum(self.max_fase(c) for c, _ in FASES if c != "grupos")
        return m + sum(self.esp)


# ---------------------------------------------------------------------
# CONFIGURACIONES A COMPARAR
# ---------------------------------------------------------------------
CONFIGS = [
    Config(
        "ACTUAL",
        {
            "grupos":        (3, 1),
            "dieciseisavos": (4, 2),
            "octavos":       (5, 2),
            "cuartos":       (6, 3),
            "semifinal":     (8, 4),
            "tercerpuesto":  (6, 3),
            "final":         (15, 7),
        },
        (15, 10, 10, 6),
    ),
    Config(
        "EQUILIBRADO",  # baja peso de grupos, sube eliminatorias medias
        {
            "grupos":        (2, 1),
            "dieciseisavos": (4, 2),
            "octavos":       (6, 3),
            "cuartos":       (9, 4),
            "semifinal":     (12, 6),
            "tercerpuesto":  (8, 4),
            "final":         (20, 10),
        },
        (18, 12, 12, 8),
    ),
    Config(
        "ESCALADO",  # escalada fuerte hacia la final, grupos muy bajo
        {
            "grupos":        (2, 1),
            "dieciseisavos": (3, 1),
            "octavos":       (5, 2),
            "cuartos":       (8, 3),
            "semifinal":     (13, 5),
            "tercerpuesto":  (7, 3),
            "final":         (25, 10),
        },
        (20, 12, 10, 8),
    ),
    Config(
        "ESTANDAR",  # patrón tipo Kicktipp/ESPN: grupos ~33%, escalada suave
        {
            "grupos":        (2, 1),
            "dieciseisavos": (4, 2),
            "octavos":       (6, 2),
            "cuartos":       (8, 3),
            "semifinal":     (11, 4),
            "tercerpuesto":  (6, 2),
            "final":         (16, 6),
        },
        (16, 10, 10, 6),
    ),
]


# ---------------------------------------------------------------------
# Modelo de jugador y simulación de una temporada
# ---------------------------------------------------------------------
@dataclass
class Jugador:
    skill: float        # 0..1
    p_dir: float        # prob. de acertar dirección (1X2)
    p_exact_cond: float # prob. de marcador exacto DADO que acertó dirección


def nuevo_jugador():
    s = random.random()
    # rangos realistas en quinielas de fútbol
    p_dir = 0.40 + 0.22 * s            # 0.40 .. 0.62
    p_exact_cond = 0.14 + 0.20 * s     # 0.14 .. 0.34  (=> exacto global ~6%..21%)
    return Jugador(s, p_dir, p_exact_cond)


def resultado_partido(j: Jugador):
    """Devuelve 'exacto', 'ganador' o 'fallo' para un partido."""
    if random.random() < j.p_dir:
        if random.random() < j.p_exact_cond:
            return "exacto"
        return "ganador"
    return "fallo"


def puntos_de(res, exacto, ganador):
    if res == "exacto":
        return exacto
    if res == "ganador":
        return ganador
    return 0


def simular_temporada(cfg: Config, n_jug=20):
    jugadores = [nuevo_jugador() for _ in range(n_jug)]
    pts_grupos = [0] * n_jug
    pts_resto = [0] * n_jug

    for clave, npart in FASES:
        ex, ga = cfg.fase[clave]
        for _ in range(npart):
            for i, j in enumerate(jugadores):
                p = puntos_de(resultado_partido(j), ex, ga)
                if clave == "grupos":
                    pts_grupos[i] += p
                else:
                    pts_resto[i] += p

    # Apuestas especiales: aciertos correlacionados con skill (1 sola jugada)
    pts_esp = [0] * n_jug
    pesos = cfg.esp
    # prob. de acertar cada especial escala con skill (favoritos ~ más fáciles)
    base_prob = [0.30, 0.25, 0.18, 0.12]  # campeon, subcampeon, goleador, sorpresa
    for i, j in enumerate(jugadores):
        for k, w in enumerate(pesos):
            prob = base_prob[k] * (0.5 + j.skill)  # 0.5x .. 1.5x según skill
            if random.random() < prob:
                pts_esp[i] += w

    total = [pts_grupos[i] + pts_resto[i] + pts_esp[i] for i in range(n_jug)]
    return jugadores, pts_grupos, total


def ranking(vals):
    """Posiciones 1=mejor. Devuelve lista de rangos por índice de jugador."""
    orden = sorted(range(len(vals)), key=lambda i: -vals[i])
    rango = [0] * len(vals)
    for pos, i in enumerate(orden):
        rango[i] = pos + 1
    return rango


def spearman(a, b):
    ra, rb = ranking(a), ranking(b)
    n = len(a)
    d2 = sum((ra[i] - rb[i]) ** 2 for i in range(n))
    return 1 - (6 * d2) / (n * (n * n - 1))


# ---------------------------------------------------------------------
# Evaluación
# ---------------------------------------------------------------------
def evaluar(cfg: Config, n_temporadas=4000, n_jug=20):
    remonta_desde_mitad_baja = 0   # campeón estaba en mitad inferior tras grupos
    remonta_fuera_top3 = 0         # campeón fuera del top-3 tras grupos
    corr_grupos_final = []         # Spearman(rank grupos, rank final): menor = más remontada
    corr_skill_final = []          # Spearman(skill, rank final): mayor = más justo
    deficit_remontado = []         # ventaja en pts que el campeón tenía EN CONTRA tras grupos

    for _ in range(n_temporadas):
        jug, pg, tot = simular_temporada(cfg, n_jug)
        rank_g = ranking(pg)
        rank_t = ranking(tot)
        campeon = rank_t.index(1)  # índice del jugador con rank final 1

        if rank_g[campeon] > n_jug / 2:
            remonta_desde_mitad_baja += 1
        if rank_g[campeon] > 3:
            remonta_fuera_top3 += 1

        # déficit tras grupos respecto al líder de grupos
        lider_g = pg[rank_g.index(1)]
        deficit_remontado.append(lider_g - pg[campeon])

        corr_grupos_final.append(spearman(pg, tot))
        skills = [j.skill for j in jug]
        # rank final invertido para correlacionar con skill (skill alto -> tot alto)
        corr_skill_final.append(spearman(skills, tot))

    n = n_temporadas
    return {
        "max_total": cfg.max_total(),
        "pct_grupos": 100 * cfg.max_fase("grupos") / cfg.max_total(),
        "pct_post": 100 * cfg.max_post_grupos() / cfg.max_total(),
        "remonta_mitad_baja_%": 100 * remonta_desde_mitad_baja / n,
        "remonta_fuera_top3_%": 100 * remonta_fuera_top3 / n,
        "deficit_medio_remontado": statistics.mean(deficit_remontado),
        "deficit_max_remontado": max(deficit_remontado),
        "corr_grupos_final": statistics.mean(corr_grupos_final),
        "corr_skill_final": statistics.mean(corr_skill_final),
    }


def barra(pct, ancho=24):
    n = round(pct / 100 * ancho)
    return "█" * n + "·" * (ancho - n)


print(f"Torneo: {TOTAL_PARTIDOS} partidos + 4 apuestas especiales\n")
print("Distribución de puntos por fase (máximo teórico):")
print(f"{'Fase':<16}{'partidos':>9}", end="")
for cfg in CONFIGS:
    print(f"{cfg.nombre:>14}", end="")
print()
for clave, npart in FASES:
    print(f"{clave:<16}{npart:>9}", end="")
    for cfg in CONFIGS:
        print(f"{cfg.max_fase(clave):>14}", end="")
    print()
print(f"{'especiales':<16}{'4':>9}", end="")
for cfg in CONFIGS:
    print(f"{sum(cfg.esp):>14}", end="")
print()
print(f"{'TOTAL':<16}{'':>9}", end="")
for cfg in CONFIGS:
    print(f"{cfg.max_total():>14}", end="")
print("\n")

print("=" * 92)
print("RESULTADOS DE LA SIMULACIÓN (4000 temporadas, 20 jugadores c/u)")
print("=" * 92)
resultados = {}
for cfg in CONFIGS:
    r = evaluar(cfg)
    resultados[cfg.nombre] = r
    print(f"\n### {cfg.nombre}   (total máx = {r['max_total']} pts)")
    print(f"  Peso fase de grupos : {r['pct_grupos']:5.1f}%  {barra(r['pct_grupos'])}")
    print(f"  Puntos post-grupos  : {r['pct_post']:5.1f}%  {barra(r['pct_post'])}")
    print(f"  Campeón salió de mitad INFERIOR tras grupos : {r['remonta_mitad_baja_%']:5.1f}%")
    print(f"  Campeón salió FUERA del top-3 tras grupos    : {r['remonta_fuera_top3_%']:5.1f}%")
    print(f"  Déficit medio remontado por el campeón       : {r['deficit_medio_remontado']:5.1f} pts")
    print(f"  Déficit MÁX remontado (caso extremo)         : {r['deficit_max_remontado']:5.0f} pts")
    print(f"  Corr. rank grupos→final (menor = + remontada): {r['corr_grupos_final']:5.2f}")
    print(f"  Corr. skill→final (mayor = + justo)          : {r['corr_skill_final']:5.2f}")

print("\n" + "=" * 92)
print("LECTURA RÁPIDA")
print("=" * 92)
print(f"{'config':<14}{'%grupos':>9}{'remonta<top3':>14}{'justicia':>10}{'remontable':>12}")
for nombre, r in resultados.items():
    print(f"{nombre:<14}{r['pct_grupos']:>8.1f}%{r['remonta_fuera_top3_%']:>13.1f}%"
          f"{r['corr_skill_final']:>10.2f}{r['remonta_mitad_baja_%']:>11.1f}%")


# ---------------------------------------------------------------------
# ROBUSTEZ: ¿se sostiene la conclusión con distinto nº de jugadores
# y distinta dispersión de habilidad?
# ---------------------------------------------------------------------
print("\n" + "=" * 92)
print("ROBUSTEZ — ACTUAL vs ESTANDAR (campeón desde mitad inferior tras grupos, %)")
print("=" * 92)
print(f"{'escenario':<28}{'ACTUAL':>12}{'ESTANDAR':>12}")
actual = CONFIGS[0]
estandar = CONFIGS[3]
for n_jug in (8, 15, 30):
    for _ in [1]:
        ra = evaluar(actual, n_temporadas=2500, n_jug=n_jug)
        re = evaluar(estandar, n_temporadas=2500, n_jug=n_jug)
        print(f"{'jugadores=' + str(n_jug):<28}"
              f"{ra['remonta_mitad_baja_%']:>11.1f}%{re['remonta_mitad_baja_%']:>11.1f}%")
