import { SITE } from "@/constants/site";
import { Clipboard } from "@/registry/bases/ink/ui/clipboard";

export default function ClipboardDemo() {
  return (
    <Clipboard value={`npx shadcn@latest add ${SITE.REGISTRY}/clipboard`} />
  );
}
