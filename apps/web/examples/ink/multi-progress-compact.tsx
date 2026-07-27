import { MultiProgress } from "@/registry/bases/ink/ui/multi-progress";

export default function MultiProgressCompact() {
  return (
    <MultiProgress
      compact
      items={[
        { id: "1", label: "eslint", status: "running", total: 100, value: 50 },
        { id: "2", label: "tsc", status: "done", total: 100, value: 100 },
      ]}
    />
  );
}
