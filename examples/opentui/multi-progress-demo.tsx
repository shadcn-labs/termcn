import { MultiProgress } from "@/registry/bases/opentui/ui/multi-progress";

export default function MultiProgressDemo() {
  return (
    <MultiProgress
      items={[
        {
          id: "api",
          label: "API Server",
          status: "running",
          total: 100,
          value: 80,
        },
        { id: "db", label: "Database", status: "done", total: 100, value: 100 },
        {
          id: "cache",
          label: "Redis",
          status: "running",
          total: 100,
          value: 30,
        },
      ]}
    />
  );
}
