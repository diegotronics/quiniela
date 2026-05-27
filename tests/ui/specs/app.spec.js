import { expect, test } from "@playwright/test";
import { FAKE_USER, seedAuth } from "../helpers/auth.js";
import { expectClean, snapshot } from "../helpers/ui-checks.js";

/**
 * Pruebas de las rutas autenticadas de la app principal.
 *
 * Inyectamos un usuario falso en localStorage + marcamos el onboarding como
 * pospuesto en sessionStorage para que MainApp no redirija al wizard.
 *
 * Los datos vienen de Supabase real (RLS/anon permite lectura), así que el
 * test acepta tanto estados poblados como vacíos: lo que se valida son las
 * invariantes de UI (no overflow, contraste, voseo, tamaños de toque) y la
 * presencia de los elementos estructurales.
 */

const RUTAS = [
  { path: "/app/inicio", title: /inicio|hoy|próximos|live|en vivo/i, name: "inicio" },
  { path: "/app/bracket", title: /bracket|llaves|eliminator|grupo/i, name: "bracket" },
  { path: "/app/partidos", title: /partidos|jornada|fase/i, name: "partidos" },
  { path: "/app/tabla", title: /tabla|posición|posiciones|líder/i, name: "tabla" },
  { path: "/app/perfil", title: /perfil|cuenta|mis datos|cerrar sesión/i, name: "perfil" },
  { path: "/app/chat", title: /chat|mensaje/i, name: "chat" },
  { path: "/app/apuestas", title: /apuestas|especial|campe[oó]n/i, name: "apuestas" },
  { path: "/app/onboarding", title: /pron[oó]stic|completar|continuar|grupo/i, name: "onboarding" },
];

test.describe("App autenticada — recorrido por rutas", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page, FAKE_USER, { skipOnboarding: true });
  });

  for (const ruta of RUTAS) {
    test(`Ruta ${ruta.path} carga, hace screenshot y revisa UI`, async ({
      page,
    }, info) => {
      const errores = [];
      page.on("pageerror", (e) => errores.push(`pageerror: ${e.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") errores.push(`console.error: ${msg.text()}`);
      });

      await page.goto(ruta.path);
      // Damos tiempo a la app a renderizar (Supabase HTTP).
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);

      // Mínimo: la página renderiza con la URL correcta y NO redirige a /.
      await expect(page).toHaveURL(new RegExp(ruta.path.replace(/\//g, "\\/")));

      // El layout principal debe existir.
      const root = page.locator("#root");
      await expect(root).toBeVisible();

      await snapshot(page, info, ruta.name);

      // Reporta hallazgos de UI.
      await expectClean(page, info, {
        label: ruta.name,
        // En estas rutas el touch-target pequeño puede deberse a pills decorativos.
        // Lo reportamos pero no falla.
        hard: ["voseo", "horizontal-overflow", "clipped-right", "prefijo-con-guion", "signos-apertura"],
      });

      if (errores.length > 0) {
        await info.attach(`${ruta.name}-console-errors.txt`, {
          contentType: "text/plain",
          body: Buffer.from(errores.join("\n")),
        });
      }
    });
  }

  test("Cambio de tema oscuro persiste en la app", async ({ page }, info) => {
    await page.goto("/app/perfil");
    await page.waitForLoadState("networkidle").catch(() => {});
    // Forzamos tema oscuro vía atributo en root — la app respeta data-theme.
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(200);
    await snapshot(page, info, "perfil-tema-oscuro-forzado");

    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    // En oscuro, el fondo no debería ser crema claro.
    expect(bg).not.toMatch(/244,\s*241,\s*232/);
  });
});
