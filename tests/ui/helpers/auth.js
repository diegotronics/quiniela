// Helpers para inyectar usuarios autenticados en localStorage antes de
// navegar a rutas protegidas. La app guarda al usuario bajo la clave
// `copa_familiar_user` (ver src/context/AuthContext.jsx).

export const FAKE_USER = {
  id: 999_001,
  nombre: "Diego Prueba",
  email: "diego.test@example.com",
  avatar: "D",
  color: "#553C9A",
  es_admin: false,
  pagado: true,
};

export const FAKE_ADMIN = {
  id: 999_002,
  nombre: "Admin Prueba",
  email: "admin.test@example.com",
  avatar: "A",
  color: "#0E1730",
  es_admin: true,
  pagado: true,
};

const STORAGE_KEY = "copa_familiar_user";
const SESSION_ONB_PREFIX = "quiniela_onb_pospuesto:";

/**
 * Inyecta el usuario en localStorage ANTES de que la app cargue.
 *
 * Uso típico en un test:
 *   await seedAuth(page, FAKE_USER);
 *   await page.goto("/app/inicio");
 */
export async function seedAuth(page, user = FAKE_USER, { skipOnboarding = true } = {}) {
  await page.addInitScript(
    ({ key, payload, onbKey, ts }) => {
      try {
        localStorage.setItem(key, payload);
        if (onbKey) {
          sessionStorage.setItem(onbKey, String(ts));
        }
      } catch {
        /* ignore */
      }
    },
    {
      key: STORAGE_KEY,
      payload: JSON.stringify(user),
      onbKey: skipOnboarding ? SESSION_ONB_PREFIX + user.id : null,
      ts: Date.now(),
    },
  );
}

/**
 * Variante para añadir el seed sobre un contexto ya existente con goto previo.
 * Útil cuando se necesita seedear después de cerrar sesión.
 */
export async function setAuth(page, user = FAKE_USER) {
  await page.evaluate(
    ({ key, payload }) => {
      localStorage.setItem(key, payload);
    },
    { key: STORAGE_KEY, payload: JSON.stringify(user) },
  );
}

export async function clearAuth(page) {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, STORAGE_KEY);
}
