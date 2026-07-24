import { Alert } from "@/registry/bases/ink/ui/alert";

export default function AlertCustom() {
  return (
    <Alert variant="success" icon="🚀" color="#a78bfa" title="Deployed">
      Production deploy finished in 42s.
    </Alert>
  );
}
