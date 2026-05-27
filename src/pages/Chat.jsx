import { MobileHeader, MobileShell } from "@/components/ui";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { GROUP_NAME } from "@/lib/constants";

export default function Chat() {
  return (
    <MobileShell
      header={
        <MobileHeader
          title="Picadas familiares"
          subtitle={GROUP_NAME}
          trailing={false}
        />
      }
    >
      <div style={{ padding: "0 16px" }}>
        <ChatPanel partidoId={null} altura="calc(100vh - 250px)" />
      </div>
    </MobileShell>
  );
}
