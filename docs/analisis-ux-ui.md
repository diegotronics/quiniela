# Análisis UX/UI — La Copa Familiar 2026

Diagnóstico del sistema de diseño actual y hoja de ruta de mejoras visuales, organizada por esfuerzo e impacto.

Archivos clave revisados:

- [src/styles/globals.css](../src/styles/globals.css)
- [src/styles/theme.js](../src/styles/theme.js)
- [src/components/ui/Card.jsx](../src/components/ui/Card.jsx)
- [src/components/ui/Button.jsx](../src/components/ui/Button.jsx)
- [src/components/ui/Pill.jsx](../src/components/ui/Pill.jsx)
- [src/components/ui/MobileShell.jsx](../src/components/ui/MobileShell.jsx)
- [src/components/ui/Flag.jsx](../src/components/ui/Flag.jsx)
- [src/pages/Inicio.jsx](../src/pages/Inicio.jsx)
- [src/pages/Partidos.jsx](../src/pages/Partidos.jsx)
- [src/pages/TablaFamiliar.jsx](../src/pages/TablaFamiliar.jsx)

---

## Diagnóstico: por qué se siente insípida

El sistema actual cumple los principios "limpios" pero cae en varios anti-patrones clásicos que aplanan la personalidad:

1. **Paleta monocroma cálida + un único acento.** Todo el chrome (bg, surface, ink, line) vive en el rango `#F6F3EC → #14110D`. El verde acento (`oklch(0.52 0.13 148)`) aparece tan poco que el ojo nunca se ancla en él. Resultado: pantallas que se leen como "documento" más que como "app de fútbol".
2. **Bordes de 0.5px + shadow-1 casi inexistente.** Las cards no flotan ni se separan del fondo; compiten por contraste con un fondo que ya es casi blanco. Es la receta de la "interfaz fantasma" que describe *Refactoring UI*: la jerarquía se diluye.
3. **Densidad tipográfica plana.** Hay tres tamaños grandes (32, 44, 22) pero el cuerpo se mueve siempre entre 11–14px con peso 500/600. No hay "saltos" expresivos (display vs. cuerpo) que generen ritmo visual.
4. **Cero textura, motivos o ilustración.** El asset `.dotgrid` existe pero no se usa en pantallas principales. No hay íconos contextuales del torneo (balón, cancha, banderines), no hay banners gráficos, no hay imágenes de equipos.
5. **Falta de "estados emocionales".** Una app de quiniela necesita celebrar aciertos, marcar suspenso en partidos en vivo, transmitir urgencia cuando hay deadline. Hoy todo se comunica con Pills planos del mismo tamaño.
6. **Misma forma para todo.** Cards, pills, botones, list items usan radios similares (12–22) y el mismo `border + shadow`. No hay variedad de "tipos visuales" que el ojo aprenda a distinguir.
7. **El acento único es verde frío.** En contextos deportivos/familiares el verde "cancha" solo no transmite calidez ni adrenalina. Falta el complemento cálido (gold, coral) para destacar puntos, posiciones y ganadores — los tokens existen (`--gold`, `--coral`) pero apenas se usan.

---

## Hoja de ruta de mejoras (priorizada)

### Quick wins (alto impacto, bajo esfuerzo)

