import { BulletList } from "@/registry/bases/ink/ui/bullet-list";

export default function BulletListDemo() {
  return (
    <BulletList>
      <BulletList.Item label="Install dependencies" bold>
        <BulletList.Sub>
          <BulletList.TreeItem label="ink@5.1.0" />
          <BulletList.TreeItem label="react@18.3.0" />
        </BulletList.Sub>
      </BulletList.Item>
      <BulletList.Item label="Configure project" />
      <BulletList.CheckItem label="Write tests" done />
      <BulletList.CheckItem label="Deploy to production" />
    </BulletList>
  );
}
