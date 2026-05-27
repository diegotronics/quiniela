import { expect, test } from "@playwright/test";
import { expectClean, snapshot } from "../helpers/ui-checks.js";

/**
 * Pruebas de componentes UI sueltos.
 *
 * Apoyado en la galería pública /dev/ui-test que renderiza cada componente
 * en sus variantes. Las invariantes globales se ejecutan sobre toda la
 * galería; además, capturamos un screenshot por bloque para que un humano
 * (o el modelo) pueda revisar los componentes de forma aislada.
 */

const BLOQUES = [
  "tipografia",
  "colores",
  "buttons",
  "pills",
  "badges",
  "avatars",
  "flags",
  "cards",
  "section-titles",
  "match-cards",
  "team-row",
  "rank-rows",
  "stat-tiles",
  "score-stepper",
  "countdown",
  "streak-flame",
  "logo",
  "empty-states",
  "skeletons",
  "champion-reveal",
  "iconos",
];

test.describe("Componentes UI — galería /dev/ui-test", () => {
  test("Galería completa carga sin errores de runtime", async ({
    page,
  }, info) => {
    const errores = [];
    page.on("pageerror", (e) => errores.push(`pageerror: ${e.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errores.push(msg.text());
    });

    await page.goto("/dev/ui-test");
    await expect(
      page.getByRole("heading", { name: "Galería de UI" }),
    ).toBeVisible();
    await page.waitForTimeout(300);

    // Todos los bloques deben renderizar.
    for (const id of BLOQUES) {
      await expect(page.locator(`[data-ui-block="${id}"]`)).toBeVisible();
    }

    await snapshot(page, info, "galeria-full");
    await expectClean(page, info, {
      label: "galeria",
      // La galería incluye intencionalmente algunos chips e íconos pequeños.
      skipTouch: true,
    });

    if (errores.length > 0) {
      await info.attach("console-errors.txt", {
        contentType: "text/plain",
        body: Buffer.from(errores.join("\n")),
      });
      expect(
        errores,
        `Errores de consola al renderizar la galería:\n${errores.join("\n")}`,
      ).toEqual([]);
    }
  });

  for (const id of BLOQUES) {
    test(`Bloque "${id}" — screenshot aislado`, async ({ page }, info) => {
      await page.goto("/dev/ui-test");
      const block = page.locator(`[data-ui-block="${id}"]`);
      await expect(block).toBeVisible();
      await block.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      const file = info.outputPath(`${info.project.name}__block-${id}.png`);
      await block.screenshot({ path: file });
      await info.attach(`block-${id}.png`, {
        path: file,
        contentType: "image/png",
      });
    });
  }

  test("Tema oscuro aplicado desde la galería", async ({ page }, info) => {
    await page.goto("/dev/ui-test");
    await page.locator('[data-test="theme-dark"]').click();
    await page.waitForTimeout(200);
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(theme).toBe("dark");
    await snapshot(page, info, "galeria-tema-oscuro");
  });

  test("Tema claro aplicado desde la galería", async ({ page }, info) => {
    await page.goto("/dev/ui-test");
    await page.locator('[data-test="theme-light"]').click();
    await page.waitForTimeout(200);
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(theme).toBe("light");
    await snapshot(page, info, "galeria-tema-claro");
  });
});
