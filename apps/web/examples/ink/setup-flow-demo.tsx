import { SetupFlow } from "@/registry/bases/ink/ui/setup-flow";

export default function SetupFlowDemo() {
  return (
    <SetupFlow title="create-app">
      <SetupFlow.Badge label="v1.0.0" />
      <SetupFlow.Step status="done">Project name set to my-app</SetupFlow.Step>
      <SetupFlow.Step status="done">Template selected: React</SetupFlow.Step>
      <SetupFlow.Step status="active">
        Installing dependencies...
      </SetupFlow.Step>
      <SetupFlow.MultiSelect
        label="Select features"
        hint="space to toggle, enter to confirm"
        options={[
          { label: "TypeScript", value: "ts" },
          { description: "Code linting", label: "ESLint", value: "eslint" },
          { description: "Formatting", label: "Prettier", value: "prettier" },
        ]}
      />
    </SetupFlow>
  );
}
