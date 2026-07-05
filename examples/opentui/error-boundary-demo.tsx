import { ErrorBoundary } from "@/registry/bases/opentui/ui/error-boundary";

export default function ErrorBoundaryDemo() {
  return (
    <ErrorBoundary title="Application Error">
      <text>Your app content is safely wrapped.</text>
    </ErrorBoundary>
  );
}
