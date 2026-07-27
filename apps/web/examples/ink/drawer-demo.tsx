import { Text } from "ink";

import { Drawer } from "@/registry/bases/ink/ui/drawer";

export default function DrawerDemo() {
  return (
    <Drawer isOpen={true} edge="right" title="Details" width={40}>
      <Text>Name: my-project</Text>
      <Text>Status: active</Text>
    </Drawer>
  );
}
