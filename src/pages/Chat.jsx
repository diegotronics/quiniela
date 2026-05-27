import { useNavigate } from "react-router-dom";
import { MobileHeader, MobileShell } from "@/components/ui";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { GROUP_NAME } from "@/lib/constants";

export default function Chat() {
  const navigate = useNavigate();
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
