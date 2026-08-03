import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { Box } from "@/registry/bases/opentui/ui/box";
import { TextInput } from "@/registry/bases/opentui/ui/text-input";

export default function TextInputLabel() {
  const [focusedInput, setFocusedInput] = useState<"name" | "email">("name");

  useKeyboard((key) => {
    if (key.name !== "tab") {
      return;
    }
    key.preventDefault();
    key.stopPropagation();
    setFocusedInput((current) => (current === "name" ? "email" : "name"));
  });

  return (
    <Box flexDirection="column" gap={1}>
      <TextInput
        label="Name"
        placeholder="Enter your name"
        focused={focusedInput === "name"}
      />
      <TextInput
        label="Email"
        placeholder="you@example.com"
        focused={focusedInput === "email"}
      />
    </Box>
  );
}
