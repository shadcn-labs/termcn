import { Alert } from "@/registry/bases/ink/ui/alert";

export default function AlertWarning() {
  return (
    <Alert variant="warning" title="Deprecation notice">
      This API will be removed in v3.0.
    </Alert>
  );
}
