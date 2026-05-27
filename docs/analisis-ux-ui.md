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

## Sistema de microinteracciones (punto 10)

Implementado como capa transversal en `globals.css` + helpers en `src/lib/celebrate.js` y `src/hooks/useCountUp.js`.

**Foundation CSS** ([globals.css:188-380](../src/styles/globals.css))

- `.card-interactive`, `.btn-interactive`, `.chip-interactive`, `.icon-tap` — hover-lift en desktop + press scale en mobile (`:active`).
- `.win-mark`, `.score-reveal`, `.bounce`, `.breathe-live`, `.breathe-gold`, `.podium-rise`, `.stagger-item`, `.trophy-rise`, `.sparkle`, `.save-check`, `.hover-chevron`, `.section-action`, `.flag-hoverable` — keyframes nombrados `lcf*`.
- `@media (prefers-reduced-motion: reduce)` desactiva transforms y reduce duración a 0.01ms para usuarios sensibles.

**Confetti — `canvas-confetti`** (~6 KB gzip, [src/lib/celebrate.js](../src/lib/celebrate.js))

Cuatro presets con paletas semánticas:

- `celebrateExact()` — dispara al ver un partido finalizado donde el pronóstico coincidió exacto. Triple burst (centro + esquinas) + vibración háptica.
- `celebrateWin()` — burst breve cuando el pronóstico ganó pero no fue exacto.
- `celebrateChampion()` — burst sostenido durante 1.4 s cuando el usuario acertó al campeón del torneo. Combina con el componente `<ChampionReveal>`.
- `celebratePodium()` — al ver la tabla y estar en top 3.

Cada celebración se cachea con `celebrateOnce(key, fn)` para no dispararse repetidamente.

**Trofeo SVG + sparkles** ([ChampionReveal.jsx](../src/components/ui/ChampionReveal.jsx))

Componente puro SVG/CSS sin dependencias. Trofeo con gradiente dorado, asas, estrella central, base. Los `<Sparkles>` orbitan con delays escalonados. Se monta dentro de la card de campeón del bracket cuando coincide la predicción del usuario con el resultado real.

**Winner reveal estilo Google**

Cada partido finalizado destaca al ganador en tres pantallas:

- [Partidos.jsx](../src/pages/Partidos.jsx): `TeamRow` con peso 800, check `.win-mark` y opacidad 0.55 en perdedor. Score con color `--accent-ink` en el ganador y `--ink-3` en el perdedor.
- [MatchDetail.jsx](../src/pages/MatchDetail.jsx): `HeaderTeam` con check en círculo accent sobre la bandera del ganador. Pill cambia a "Empate" en `--gold` si goles_local = goles_visitante.
- [Bracket.jsx](../src/pages/Bracket.jsx) `BracketMatch`: ganador en `--ink` puro con check animado; perdedor a opacidad 0.55.

Todo se anima en la entrada con `lcfWinReveal` + `lcfScoreReveal` (~400 ms cubic-bezier).

**Count-up**

`useCountUp(target, { duration })` en [useCountUp.js](../src/hooks/useCountUp.js) — easing cúbico de salida. Aplicado a los puntos y posición de [Inicio.jsx](../src/pages/Inicio.jsx).

**Estados live**

Live card en Inicio con `.breathe-live` (box-shadow pulsante en `--danger`). Goles que cambian disparan `.bounce` (240 ms) por dígito.

**Save button**

[MatchDetail.jsx](../src/pages/MatchDetail.jsx) — el botón "Guardar pronóstico" pasa por `[Spinner + Guardando…] → [✓ Pronóstico guardado]` con `.save-check` y fondo `--accent-ink` momentáneo.

---

## Engagement diario y celebración del progreso (puntos 12-15)

Cuarta iteración: convertir la barra de progreso, el bloque "próximo pronóstico", el contador de racha y el podio en elementos visualmente protagonistas.

**Barra de progreso protagonista — punto 12** ([Inicio.jsx](../src/pages/Inicio.jsx))

