import { Text } from "ink";

import { VirtualList } from "@/registry/bases/ink/ui/virtual-list";

const renderVirtualListItem = (item: string) => <Text>{item}</Text>;

export default function VirtualListDemo() {
  const items = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);

  return (
    <VirtualList items={items} height={10} renderItem={renderVirtualListItem} />
  );
}
