import { BulletList } from "@/registry/bases/opentui/ui/bullet-list";

export default function BulletListDemo() {
  return (
    <BulletList>
      <BulletList.Item label="Install dependencies" bold>
        <BulletList.Sub>
          <BulletList.TreeItem label="@opentui/react@latest" />
          <BulletList.TreeItem label="react@latest" />
        </BulletList.Sub>
      </BulletList.Item>
      <BulletList.Item label="Configure project" />
      <BulletList.CheckItem label="Write tests" done />
      <BulletList.CheckItem label="Deploy to production" />
    </BulletList>
  );
}
