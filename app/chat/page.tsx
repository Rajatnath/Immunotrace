import { MainShell } from "@/components/layout/MainShell";
import { ChatClient } from "@/app/chat/ChatClient";

export default function ChatPage() {
  return (
    <MainShell title="Context-Aware AI Chat">
      <ChatClient />
    </MainShell>
  );
}
