import { SplashScreen } from "@/registry/bases/opentui/ui/splash-screen";

export default function SplashScreenDemo() {
  return (
    <SplashScreen
      title="MyCLI"
      subtitle="The modern developer toolkit"
      author={{ href: "https://example.com", name: "Jane Doe" }}
      statusLine={<text fg={"green"}>● Ready on port 3000</text>}
    />
  );
}
