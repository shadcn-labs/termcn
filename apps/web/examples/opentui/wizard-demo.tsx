import { Wizard } from "@/registry/bases/opentui/ui/wizard";

export default function WizardDemo() {
  return (
    <Wizard
      steps={[
        {
          content: <text>Install dependencies</text>,
          key: "install",
          title: "Install",
        },
        {
          content: <text>Set up your preferences</text>,
          key: "configure",
          title: "Configure",
        },
        {
          content: <text>Review and confirm your settings</text>,
          key: "finish",
          title: "Finish",
        },
      ]}
    />
  );
}
