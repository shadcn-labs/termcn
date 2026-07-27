import { TokenUsage } from "@/registry/bases/ink/ui/token-usage";

export default function TokenUsageDemo() {
  return <TokenUsage prompt={512} completion={128} />;
}
