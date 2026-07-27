import { Text } from "ink";

import { Wizard } from "@/registry/bases/ink/ui/wizard";

export default function WizardDemo() {
  return (
    <Wizard
      steps={[
        {
          content: <Text>Install dependencies</Text>,
          key: "install",
          title: "Install",
        },
        {
          content: <Text>Set up your preferences</Text>,
          key: "configure",
          title: "Configure",
        },
        {
          content: <Text>Review and confirm your settings</Text>,
          key: "finish",
          title: "Finish",
        },
      ]}
    />
  );
}
