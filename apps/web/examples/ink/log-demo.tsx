import { Log } from "@/registry/bases/ink/ui/log";

export default function LogDemo() {
  return (
    <Log
      entries={[
        { level: "info", message: "Server started on port 3000" },
        { level: "info", message: "Connected to database" },
        { level: "warn", message: "Deprecated API call detected" },
        { level: "debug", message: "Cache hit for module resolver" },
        { level: "error", message: "Failed to connect to Redis" },
        { level: "info", message: "Retrying connection in 5s..." },
      ]}
      height={8}
      showTimestamp={false}
    />
  );
}
