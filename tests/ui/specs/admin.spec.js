import { expect, test } from "@playwright/test";
import { FAKE_ADMIN, seedAuth } from "../helpers/auth.js";
import { expectClean, snapshot } from "../helpers/ui-checks.js";

/**
 * Pruebas de panel de administración.
 *
 * Requiere usuario con es_admin: true. Como con el resto de tests, los datos
 * vienen de Supabase; aceptamos estados vacíos.
 */

const RUTAS_ADMIN = [
  { path: "/admin/miembros", name: "admin-miembros" },
  { path: "/admin/reglas", name: "admin-reglas" },
  { path: "/admin/partidos", name: "admin-partidos" },
];

test.describe("Admin — panel administrativo", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page, FAKE_ADMIN, { skipOnboarding: true });
  });

  for (const ruta of RUTAS_ADMIN) {
    test(`Admin ${ruta.path} renderiza`, async ({ page }, info) => {
      const errores = [];
      page.on("pageerror", (e) => errores.push(`pageerror: ${e.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") errores.push(msg.text());
      });

      await page.goto(ruta.path);
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);

      await expect(page).toHaveURL(new RegExp(ruta.path.replace(/\//g, "\\/")));
      await snapshot(page, info, ruta.name);
      await expectClean(page, info, { label: ruta.name });

      if (errores.length > 0) {
        await info.attach(`${ruta.name}-console-errors.txt`, {
          contentType: "text/plain",
          body: Buffer.from(errores.join("\n")),
        });
      }
    });
  }

  test("Usuario no-admin no puede entrar a /admin", async ({
    page,
  }, info) => {
    await seedAuth(page, { ...FAKE_ADMIN, es_admin: false }, { skipOnboarding: true });
    await page.goto("/admin/miembros");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(300);
    // Debió redirigir a /app/inicio (ver App.jsx Protected adminOnly).
    await expect(page).toHaveURL(/\/app\/inicio/);
    await snapshot(page, info, "admin-redirect-no-admin");
  });
});
