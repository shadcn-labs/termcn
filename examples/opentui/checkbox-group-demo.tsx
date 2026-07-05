import { CheckboxGroup } from "@/registry/bases/opentui/ui/checkbox-group";

export default function CheckboxGroupDemo() {
  return (
    <CheckboxGroup
      label="Select toppings"
      options={[
        { label: "Extra Cheese", value: "cheese" },
        { label: "Pepperoni", value: "pepperoni" },
        { label: "Mushrooms", value: "mushrooms" },
      ]}
    />
  );
}