- Altura subida de 6px a 10px, radio 999, con sombra interna sutil para que se sienta como un canal físico.
- Etiqueta superior `"82% del líder"` en mono con `--accent-ink`; cambia a `"100% — Sos el líder"` en `--gold-ink` cuando el usuario es 1°.
- Gradiente diferente según contexto: `accent → gold` para perseguidores, `gold → gold-ink` para el líder.
- Animación `lcfProgressFill` (scaleX) al montar + clase `shine` reutilizada para barrido luminoso periódico.
- `box-shadow` con `color-mix` del propio gradiente para que la barra "irradie".

**Countdown live — punto 13** ([useCountdown.js](../src/hooks/useCountdown.js), [Countdown.jsx](../src/components/ui/Countdown.jsx))

- Nuevo hook `useCountdown(targetIso)` que retorna `{ days, hours, minutes, seconds, expired, total }` y se actualiza cada segundo (intervalo solo activo si hay target).
- Componente `<Countdown>` con dos variantes: `compact` (inline, para listas) y default (display grande con unidades separadas).
- Color escalonado por urgencia: gris (>24h), `--coral-ink` (<24h), `--danger` + pulso (`countdown-tick`) cuando faltan <1h. Estado `expired` muestra pill animado "Comenzó".
- Segundos solo se renderizan cuando faltan <1 día — evita re-render constante en partidos lejanos.
- Integrado como bloque protagonista en "Tu próximo pronóstico" reemplazando la fecha estática anterior.

**Streak como elemento gráfico — punto 14** ([StreakFlame.jsx](../src/components/ui/StreakFlame.jsx))

- SVG de llama puro (sin dependencias) con cuerpo + núcleo + brillo en gradientes lineales.
- Cuatro tiers escalonados por valor de racha:
  - `0` → ember gris (sin racha)
  - `1-2` → llama dorada chica
  - `3-5` → llama coral mediana + glow pulsante (`flame-glow`)
  - `6+` → llama grande + glow intenso + 3 chispas orbitando (`flame-ember`)
- Cuerpo de la llama anima con `lcfFlameFlicker` (scaleY/scaleX alternados) emulando parpadeo real.
- Reemplaza el `MiniStat` "🔥 3" anterior por una `StreakCard` que dedica el lado izquierdo del grid a la llama protagonista + número grande en mono; el lado derecho mantiene "Aciertos" y "Exactos" apilados.
- Color de fondo cambia a `--coral-soft` cuando hay racha activa y la card recibe `--shadow-coral` en tier máximo.

**Podio con altura diferencial — punto 15** ([TablaFamiliar.jsx](../src/pages/TablaFamiliar.jsx))

- Rediseño completo de `PodiumCard` separando bloque del jugador (avatar + nombre + puntos) y pedestal sólido debajo.
- Pedestales con altura real distinta — 1° = 76px, 2° = 52px, 3° = 34px — y `alignItems: end` en el grid contenedor para que el 1° quede físicamente más alto.
- Cada pedestal usa gradiente metálico propio (oro, plata, bronce) + brillo superior translúcido + número romano (I/II/III) en mono grande con `textShadow`.
- Avatares más grandes y diferenciados — 72px para 1°, 56px para 2°/3° — manteniendo el anillo gold/silver/bronze.
- Animación de entrada en dos fases: `lcfPodiumRise` (jugador) + `lcfPodiumPedestal` (pedestal con scaleY desde abajo) con delays escalonados (0/120/260ms + 80ms para el pedestal).
- Pill "Vos" en `--accent-soft` reemplaza el texto plano cuando el usuario es uno de los tres.
- Corona dorada flotante sobre el 1° con `drop-shadow` y animación `trophy-rise`.

---

## Sistema y consistencia (puntos 16-19)

Quinta iteración: profesionalizar los estados de carga, vacío, la escala de elevación y la iconografía.

