import { Alert } from "@/registry/bases/opentui/ui/alert";

export default function AlertError() {
  return (
    <Alert variant="error" title="Build failed">
      TypeScript found 3 errors in src/index.ts.
    </Alert>
  );
}
