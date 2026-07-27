import { GitStatus } from "@/registry/bases/ink/ui/git-status";

export default function GitStatusDemo() {
  return <GitStatus branch="feat/new-ui" staged={4} modified={1} ahead={3} />;
}