**Skeleton loaders — punto 16** ([Skeleton.jsx](../src/components/ui/Skeleton.jsx))

- Animación base `lcfShimmer` en [globals.css](../src/styles/globals.css) — gradiente diagonal que barre la caja gris cada 1.4 s. Se desactiva con `prefers-reduced-motion`.
- Primitiva `<Skeleton w h r />` + variantes especializadas:
  - `<SkeletonText lines lastWidth>` — bloque de texto multilínea con última línea más corta.
  - `<SkeletonMatchCard>` y `<SkeletonMatchList>` — emulan la `Card` de partido con pill, equipos, banderas y marcador.
  - `<SkeletonRankRow>` — fila de tabla familiar con rank + avatar + nombre + puntos.
  - `<SkeletonPodium>` — tres columnas con altura diferencial que reflejan la silueta real del podio.
  - `<SkeletonMatchHeader>` — cabecera del detalle de partido (pill + dos equipos + marcador).
  - `<SkeletonChatMessages count>` — burbujas alternadas izquierda/derecha con anchos pseudoaleatorios.
- Reemplazos aplicados en: [Partidos.jsx](../src/pages/Partidos.jsx), [TablaFamiliar.jsx](../src/pages/TablaFamiliar.jsx) (podio + rows), [MatchDetail.jsx](../src/pages/MatchDetail.jsx), [ChatPanel.jsx](../src/components/chat/ChatPanel.jsx), [ChatPreview.jsx](../src/components/chat/ChatPreview.jsx), [ApuestasEspeciales.jsx](../src/pages/ApuestasEspeciales.jsx), [admin/AdminReglas.jsx](../src/pages/admin/AdminReglas.jsx).

**Empty states ilustrados — punto 17** ([EmptyState.jsx](../src/components/ui/EmptyState.jsx))

- Componente `<EmptyState illustration title description cta compact />` con borde dashed, sombra `s0` y animación `empty-illu` (flotación + leve rotación).
- Seis ilustraciones SVG puras sin dependencias, todas en viewBox `96×96` y con paleta basada en tokens del sistema:
  - `whistle` — silbato cromo dentro de un círculo cálido (para listas de partidos vacías).
  - `ball` — pelota de fútbol con paneles geométricos.
  - `trophy` — copa dorada con base, gradiente `gold-soft`.
  - `chat` — burbuja con tres puntos en accent verde.
  - `envelope` — sobre con sello coral (para invitaciones vacías).
  - `cal` — calendario con check (para vistas de admin vacías).
- Reemplazos aplicados en: [Partidos.jsx](../src/pages/Partidos.jsx), [TablaFamiliar.jsx](../src/pages/TablaFamiliar.jsx), [MatchDetail.jsx](../src/pages/MatchDetail.jsx) (404 de partido con CTA), [ChatPanel.jsx](../src/components/chat/ChatPanel.jsx), [ChatPreview.jsx](../src/components/chat/ChatPreview.jsx), [admin/AdminPartidos.jsx](../src/pages/admin/AdminPartidos.jsx), [admin/AdminMiembros.jsx](../src/pages/admin/AdminMiembros.jsx).

**Escala de elevación de 4 niveles — punto 18** ([globals.css](../src/styles/globals.css), [Card.jsx](../src/components/ui/Card.jsx))

- Nuevo token `--shadow-0` (microsombra para superficies planas con borde — empty states, chips).
- `--shadow-2` y `--shadow-3` reescritos con doble + triple capa para que las diferencias se perciban al ojo.
- Roles documentados:
  - `s0` → chips, list-items con borde, badges sobre superficie.
  - `s1` → cards estándar en reposo (default de `<Card>`).
  - `s2` → cards interactivas en hover · elevadas (`hero`, live, ganador) · headers fijos. Aplicado automáticamente en `.card-interactive:hover`.
  - `s3` → modales, sheets, popovers, tooltips. Aplicado en [EmojiPicker.jsx](../src/components/chat/EmojiPicker.jsx), menús contextuales de [MensajeItem.jsx](../src/components/chat/MensajeItem.jsx) y sheet de [admin/AdminMiembros.jsx](../src/pages/admin/AdminMiembros.jsx).
