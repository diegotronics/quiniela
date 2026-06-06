import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/Button.jsx";
import { Icon } from "@/components/ui/Icon.jsx";

// Ícono de "compartir" de iOS para guiar al usuario hacia la opción correcta.
function ShareIOS({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ verticalAlign: "-3px" }}
    >
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

export default function InstallPrompt() {
  const { visible, platform, promptInstall, dismiss } = useInstallPrompt();

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar La Copa Familiar"
      className="rise"
      style={{
        position: "fixed",
        left: "calc(12px + env(safe-area-inset-left, 0px))",
        right: "calc(12px + env(safe-area-inset-right, 0px))",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        zIndex: 60,
        maxWidth: 520,
        margin: "0 auto",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-3)",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <img
          src="/icon-192.png"
          alt=""
          width={44}
          height={44}
          style={{ borderRadius: 12, flexShrink: 0, boxShadow: "var(--shadow-1)" }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="font-display"
            style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)", letterSpacing: -0.3 }}
          >
            Instala la app
          </div>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              lineHeight: 1.4,
              color: "var(--ink-3)",
            }}
          >
            {platform === "ios" ? (
              <>
                Toca <ShareIOS /> y luego «Añadir a pantalla de inicio» para abrir
                La Copa Familiar como una app.
              </>
            ) : (
              <>Añádela a tu pantalla de inicio para abrirla como una app, sin el navegador.</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="icon-tap"
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "var(--ink-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            margin: -4,
          }}
        >
          <Icon.X />
        </button>
      </div>

      {platform === "android" && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Button variant="ghost" size="md" onClick={dismiss} style={{ flex: 1 }}>
            Ahora no
          </Button>
          <Button variant="primary" size="md" onClick={promptInstall} style={{ flex: 1 }}>
            Instalar
          </Button>
        </div>
      )}
    </div>
  );
}