1. **Doblar la fuerza del sistema de sombra y bordes.** Eleva `--shadow-1` (p. ej. `0 1px 3px rgba(20,17,13,.08), 0 2px 8px rgba(20,17,13,.04)`) y sube bordes a `1px` con un `--line` ligeramente más oscuro. Las cards pasan de "fantasma" a "objeto físico".
2. **Activa los tokens cálidos que ya tenés.** Usa `--gold` para el líder de la tabla (medalla, número de posición), `--coral` para deadlines y partidos próximos, `--accent` solo para confirmaciones de pronóstico. Tres colores con rol semántico claro = jerarquía instantánea.
3. **Hero numérico con peso real.** El "44px / weight 600" de los puntos en [Inicio.jsx:249-255](../src/pages/Inicio.jsx#L249-L255) se siente tímido. Subilo a **64–72px / weight 700**, con `--accent` o gradiente sutil. Es el dato más importante de la app.
4. **Diferencia visualmente los Pills por tono.** Hoy todos son `999px` con padding idéntico. Que el Pill de "EN VIVO" tenga animación + uppercase + tracking; "Pronosticado" un check inline; "Pendiente" outline punteado. Crea micro-identidades.
5. **Pintá la TabBar activa.** En [MobileShell.jsx:124](../src/components/ui/MobileShell.jsx#L124) el tab activo solo cambia color de texto. Añade pill de fondo `--accent-soft` o un indicador superior de 3px en `--accent`. Es la convención iOS/Material y aporta orientación.
6. **Banderas más grandes y con sombra.** Las banderas (`28x20`, `44x32`) son las únicas imágenes reales de la app. Subilas a `52x36` en cards principales, agregá `box-shadow` sutil y borde `1px rgba(0,0,0,.08)` para que se sientan como cromos.

### Identidad y personalidad (mediano esfuerzo)

7. **Introducí un motivo gráfico recurrente.** El `.dotgrid` ya existe — úsalo como fondo del header del live match, en el hero de Inicio o detrás de la posición del usuario. Alternativa: líneas diagonales tipo cancha, o el motivo de césped en SVG muy sutil (`opacity: .04`).
8. **Tipografía display.** Geist es excelente para UI pero plana para titulares. Sumá una segunda familia para los números grandes y el branding: **"Geist Mono" con tracking negativo** (ya está cargada) para puntos/marcadores, o una display como Fraunces / Instrument Serif / Bricolage Grotesque para títulos H1. Crea contraste tipográfico que es la base del estilo "editorial-minimal" (Linear, Vercel, Arc).
9. **Color de acento dinámico por sección.** Cada tab puede tener un sub-color que tiñe headers y elementos clave: Inicio (accent verde), Bracket (gold), Partidos (ink), Tabla (coral), Perfil (neutral). Mantiene minimalismo pero da identidad a cada pantalla.
10. **Estados "vivos" con micro-interacción.** El `.live-dot` ya tiene pulso. Sumá:
    - Botón primario con hover-lift (`translateY(-1px)` + sombra mayor).
    - Cards con `transition: transform 200ms` y `:hover { transform: translateY(-2px) }`.
    - Confetti / scale-bounce cuando se guarda un pronóstico exacto.
11. **Avatar con anillo de estado.** En la TabBar y en headers, el avatar puede tener un anillo de color según racha actual o posición top-3. Funciona como medalla siempre visible.

### Patrones de UX/UI específicos para apps de quiniela/predicciones

12. **Progreso visible y celebrable.** La barra de progreso vs. líder en [Inicio.jsx:124-126](../src/pages/Inicio.jsx#L124-L126) está bien pero pasa desapercibida. Conviértela en un componente protagonista: 8px de alto, gradiente, etiqueta "82% del líder" encima.
13. **Cuenta regresiva al próximo partido.** Hoy mostrás la fecha. Sumá un countdown live (`2d 14h 32m`) en el bloque "Tu próximo pronóstico" — genera engagement diario.
14. **"Streak" como elemento gráfico, no número.** En vez de `MiniStat` con "🔥 3", usá un fuego SVG animado que crece con la racha. Es el patrón de Duolingo y funciona.
15. **Podio visual en la Tabla.** Para `top3` ([TablaFamiliar.jsx:84](../src/pages/TablaFamiliar.jsx#L84)) implementá un podio real (oro/plata/bronce con tres bloques de altura distinta, avatares grandes) antes del listado tabular. Es el patrón estándar en apps de competencia (Strava, Duolingo Leagues, Sorare).
16. **Skeleton loaders en vez de "Cargando partidos…".** Texto centrado se ve amateur. Esqueletos animados (caja gris con shimmer) son el estándar moderno.
17. **Empty states ilustrados.** "No hay partidos cargados todavía" merece un SVG pequeño (silbato, balón) + CTA. Refuerzan personalidad y son baratos.

### Sistema y consistencia (mayor esfuerzo, pero estructural)

18. **Definí escala de elevación de 4 niveles.** Hoy hay `--shadow-1/2/3` pero solo se usa `s1`. Asignale rol a cada uno: `s1` cards estándar, `s2` cards interactivas/hover, `s3` modales y bottom-sheets. Que se note la diferencia.
19. **Sistema de iconografía coherente.** Reemplazá íconos sueltos por un set único (Lucide, Phosphor, Tabler) con stroke consistente. Hoy los `Icon.*` se ven correctos pero no excepcionales.
20. **Componentes especializados.** Sacá `MatchCard`, `RankRow`, `LiveBadge`, `Countdown`, `StatTile` como componentes con variantes. Inlinear estilos por todos lados (`Inicio.jsx`, `Partidos.jsx`) está volviendo el código difícil de evolucionar visualmente.
21. **Modo oscuro.** Las variables CSS están listas para un toggle. Para una app que se abre de noche durante partidos, esto es prácticamente esperado en 2026.

---

## Referencias de estilo que vale la pena estudiar

- **Linear / Vercel / Arc** — minimalismo con personalidad: tipografía display, gradientes sutiles, sombras "ricas".
- **Sorare, OneFootball, FotMob** — UI de fútbol moderna: banderas como héroe, badges de equipo, marcadores en mono grande.
- **Robinhood, Cash App** — números grandes con peso editorial.
- **Duolingo, Strava** — gamificación visual (rachas, ligas, medallas) sin perder limpieza.
- **Apple Sports** — la referencia 2025 para "minimal + emocional" en apps de marcadores.

---

## Orden de implementación recomendado

Si querés empezar con un solo PR de alto impacto, recomendaría: **(1) refuerzo de sombras y bordes + (3) hero numérico más grande + (2) introducción de gold/coral semánticos + (15) podio en tabla**. Son cambios concentrados en 4–5 archivos y transforman radicalmente la percepción sin tocar arquitectura.

Después podés iterar en identidad gráfica (motivo, tipografía display, microinteracciones) en un segundo pase.

---

## Estado de implementación

| ID | Mejora | Estado |
|----|--------|--------|
| 1 | Sombras y bordes reforzados | ✅ Implementado |
| 2 | Tokens cálidos (gold/coral) con rol semántico | ✅ Implementado |
| 3 | Hero numérico con más peso | ✅ Implementado |
| 4 | Pills diferenciados por tono | ✅ Implementado |
| 5 | TabBar activa pintada | ✅ Implementado |
| 6 | Banderas más grandes con sombra tipo cromo | ✅ Implementado |
| 7 | Motivo gráfico recurrente | ⏳ Pendiente |
| 8 | Tipografía display secundaria | ⏳ Pendiente |
| 9 | Color de acento dinámico por sección | ⏳ Pendiente |
| 10 | Microinteracciones (hover-lift, confetti) | ⏳ Pendiente |
| 11 | Avatar con anillo de estado | ⏳ Pendiente |
| 12 | Barra de progreso protagonista | 🟡 Parcial (gradiente aplicado) |
| 13 | Countdown live al próximo partido | ⏳ Pendiente |
| 14 | Streak como elemento gráfico | ⏳ Pendiente |
| 15 | Podio visual en la Tabla | 🟡 Parcial (ya existe; falta altura diferencial) |
| 16 | Skeleton loaders | ⏳ Pendiente |
| 17 | Empty states ilustrados | ⏳ Pendiente |
| 18 | Escala de elevación de 4 niveles | 🟡 Parcial (`elevated` agregado a `Card`) |
| 19 | Sistema de iconografía unificado | ⏳ Pendiente |
| 20 | Componentes especializados (MatchCard, etc.) | ⏳ Pendiente |
| 21 | Modo oscuro | ⏳ Pendiente |
