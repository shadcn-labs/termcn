import { ErrorRetry } from "@/registry/bases/ink/ui/error-retry";

export default function ErrorRetryDemo() {
  return (
    <ErrorRetry
      error="Could not reach the model API."
      isActive={false}
      retryCount={1}
      maxRetries={3}
    />
  );
}
