import { PasswordInput } from "@/registry/bases/ink/ui/password-input";

export default function PasswordInputDemo() {
  return (
    <PasswordInput
      autoFocus
      label="Password"
      placeholder="Enter password"
      showToggle
    />
  );
}
