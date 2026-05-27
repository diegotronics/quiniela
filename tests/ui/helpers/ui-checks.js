// Invariantes de UI que se aplican a CUALQUIER página/screenshot.
//
// Cada función retorna un arreglo de hallazgos (`{ rule, detail, ... }`).
// Si está vacío, la página pasa esa regla. Los specs deciden si una
// regla causa fallo o solo se reporta en el adjunto del HTML report.

import { expect } from "@playwright/test";

const VOSEO_PATTERNS = [
  // Imperativos voseo terminados en tilde sobre la última sílaba.
  /\b(?:hac|elegí|complet|recarg|inici|sum|unite|registr|apur|aviy|pronostic|ajust|activ|bloque|comp[aá]r|gener)[áé]\b/iu,
  /\bsumate\b/i,
  /\bregistrate\b/i,
  /\bunite\b/i,
  /\bapurate\b/i,
  /\bacertás\b/i,
  /\btenés\b/i,
  /\bpodés\b/i,
  /\bquerés\b/i,
  /\bsabés\b/i,
  /\bconocés\b/i,
  /\bllevás\b/i,
  /\bvos\b/i,
  /\bsos\b/i,
];

// Excepciones de "link" — válido como tag <link> en HTML, no como texto visible.
const ANGLICISMOS = [
  { pattern: /\bpicks?\b/i, sugerencia: 'usa "pronósticos" en lugar de "pick"' },
  { pattern: /\bpassword\b/i, sugerencia: 'usa "contraseña" en lugar de "password"' },
];

const PREFIJOS_CON_GUION = [
  /\bsub-(?:campe[oó]n|t[ií]tulo|grupo|sede)\b/i,
  /\bpre-(?:mundial|temporada|partido|clasificaci[oó]n)\b/i,
  /\banti-(?:virus|spam)\b/i,
];

/**
 * Verifica que ningún texto visible contenga formas de voseo.
 */
export async function checkVoseo(page) {
  const text = await page.evaluate(() => document.body.innerText);
  const findings = [];
  for (const re of VOSEO_PATTERNS) {
    const m = text.match(re);
    if (m) {
      findings.push({
        rule: "voseo",
        detail: `Texto con posible voseo: "${m[0]}"`,
      });
    }
  }
  return findings;
}

/**
 * Detecta anglicismos comunes que deberían reemplazarse.
 */
export async function checkAnglicismos(page) {
  const text = await page.evaluate(() => document.body.innerText);
  const findings = [];
  for (const { pattern, sugerencia } of ANGLICISMOS) {
    const m = text.match(pattern);
    if (m) {
      findings.push({
        rule: "anglicismo",
        detail: `"${m[0]}" — ${sugerencia}`,
      });
    }
  }
  return findings;
}

/**
 * Detecta prefijos escritos con guion (sub-campeón, pre-mundial, …).
 */
export async function checkPrefijos(page) {
  const text = await page.evaluate(() => document.body.innerText);
  const findings = [];
  for (const re of PREFIJOS_CON_GUION) {
    const m = text.match(re);
    if (m) {
      findings.push({
        rule: "prefijo-con-guion",
        detail: `"${m[0]}" — los prefijos van unidos sin guion`,
      });
    }
  }
  return findings;
}

/**
 * Detecta preguntas o exclamaciones sin signo de apertura.
 */
export async function checkSignos(page) {
  const text = await page.evaluate(() => document.body.innerText);
  const findings = [];
  // Línea con interrogante al final pero sin ¿ al principio.
  const lines = text.split(/\n+/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/\?$/.test(trimmed) && !trimmed.includes("¿")) {
      findings.push({
        rule: "signos-apertura",
        detail: `Pregunta sin signo de apertura: "${trimmed.slice(0, 60)}"`,
      });
    }
    if (/!$/.test(trimmed) && !trimmed.includes("¡")) {
      findings.push({
        rule: "signos-apertura",
        detail: `Exclamación sin signo de apertura: "${trimmed.slice(0, 60)}"`,
      });
    }
  }
  return findings;
}

/**
 * Detecta scroll horizontal — sugiere overflow o anchos mal calculados.
 */
export async function checkHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      diff: doc.scrollWidth - doc.clientWidth,
    };
  });
  const findings = [];
  if (overflow.diff > 1) {
    findings.push({
      rule: "horizontal-overflow",
      detail: `La página produce scroll horizontal: scrollWidth=${overflow.scrollWidth} vs clientWidth=${overflow.clientWidth} (diff=${overflow.diff}px)`,
    });
  }
  return findings;
}

/**
 * Detecta elementos visibles que se desbordan del viewport por la derecha.
 * Útil para encontrar "esa tarjeta" que rompe el layout.
 */
export async function checkClippedElements(page) {
  const findings = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    function hasScrollableAncestor(el) {
      let cur = el.parentElement;
      while (cur && cur !== document.documentElement) {
        const cs = getComputedStyle(cur);
        const ox = cs.overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden") return true;
        cur = cur.parentElement;
      }
      return false;
    }
    const all = Array.from(document.querySelectorAll("body *"));
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.position === "fixed") continue;
      // Elementos dentro de un contenedor scrollable son clipping intencional.
      if (hasScrollableAncestor(el)) continue;
      if (rect.right - vw > 4) {
        // Para SVG, className es un SVGAnimatedString; usar getAttribute.
        const clsRaw = el.getAttribute("class") || "";
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: String(clsRaw).slice(0, 60),
          id: el.id || "",
          text: (el.textContent || "").trim().slice(0, 40),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          overflowBy: Math.round(rect.right - vw),
        });
        if (out.length >= 6) break;
      }
    }
    return out;
  });
  return findings.map((f) => ({
    rule: "clipped-right",
    detail: `<${f.tag}${f.id ? "#" + f.id : ""}${
      f.cls ? ' class="' + f.cls + '"' : ""
    }>${f.text ? ' "' + f.text + '"' : ""} se sale ${f.overflowBy}px a la derecha (right=${f.right})`,
  }));
}

