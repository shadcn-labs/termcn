import { Gauge } from "@/registry/bases/opentui/ui/gauge";

export default function GaugeDemo() {
  return <Gauge value={67} max={100} label="CPU Usage" size="md" />;
}
