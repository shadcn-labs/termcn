import { LoginFlow } from "@/registry/bases/ink/ui/login-flow";

export default function LoginFlowDemo() {
  return (
    <LoginFlow title="Acme CLI" padding={2}>
      <LoginFlow.Announcement icon="🎉">
        Version 3.0 is now available!
      </LoginFlow.Announcement>
      <LoginFlow.Description>
        Sign in to access your workspace.
      </LoginFlow.Description>
      <LoginFlow.Select
        label="Choose a login method:"
        options={["GitHub", "Google SSO", "Email & Password"]}
      />
    </LoginFlow>
  );
}
