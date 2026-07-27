import { Alert } from "@/registry/bases/ink/ui/alert";

export default function AlertNoBorder() {
  return (
    <Alert variant="warning" title="Deprecation" bordered={false}>
      This API will be removed in v3.0.
    </Alert>
  );
}
