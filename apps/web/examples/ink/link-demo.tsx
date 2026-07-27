import { SITE } from "@/constants/site";
import { Link } from "@/registry/bases/ink/ui/link";

export default function LinkDemo() {
  return <Link href={SITE.URL}>termcn registry</Link>;
}
