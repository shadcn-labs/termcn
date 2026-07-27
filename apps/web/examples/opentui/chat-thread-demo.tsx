import { ChatThread } from "@/registry/bases/opentui/ui/chat-thread";

export default function ChatThreadDemo() {
  return (
    <ChatThread>
      <text>user: Generate the component registry.</text>
      <text>assistant: Registry generation completed.</text>
    </ChatThread>
  );
}
