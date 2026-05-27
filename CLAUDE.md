# Guía de estilo de redacción — La Copa Familiar

Este documento establece las reglas de redacción para **todo texto visible al usuario** en la aplicación (etiquetas, mensajes, placeholders, títulos, descripciones, errores, tooltips, metadatos SEO, manifests, notificaciones, correos transaccionales y comentarios de código que describan UI).

**Regla maestra**: la aplicación se redacta en **español venezolano formal y neutro**. No se utiliza voseo (jerga rioplatense) ni regionalismos de España, México, Argentina, Colombia u otros países hispanohablantes.

---

## 1. Tratamiento de la persona: tuteo (tú)

Usar siempre **tuteo** (segunda persona del singular con el pronombre "tú"). **Nunca** usar voseo ("vos") ni sus formas verbales.

### Pronombres

| ❌ No usar (voseo) | ✅ Usar (tuteo venezolano) |
|---|---|
| vos | tú |
| sos | eres |
| Sos el líder | Eres el líder |

### Imperativos

Los imperativos del voseo terminan en sílaba tónica (`-á`, `-é`, `-í`). En tuteo venezolano se usan formas regulares.

| ❌ No usar | ✅ Usar |
|---|---|
| Hacé / Hacelo | Haz / Hazlo |
| Elegí | Elige |
| Completá | Completa |
| Recargá | Recarga |
| Iniciá | Inicia |
| Sumate | Únete (o "Súmate") |
| Unite | Únete |
| Registrate | Regístrate |
| Apurate | Apúrate |
| Pedile | Pídele |
| Generá / Compartilo | Genera / Compártelo |
| Ajustá | Ajusta |
| Activá / Bloqueala | Activa / Bloquéala |
| Avisá | Avisa (o "Avísale") |
| Pronosticá | Pronostica |

### Presente indicativo

| ❌ No usar | ✅ Usar |
|---|---|
| tenés | tienes |
| podés | puedes |
| querés | quieres |
| sabés | sabes |
| conocés | conoces |
| llevás | llevas |
| acertás | aciertas |

### Subjuntivo y formas afines

| ❌ No usar | ✅ Usar |
|---|---|
| No aflojés | No aflojes |
| Cuando quieras (igual en ambos) | Cuando quieras |

---

## 2. Léxico venezolano

### Adverbios de lugar

Preferir **"aquí"** y **"allí"** sobre "acá" y "allá" (que son válidos pero menos frecuentes en Venezuela formal).

| ❌ Evitar | ✅ Preferir |
|---|---|
| aparecerá acá | aparecerá aquí |
| De acá en adelante | De aquí en adelante |

### Tecnología y web

| ❌ Evitar | ✅ Usar |
|---|---|
| link | enlace |
| ordenador (España) | computadora |
| móvil (España) | celular |
| coche (España) | carro |
| aparcamiento | estacionamiento |
| fichero | archivo |
| ratón (España, ambiguo) | mouse (anglicismo aceptado en VE) o "ratón" según contexto |

### Otros regionalismos a evitar

- **España**: vale, tío/tía, guay, mola, currar, ostia, coger (ambiguo).
- **Argentina/Uruguay**: che, boludo, bárbaro, joya, piola, quilombo, dale, plata (por dinero), guita, remera, pileta.
- **México**: chido, padre (cool), órale, neta, chamba.
- **Colombia**: chévere (acepta en VE pero suena coloquial), parcero, bacano.

### Anglicismos

Sustituir por equivalentes en español cuando exista una forma natural en Venezuela:

| Anglicismo | Preferible |
|---|---|
| picks | pronósticos / predicciones |
| link | enlace |
| email | correo (en contextos formales); "email" es aceptable en UI breve |
| password | contraseña |
| ranking | tabla de posiciones / ranking (ambos aceptados) |

---

## 3. Ortografía

### Tildes

Todas las palabras llevan la tilde que les corresponde según las reglas de la RAE. Atender especialmente:

- Monosílabos diacríticos: **sí** (afirmación), **más** (cantidad), **té** (bebida), **mí**, **tú**, **él**, **sé**, **dé**.
- Interrogativos y exclamativos: **qué**, **cómo**, **cuándo**, **dónde**, **quién**, **cuál**, **cuánto**.
- Verbos comunes: **está**, **están**, **estás**, **estábamos**.
- Días: **miércoles**, **sábado**.
- Otras frecuentes en la app: **pronóstico**, **predicción** (sin tilde), **campeón**, **subcampeón**, **categoría**, **próximo**, **última**, **página**, **número**, **fácil**, **rápido**, **según**, **después**, **también**, **además**, **fútbol**.

### Prefijos y compuestos

Los prefijos (`sub-`, `pre-`, `anti-`, `super-`, `post-`) se escriben **unidos sin guion** cuando preceden a una sola palabra:

| ❌ Evitar | ✅ Usar |
|---|---|
| Sub-campeón | Subcampeón |
| pre-mundial | premundial |
| anti-virus | antivirus |
| super-importante | superimportante |

### Signos de apertura

Usar siempre signos de apertura en preguntas (**¿**) y exclamaciones (**¡**):

- ❌ `Quieres entrar?` → ✅ `¿Quieres entrar?`
- ❌ `Genial!` → ✅ `¡Genial!`

---

## 4. Tono y registro

- **Formal pero cercano**: trato de "tú", sin tecnicismos innecesarios, sin jerga.
- **Conciso**: oraciones cortas; una idea por frase en UI.
- **Sin emojis** dentro de texto formal salvo en mensajes de celebración o hitos (`onboarding.js`), donde ya están definidos.
- **Sin jerga deportiva regional**: usar "partido", "marcador", "goleador", "campeón" (universales).
- **Sin diminutivos**: evitar "linkecito", "rapidito", "preguntita".
- **Sin tuteo+voseo mezclado**: si una oración empieza con "tú", continuar con formas verbales de tuteo.

---

## 5. Configuración regional

- En `index.html`, `og:locale` debe ser **`es_VE`**.
- En `manifest.webmanifest`, `lang` puede mantenerse como `"es"` (genérico) o ajustarse a `"es-VE"`.
- Fechas y horas se formatean con `toLocaleString("es-VE", …)` cuando se requiera localización explícita; `"es"` también es aceptable para formato neutro.

---

## 6. Checklist antes de cometer texto nuevo

Antes de finalizar un cambio que incluya cadenas en español:

1. ¿Hay alguna forma terminada en `-ás`, `-és`, `-ís` tónicas? → revisar si es voseo y convertir a tuteo.
2. ¿Aparece "vos" como pronombre? → cambiar a "tú".
3. ¿Se usa "link", "acá", "sub-X", "pre-X"? → preferir "enlace", "aquí", "subX", "preX".
4. ¿Todas las tildes están en su lugar? (en especial `más`, `sí`, `está`, `qué`, `cómo`, `cuándo`, días con tilde).
5. ¿Las preguntas y exclamaciones tienen signos de apertura?
6. ¿Hay regionalismos no venezolanos? → reemplazar por equivalente neutro o venezolano.

---

## 7. Ejemplos de referencia

**Antes (voseo / rioplatense)**:
> Sumate a la quiniela. Completá tus datos. ¿Ya tenés cuenta? Apurate, acá podés ver los partidos. Pronosticá el sub-campeón.

**Después (español venezolano)**:
> Únete a la quiniela. Completa tus datos. ¿Ya tienes cuenta? Apúrate, aquí puedes ver los partidos. Pronostica al subcampeón.
