import { Badge } from "@/registry/bases/ink/ui/badge";

export default function BadgeCustomBorder() {
  return (
    <Badge variant="info" borderStyle="double" paddingX={2}>
      Important
    </Badge>
  );
}