- `<Card elevation={0|1|2|3} />` reemplaza al booleano `elevated` (que se mantiene como alias compatible).

**Sistema de iconografía coherente — punto 19** ([Icon.jsx](../src/components/ui/Icon.jsx))

- Refactor completo con un factory `svgFactory(baseSize, paths)` que aplica los mismos atributos a todos los íconos:
  - `viewBox="0 0 24 24"` normalizado.
  - `strokeWidth = 1.75` uniforme (constante `STROKE`).
  - `strokeLinecap="round"` + `strokeLinejoin="round"` siempre.
  - `aria-hidden="true"` por defecto.
- Props `size`, `width`, `height` y `color` añadidas — el `style` legacy sigue funcionando.
- Tamaños base estandarizados por familia:
  - **20px** — navegación principal (Home, Bracket, Cal, Trophy, User).
  - **18px** — header/acción (Bell, Search).
  - **16px** — glyphs de control (Chevron, ChevronD/L, Check, X, Plus, Minus, More, Arrow, Filter, Crown, Gear, Group, Send, Logout, Stadium).
  - **14px** — inline en texto y pills (Heart, Fire, Clock, Lock, Copy, Edit, Trash).
- Redibujados inspirados en Lucide: `Trophy` (asas separadas + base con forma definida), `Crown` (línea limpia tipo corona heráldica), `Stadium` (con línea central punteada), `Fire` (curvatura orgánica), `Bracket` (forma de torneo eliminatorio escalonado), `Cal` (con puntos de día), `Home` (con dintel de puerta).

---

## Componentes especializados (punto 20)

Sexta iteración: extraer los patrones repetidos de marcador, equipo, fila de ranking y métricas como componentes con variantes. Reduce el inlining masivo de estilos en `Inicio.jsx`, `Partidos.jsx`, `TablaFamiliar.jsx` y `Bracket.jsx`, y deja la próxima evolución visual concentrada en un único archivo por componente.

**TeamRow** ([TeamRow.jsx](../src/components/ui/TeamRow.jsx))

Bloque "bandera + nombre de equipo" reutilizable. Centraliza la lógica de tamaños, marca de ganador (`win-mark`), opacidad del perdedor y temas claro/oscuro que antes vivía duplicada en `MatchListItem`, `BracketMatch`, la live card de `Inicio.jsx` y `HeaderTeam` de `MatchDetail.jsx`.

- `size`: `xs` (20×14) · `sm` (32×22) · `md` (38×26) · `lg` (56×40) — preset de bandera, tipografía y gap.
- `direction`: `row` · `row-reverse` para alinear hacia adentro del marcador.
- `theme`: `light` · `dark` — colores adecuados para superficies claras o el header oscuro del live.
- `isWinner` / `isLoser` / `isFinal` — pinta peso 800 con check + atenúa al perdedor a 0.55.
- `truncate` — usa el código de país cuando el nombre supera 12 caracteres (clave para la live card estrecha).

**MatchCard** ([MatchCard.jsx](../src/components/ui/MatchCard.jsx))

Tarjeta de partido con tres variantes que cubren las tres apariciones del patrón en la app:

- `variant="list"` (default) — fila de [Partidos.jsx](../src/pages/Partidos.jsx): Pill de estado (Pronosticado/Pendiente/Finalizado/Empate), `TeamRow` izquierda + marcador central + `TeamRow` derecha invertida, y banner inferior con puntos obtenidos cuando el partido está finalizado y hubo pick.
- `variant="live"` — versión oscura para [Inicio.jsx](../src/pages/Inicio.jsx): superficie `--ink` con `breathe-live`, `LiveBadge` arriba, score grande con animación `bounce` por dígito que cambia (props `liveLocal`, `liveVisitante`, `pulseLocal`, `pulseVisitante`).
- `variant="bracket"` — tarjeta mini para [Bracket.jsx](../src/pages/Bracket.jsx): dos filas apiladas con resaltado oscuro al ganador y línea inferior con el pick del usuario.

