# Suite de pruebas de UI — La Copa Familiar

Conjunto de pruebas Playwright que recorre las rutas principales de la app,
captura screenshots por sección y aplica invariantes automáticas para detectar
errores frecuentes de UI: scroll horizontal, elementos recortados, áreas de
toque pequeñas, bajo contraste, voseo o anglicismos en el copy.

## Cómo ejecutar

```bash
# Toda la suite (móvil + escritorio · claro + oscuro)
npm run test:ui

# Sólo un grupo
npm run test:ui:auth         # /, /registro, /invitacion/:token
npm run test:ui:app          # /app/* autenticadas
npm run test:ui:admin        # /admin/*
npm run test:ui:components   # /dev/ui-test — galería de componentes

# Sólo un proyecto (viewport + tema)
npx playwright test --project=mobile-light
npx playwright test --project=desktop-dark

# Reporte HTML con todas las capturas
npm run test:ui:report
```

Playwright levanta `npm run dev` en `http://127.0.0.1:5179` automáticamente.

## Cobertura

| Spec | Rutas | Qué valida |
|---|---|---|
| `auth.spec.js` | `/`, `/registro`, `/invitacion/:token` | Login funcional, error de credenciales, protección de rutas, layout |
| `app.spec.js` | `/app/inicio`, `/app/partidos`, `/app/tabla`, `/app/perfil`, `/app/chat`, `/app/apuestas`, `/app/onboarding` | Render con auth, sin redirecciones inesperadas, screenshot por ruta |
| `admin.spec.js` | `/admin/miembros`, `/admin/reglas`, `/admin/partidos` | Render con admin, protección a no-admins |
| `components.spec.js` | `/dev/ui-test` | Galería completa + screenshot aislado por bloque |

Cada test corre en cuatro **proyectos**:

- `mobile-light` (iPhone 13 · 390×844 · tema claro)
- `mobile-dark` (iPhone 13 · 390×844 · tema oscuro)
- `desktop-light` (1280×900 · tema claro)
- `desktop-dark` (1280×900 · tema oscuro)

## Invariantes que se verifican

Ver `helpers/ui-checks.js`. Cada función detecta una categoría de error:

| Regla | Qué detecta |
|---|---|
| `horizontal-overflow` | La página produce scroll horizontal (rompe el viewport) |
| `clipped-right` | Algún elemento concreto se sale del viewport |
| `touch-target` | Botones / enlaces menores a 36×36 px |
| `low-contrast` | Texto con contraste WCAG < 4.5:1 (o < 3:1 si es grande) |
| `voseo` | Formas de voseo prohibidas por la guía de estilo (`sumate`, `tenés`, `vos`…) |
| `anglicismo` | `picks`, `password`, etc. en lugar de su equivalente en español |
| `prefijo-con-guion` | `sub-campeón`, `pre-mundial`, etc. (deben ir unidos) |
| `signos-apertura` | Preguntas o exclamaciones sin `¿` / `¡` |

**Reglas duras** (hacen fallar el test): `voseo`, `horizontal-overflow`,
`clipped-right`, `prefijo-con-guion`, `signos-apertura`.

**Reglas suaves** (se reportan como adjunto JSON en el reporte HTML pero no
fallan): `touch-target`, `low-contrast`, `anglicismo`. Esto evita falsos
positivos por íconos decorativos o palabras como "link" que aparecen en
metadatos. El reporte JSON sigue disponible para revisión humana.

## Galería de componentes

`/dev/ui-test` renderiza todos los componentes UI con sus variantes (estados,
tamaños, tonos). Es una ruta pública para inspección manual y para los
screenshots por componente. Cada bloque está marcado con `data-ui-block="…"`
para que los specs localicen y capturen cada uno por separado.

Bloques disponibles: `tipografia`, `colores`, `buttons`, `pills`, `badges`,
`avatars`, `flags`, `cards`, `section-titles`, `match-cards`, `team-row`,
`rank-rows`, `stat-tiles`, `score-stepper`, `countdown`, `streak-flame`,
`logo`, `empty-states`, `skeletons`, `champion-reveal`, `iconos`.

## Cómo interpretar los resultados

Después de ejecutar la suite:

- **Reporte HTML**: `npm run test:ui:report` abre `tests/ui/report/index.html`
  con todas las capturas y los archivos `*-findings.json` adjuntos.
- **Capturas crudas**: en `tests/ui/test-results/<test-name>/` quedan los PNGs
  con el nombre `<proyecto>__<seccion>.png` para revisar diferencias por
  viewport y tema.
- **`results.json`**: resultados completos en formato JSON, útil para
  procesamiento automático.

## Autenticación en los tests

Las rutas `/app/*` y `/admin/*` están protegidas. La suite no se autentica vía
formulario sino que **inyecta el usuario directamente en localStorage** desde
`helpers/auth.js`. El helper también marca el wizard de onboarding como
pospuesto en sessionStorage para que `MainApp` no redirija al onboarding.

```js
import { FAKE_USER, FAKE_ADMIN, seedAuth } from "../helpers/auth.js";

test.beforeEach(async ({ page }) => {
  await seedAuth(page, FAKE_USER);  // usuario normal
  // o
  await seedAuth(page, FAKE_ADMIN); // admin
});
```

Los datos visibles vienen de Supabase real (la `anon key` permite lectura).
Los tests aceptan tanto estados poblados como vacíos: validan **estructura**
e **invariantes**, no contenido específico de datos.
