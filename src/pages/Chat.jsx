import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileHeader, MobileShell } from "@/components/ui";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { GROUP_NAME } from "@/lib/constants";
import { marcarChatVisto } from "@/hooks/useChatNoLeidos";

export default function Chat() {
  const navigate = useNavigate();
  // Al entrar y al salir se marca el chat como visto: lo que llegue mientras
  // está abierto queda cubierto por la marca de salida. El badge del inicio
  // cuenta solo lo posterior.
  useEffect(() => {
    marcarChatVisto();
    return () => marcarChatVisto();
  }, []);
  return (
    <MobileShell
      header={
        <MobileHeader
          title="El Chalequeo"
          subtitle={GROUP_NAME}
          onBack={() => navigate(-1)}
        />
      }
    >
      <div style={{ padding: "0 16px" }}>
        <ChatPanel partidoId={null} altura="calc(100dvh - 250px)" />
      </div>
    </MobileShell>
  );
}
