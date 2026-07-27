import { Box } from "ink";

import { SITE } from "@/constants/site";
import { Link } from "@/registry/bases/ink/ui/link";

export default function LinkShowHref() {
  return (
    <Box flexDirection="column" gap={1}>
      <Link href={SITE.URL}>termcn</Link>
      <Link href="https://github.com/vadimdemedes/ink" showHref>
        Ink
      </Link>
    </Box>
  );
}
