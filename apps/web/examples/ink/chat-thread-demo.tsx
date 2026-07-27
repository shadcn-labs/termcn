import { Text } from "ink";

import { ChatThread } from "@/registry/bases/ink/ui/chat-thread";

export default function ChatThreadDemo() {
  return (
    <ChatThread>
      <Text>user: Generate the component registry.</Text>
      <Text>assistant: Registry generation completed.</Text>
    </ChatThread>
  );
}
