import { Drawer } from "@/registry/bases/opentui/ui/drawer";

export default function DrawerDemo() {
  return (
    <Drawer isOpen={true} edge="right" title="Details" width={40}>
      <text>Name: my-project</text>
      <text>Status: active</text>
    </Drawer>
  );
}
