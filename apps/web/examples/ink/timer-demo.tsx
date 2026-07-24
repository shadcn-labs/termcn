import { Timer } from "@/registry/bases/ink/ui/timer";

export default function TimerDemo() {
  return <Timer autoStart duration={90} format="ms" label="Session" />;
}
