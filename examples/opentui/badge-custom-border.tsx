import { Badge } from "@/registry/bases/opentui/ui/badge";

export default function BadgeCustomBorder() {
  return (
    <Badge variant="info" borderStyle="double" paddingX={2}>
      Important
    </Badge>
  );
}
