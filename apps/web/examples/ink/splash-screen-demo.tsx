import { Text } from "ink";

import { SplashScreen } from "@/registry/bases/ink/ui/splash-screen";

export default function SplashScreenDemo() {
  return (
    <SplashScreen
      title="MyCLI"
      subtitle="The modern developer toolkit"
      author={{ href: "https://example.com", name: "Jane Doe" }}
      statusLine={<Text color="green">● Ready on port 3000</Text>}
    />
  );
}
