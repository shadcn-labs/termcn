import { InfoBox } from "@/registry/bases/ink/ui/info-box";

export default function InfoBoxDemo() {
  return (
    <InfoBox borderStyle="round" width={40}>
      <InfoBox.Header icon="📦" label="my-package" version="v2.4.1" />
      <InfoBox.Row label="License" value="MIT" />
      <InfoBox.Row label="Engine" value="node" valueDetail=">=18.0.0" />
      <InfoBox.TreeRow label="Platform" value="darwin-arm64" />
    </InfoBox>
  );
}
