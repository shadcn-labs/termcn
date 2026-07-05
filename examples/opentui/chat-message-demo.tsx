import { ChatMessage } from "@/registry/bases/opentui/ui/chat-message";

export default function ChatMessageDemo() {
  return (
    <ChatMessage
      sender="assistant"
      name="Claude"
      timestamp={new Date(2026, 0, 15, 14, 30)}
    >
      Here is the refactored version of your function.
    </ChatMessage>
  );
}