Helpers internos (`StatusPill`, `PointsBanner`, `winnerSideOf`) quedan privados al componente — encapsulan la lógica de empate/ganador/exacto/ganado que antes se duplicaba.

**RankRow** ([RankRow.jsx](../src/components/ui/RankRow.jsx))

Fila de ranking reutilizada por [TablaFamiliar.jsx](../src/pages/TablaFamiliar.jsx) (resto del podio). Acepta `member`, `isMe`, `index` (para escalonado con `stagger-item`), `variant: "default" | "compact"`, `showPagoStatus` y un slot `trailing` para casos donde se quiera mostrar algo distinto al `pts` por defecto.

**LiveBadge** ([LiveBadge.jsx](../src/components/ui/LiveBadge.jsx))

Indicador "En vivo" con dot pulsante (`lcfPulse`). Dos variantes:

- `solid` (default) — `--danger` sólido, pensado sobre fondos claros u oscuros.
- `soft` — `--danger-soft` con texto y dot en `--danger`, para banners menos invasivos.

Acepta `minute` opcional (renderizado en mono) y `size: "sm" | "lg"`. Usado dentro de `MatchCard variant="live"`, dejando disponible el componente para futuras vistas con minuto del partido.

**StatTile** ([StatTile.jsx](../src/components/ui/StatTile.jsx))

Tarjeta compacta de métrica. Cuatro tonos (`default`, `accent`, `gold`, `coral`) con tipografía, fondo, borde y sombra cohesivos. Acepta `leading` para slot de ícono o ilustración y `size: "sm" | "md" | "lg"`. Reemplaza al `MiniStat` anterior de `Inicio.jsx` y queda disponible como bloque base para futuras pantallas de estadísticas.

**Refactors aplicados**

- [Partidos.jsx](../src/pages/Partidos.jsx) — `MatchListItem` + `TeamRow` locales removidos; ahora itera con `<MatchCard variant="list">`. Quedaron fuera ~140 líneas de estilos inline.
- [TablaFamiliar.jsx](../src/pages/TablaFamiliar.jsx) — `LeaderRow` local eliminado, ahora `<RankRow showPagoStatus>` para el resto del podio.
- [Inicio.jsx](../src/pages/Inicio.jsx) — la live card pasa a `<MatchCard variant="live">`; `MiniStat` y `TeamMini` locales removidos; `<StatTile>` cubre los tiles de Aciertos/Exactos.
- [Bracket.jsx](../src/pages/Bracket.jsx) — `BracketMatch` local eliminado, ahora `<MatchCard variant="bracket">` (también en los placeholders vacíos).

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
| 7 | Motivo gráfico recurrente | ✅ Implementado |
| 8 | Tipografía display secundaria | ✅ Implementado |
| 9 | Color de acento dinámico por sección | ✅ Implementado |
| 10 | Microinteracciones (hover-lift, confetti) | ✅ Implementado |
| 10w | Winner reveal estilo Google + champion trophy | ✅ Implementado |
| 11 | Avatar con anillo de estado | ✅ Implementado |
| 12 | Barra de progreso protagonista | ✅ Implementado |
| 13 | Countdown live al próximo partido | ✅ Implementado |
| 14 | Streak como elemento gráfico | ✅ Implementado |
| 15 | Podio visual en la Tabla | ✅ Implementado |
| 16 | Skeleton loaders | ✅ Implementado |
| 17 | Empty states ilustrados | ✅ Implementado |
| 18 | Escala de elevación de 4 niveles | ✅ Implementado |
| 19 | Sistema de iconografía unificado | ✅ Implementado |
| 20 | Componentes especializados (MatchCard, etc.) | ✅ Implementado |
| 21 | Modo oscuro | ⏳ Pendiente |
