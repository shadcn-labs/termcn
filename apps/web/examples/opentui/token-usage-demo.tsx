import { TokenUsage } from "@/registry/bases/opentui/ui/token-usage";

export default function TokenUsageDemo() {
  return <TokenUsage prompt={512} completion={128} />;
}
