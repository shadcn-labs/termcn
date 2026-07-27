import { Text } from "ink";

import { ErrorBoundary } from "@/registry/bases/ink/ui/error-boundary";

export default function ErrorBoundaryDemo() {
  return (
    <ErrorBoundary title="Application Error">
      <Text>Your app content is safely wrapped.</Text>
    </ErrorBoundary>
  );
}
