import { VirtualList } from "@/registry/bases/opentui/ui/virtual-list";

const renderVirtualListItem = (item: string) => <text>{item}</text>;

export default function VirtualListDemo() {
  const items = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);

  return (
    <VirtualList items={items} height={10} renderItem={renderVirtualListItem} />
  );
}
