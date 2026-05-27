// Genera todos los assets bitmap (PNG + ICO) a partir de los SVG fuente.
// Uso: `node scripts/build-icons.mjs` (requiere sharp y png-to-ico).
//
// Fuentes:
//   public/favicon.svg   → mark con fondo navy (para tabs, app icon, etc.)
//   public/logo.svg      → lockup completo dentro del círculo (para previews internos)
//   public/og-image.svg  → tarjeta social 1200×630
//
// Salidas:
//   favicon.ico                 (16/32/48 multi-res)
//   favicon-16.png, favicon-32.png, favicon-48.png
//   apple-touch-icon.png        (180×180)
//   icon-192.png, icon-512.png  (PWA / Android)
//   icon-512-maskable.png       (PWA maskable, con safe area)
//   logo-512.png                (lockup completo)
//   og-image.png                (1200×630, social sharing)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root      = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

async function svg(name) {
  return readFile(path.join(publicDir, name));
}

async function renderPng(svgBuf, size, outName, opts = {}) {
  const out = path.join(publicDir, outName);
  const pipeline = sharp(svgBuf, { density: 384 })
    .resize(size, size, {
      fit: "contain",
      background: opts.background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    });
  await pipeline.png({ compressionLevel: 9 }).toFile(out);
  console.log(`  → ${outName} (${size}×${size})`);
}

async function renderRectPng(svgBuf, width, height, outName) {
  const out = path.join(publicDir, outName);
  await sharp(svgBuf, { density: 384 })
    .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  → ${outName} (${width}×${height})`);
}

async function main() {
  console.log("• Cargando SVGs fuente…");
  const favSvg = await svg("favicon.svg");
  const logoSvg = await svg("logo.svg");
  const ogSvg  = await svg("og-image.svg");

  console.log("• Generando favicons PNG…");
  await renderPng(favSvg, 16,  "favicon-16.png");
  await renderPng(favSvg, 32,  "favicon-32.png");
  await renderPng(favSvg, 48,  "favicon-48.png");

  console.log("• Generando iconos de aplicación…");
  await renderPng(favSvg, 180, "apple-touch-icon.png");
  await renderPng(favSvg, 192, "icon-192.png");
  await renderPng(favSvg, 512, "icon-512.png");

  // Maskable: el ícono debe vivir en el 80% central (safe zone).
  console.log("• Generando icon maskable…");
  const maskInner = await sharp(favSvg, { density: 512 })
    .resize(410, 410, { fit: "contain", background: { r: 27, g: 42, b: 82, alpha: 1 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 27, g: 42, b: 82, alpha: 1 } },
  })
    .composite([{ input: maskInner, top: 51, left: 51 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, "icon-512-maskable.png"));
  console.log("  → icon-512-maskable.png (512×512)");

  console.log("• Generando logo completo PNG…");
  await renderPng(logoSvg, 512, "logo-512.png");

  console.log("• Generando OG image…");
  await renderRectPng(ogSvg, 1200, 630, "og-image.png");

  console.log("• Generando favicon.ico (16/32/48)…");
  const icoBuf = await pngToIco([
    path.join(publicDir, "favicon-16.png"),
    path.join(publicDir, "favicon-32.png"),
    path.join(publicDir, "favicon-48.png"),
  ]);
  await writeFile(path.join(publicDir, "favicon.ico"), icoBuf);
  console.log("  → favicon.ico");

  console.log("\nListo. Assets en public/.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
