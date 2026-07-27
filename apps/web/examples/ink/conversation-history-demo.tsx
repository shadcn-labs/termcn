import { Text } from "ink";

import { ConversationHistory } from "@/registry/bases/ink/ui/conversation-history";

export default function ConversationHistoryDemo() {
  return (
    <ConversationHistory maxHeight={4} isActive={false}>
      {Array.from({ length: 10 }, (_, i) => (
        <Text key={i}>Message {i + 1}: scroll with ↑↓ when focused.</Text>
      ))}
    </ConversationHistory>
  );
}