/**
 * Detecta botones / enlaces / inputs con área de toque demasiado pequeña.
 * Apple HIG / Material recomiendan ≥ 40×40px en móvil.
 */
export async function checkTouchTargets(page, { min = 36 } = {}) {
  return await page.evaluate(
    (minSize) => {
      const out = [];
      const targets = document.querySelectorAll(
        'button, a[href], input:not([type="hidden"]), [role="button"]',
      );
      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        // Excluir elementos auxiliares pequeños conocidos: links inline tipo "Regístrate".
        if (el.tagName.toLowerCase() === "a" && rect.height < 24) continue;
        if (rect.width < minSize || rect.height < minSize) {
          out.push({
            rule: "touch-target",
            detail: `<${el.tagName.toLowerCase()}> "${(
              el.textContent || el.getAttribute("aria-label") || ""
            )
              .trim()
              .slice(0, 30)}" mide ${Math.round(rect.width)}×${Math.round(
              rect.height,
            )}px (< ${minSize}px)`,
          });
        }
      }
      return out.slice(0, 8);
    },
    min,
  );
}

/**
 * Verifica contraste WCAG entre texto y fondo para una muestra de nodos.
 */
export async function checkContrast(page, { minRatio = 4.5 } = {}) {
  return await page.evaluate((minRatio) => {
    function parseColor(c) {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
    }
    function lum({ r, g, b }) {
      const f = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    function ratio(a, b) {
      const l1 = lum(a);
      const l2 = lum(b);
      const hi = Math.max(l1, l2);
      const lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    }
    function effectiveBg(el) {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        const bg = parseColor(getComputedStyle(cur).backgroundColor);
        if (bg && bg.a > 0.4) return bg;
        cur = cur.parentElement;
      }
      return { r: 244, g: 241, b: 232, a: 1 };
    }
    const out = [];
    const nodes = Array.from(
      document.querySelectorAll(
        "h1, h2, h3, h4, p, span, button, a, label, li, td, th",
      ),
    );
    for (const el of nodes) {
      const txt = (el.textContent || "").trim();
      if (!txt || txt.length < 2) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      // Saltamos íconos / nodos con SVG hijos como contenido principal.
      if (el.querySelector("svg") && txt.length < 4) continue;
      const cs = getComputedStyle(el);
      const fg = parseColor(cs.color);
      if (!fg || fg.a < 0.4) continue;
      const bg = effectiveBg(el);
      const r = ratio(fg, bg);
      // Texto grande (≥18px o ≥14px bold) usa 3:1 según WCAG.
      const fontSize = parseFloat(cs.fontSize);
      const isBold = parseInt(cs.fontWeight, 10) >= 600;
      const thresh =
        fontSize >= 18 || (fontSize >= 14 && isBold) ? 3 : minRatio;
      if (r < thresh) {
        out.push({
          rule: "low-contrast",
          detail: `Contraste ${r.toFixed(2)}:1 (< ${thresh}:1) — "${txt.slice(0, 40)}" · color rgb(${fg.r},${fg.g},${fg.b}) sobre rgb(${bg.r},${bg.g},${bg.b})`,
        });
      }
      if (out.length >= 8) break;
    }
    return out;
  }, minRatio);
}

/**
 * Reúne todas las invariantes y retorna un arreglo plano.
 */
export async function collectFindings(page, opts = {}) {
  const all = [];
  const checks = [
    checkHorizontalOverflow,
    checkClippedElements,
    opts.skipTouch ? null : checkTouchTargets,
    opts.skipContrast ? null : checkContrast,
    checkVoseo,
    checkAnglicismos,
    checkPrefijos,
    checkSignos,
  ].filter(Boolean);
  for (const fn of checks) {
    const list = await fn(page);
    all.push(...list);
  }
  return all;
}

/**
 * Adjunta los hallazgos al reporte HTML como JSON para revisión humana,
 * y falla suavemente solo en categorías "duras" (overflow, voseo, signos).
 *
 * `hard` controla qué reglas hacen fallar al test. El resto se reporta.
 */
export async function expectClean(
  page,
  testInfo,
  {
    label = "ui-checks",
    hard = ["voseo", "horizontal-overflow", "clipped-right", "prefijo-con-guion", "signos-apertura"],
    ...opts
  } = {},
) {
  const findings = await collectFindings(page, opts);

  await testInfo.attach(`${label}-findings.json`, {
    contentType: "application/json",
    body: Buffer.from(JSON.stringify(findings, null, 2)),
  });

  const hardFindings = findings.filter((f) => hard.includes(f.rule));
  if (hardFindings.length > 0) {
    const summary = hardFindings
      .slice(0, 10)
      .map((f) => `  • [${f.rule}] ${f.detail}`)
      .join("\n");
    expect(
      hardFindings,
      `Se detectaron ${hardFindings.length} hallazgos de UI:\n${summary}`,
    ).toEqual([]);
  }
  return findings;
}

/**
 * Captura screenshot de la página completa, scrolleando si hace falta.
 * Se nombra con el proyecto (móvil/desktop · claro/oscuro).
 */
export async function snapshot(page, testInfo, name) {
  const safe = name.replace(/[^a-z0-9_-]+/gi, "-");
  const project = testInfo.project.name;
  const file = `${project}__${safe}.png`;
  const path = testInfo.outputPath(file);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(file, { path, contentType: "image/png" });
  return path;
}
