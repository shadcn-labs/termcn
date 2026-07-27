import { UsageMonitor } from "@/registry/bases/ink/ui/usage-monitor";

export default function UsageMonitorDemo() {
  return (
    <UsageMonitor refreshInterval={2000}>
      <UsageMonitor.Header title="API Usage Dashboard" />
      <UsageMonitor.Tags items={["Pro Plan", "Billing: Monthly", "US-East"]} />
      <UsageMonitor.Section icon="📊" title="Requests">
        <UsageMonitor.Metric
          label="API Calls"
          value={8420}
          max={10_000}
          percent={84.2}
          status="yellow"
          format="number"
        />
        <UsageMonitor.Metric
          label="Storage"
          value={3200}
          max={5000}
          percent={64}
          status="green"
          format="number"
        />
      </UsageMonitor.Section>
      <UsageMonitor.Stats>
        <UsageMonitor.StatRow label="Avg Latency" value="142ms" />
        <UsageMonitor.StatRow
          label="Error Rate"
          value="0.3%"
          valueColor="green"
        />
      </UsageMonitor.Stats>
      <UsageMonitor.StatusBar
        clock
        sessionLabel="dashboard"
        exitHint="q to quit"
      />
    </UsageMonitor>
  );
}
