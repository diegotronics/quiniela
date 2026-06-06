#!/usr/bin/env python3
"""Sensibilidad: ¿cuánto cambia la remontada segun como modelemos las especiales?
Reusa la maquinaria de sim_quiniela pero varia la correlacion especiales<->skill."""
import random, statistics
from sim_quiniela import (FASES, Config, CONFIGS, nuevo_jugador, resultado_partido,
                          puntos_de, ranking)

def simular(cfg, n_jug, modo_esp):
    jug = [nuevo_jugador() for _ in range(n_jug)]
    pg = [0]*n_jug; pr = [0]*n_jug
    for clave, npart in FASES:
        ex, ga = cfg.fase[clave]
        for _ in range(npart):
            for i, j in enumerate(jug):
                p = puntos_de(resultado_partido(j), ex, ga)
                if clave == "grupos": pg[i]+=p
                else: pr[i]+=p
    pe = [0]*n_jug
    base = [0.30,0.25,0.18,0.12]
    for i, j in enumerate(jug):
        for k, w in enumerate(cfg.esp):
            if modo_esp == "suerte":      prob = base[k]            # igual para todos
            elif modo_esp == "correlado": prob = base[k]*(0.5+j.skill)  # mi modelo original
            elif modo_esp == "habilidad": prob = base[k]*(2*j.skill)    # fuerte con skill
            if random.random() < prob: pe[i]+=w
    tot = [pg[i]+pr[i]+pe[i] for i in range(n_jug)]
    return pg, tot

def remonta(cfg, modo, n_temp=4000, n_jug=20):
    baja=0
    for _ in range(n_temp):
        pg, tot = simular(cfg, n_jug, modo)
        camp = ranking(tot).index(1)
        if ranking(pg)[camp] > n_jug/2: baja+=1
    return 100*baja/n_temp

random.seed(7)
actual, estandar = CONFIGS[0], CONFIGS[3]
print(f"{'modelo de especiales':<42}{'ACTUAL':>10}{'ESTANDAR':>10}")
print("-"*62)
for modo, desc in [("sin","SIN especiales (0 pts)"),
                   ("suerte","especiales = pura SUERTE (indep. skill)"),
                   ("correlado","especiales correladas con skill (mi modelo)"),
                   ("habilidad","especiales = fuerte HABILIDAD")]:
    if modo == "sin":
        # truco: copia config con especiales en 0
        from dataclasses import replace
        a = remonta(replace(actual, esp=(0,0,0,0)), "suerte")
        e = remonta(replace(estandar, esp=(0,0,0,0)), "suerte")
    else:
        a = remonta(actual, modo); e = remonta(estandar, modo)
    print(f"{desc:<42}{a:>9.1f}%{e:>9.1f}%")
