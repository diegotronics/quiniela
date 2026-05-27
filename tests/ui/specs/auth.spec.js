import { expect, test } from "@playwright/test";
import { expectClean, snapshot } from "../helpers/ui-checks.js";

/**
 * Pruebas de las rutas públicas (sin autenticación):
 *  - /            → Login
 *  - /registro    → Registro
 *  - /invitacion/:token → Aceptar invitación
 */

test.describe("Auth — pantallas públicas", () => {
  test("Login se carga y respeta invariantes UI", async ({ page }, info) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "La Copa Familiar" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("tu@email.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /Entrar/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Regístrate/i }),
    ).toBeVisible();

    // Las chips del footer no deberían contener voseo.
    await expect(page.getByText("Familia", { exact: true })).toBeVisible();
    await expect(page.getByText("Premios", { exact: true })).toBeVisible();

    await snapshot(page, info, "login");
    await expectClean(page, info, { label: "login" });
  });

  test("Login muestra error con credenciales vacías", async ({ page }, info) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Entrar/i }).click();
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/inválido|incorrectos|contraseña/i);
    await snapshot(page, info, "login-error");
  });

  test("Login permite alternar visibilidad de contraseña", async ({ page }) => {
    await page.goto("/");
    const pwdInput = page.locator('input[autocomplete="current-password"]');
    await pwdInput.fill("secreto123");
    await expect(pwdInput).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: /Mostrar contraseña/i }).click();
    await expect(pwdInput).toHaveAttribute("type", "text");
  });

  test("Registro se carga y respeta invariantes UI", async ({ page }, info) => {
    await page.goto("/registro");
    await snapshot(page, info, "registro");
    // Debe haber al menos los campos típicos de registro.
    const inputs = page.locator("input");
    expect(await inputs.count()).toBeGreaterThanOrEqual(3);
    await expectClean(page, info, { label: "registro" });
  });

  test("Invitación con token aleatorio carga sin romper el layout", async ({
    page,
  }, info) => {
    await page.goto("/invitacion/token-de-prueba-1234");
    // Esperamos a que la app termine cualquier estado de carga.
    await page.waitForLoadState("networkidle").catch(() => {});
    await snapshot(page, info, "invitacion-token");
    await expectClean(page, info, {
      label: "invitacion",
      // El servidor puede no responder a este token; igual revisamos layout.
      hard: ["horizontal-overflow", "clipped-right", "voseo"],
    });
  });

  test("Rutas protegidas redirigen a Login cuando no hay sesión", async ({
    page,
  }) => {
    await page.goto("/app/inicio");
    await page.waitForURL("**/", { timeout: 5000 });
    await expect(
      page.getByRole("heading", { name: "La Copa Familiar" }),
    ).toBeVisible();
  });
});
