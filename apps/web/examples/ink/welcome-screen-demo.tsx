import { WelcomeScreen } from "@/registry/bases/ink/ui/welcome-screen";

export default function WelcomeScreenDemo() {
  return (
    <WelcomeScreen appName="DevTool" version="v2.1.0" borderStyle="round">
      <WelcomeScreen.Left>
        <WelcomeScreen.Logo>{"  ╔══╗\n  ║DT║\n  ╚══╝"}</WelcomeScreen.Logo>
        <WelcomeScreen.Greeting>
          Welcome back, developer!
        </WelcomeScreen.Greeting>
        <WelcomeScreen.Meta
          items={["Node 20.x", "TypeScript 5.4", "macOS"]}
          dim
        />
      </WelcomeScreen.Left>
      <WelcomeScreen.Right>
        <WelcomeScreen.Section title="Quick Start">
          Run `devtool init` to scaffold a new project.
        </WelcomeScreen.Section>
        <WelcomeScreen.Section title="Recent Projects">
          my-app, api-server, dashboard
        </WelcomeScreen.Section>
      </WelcomeScreen.Right>
    </WelcomeScreen>
  );
}
