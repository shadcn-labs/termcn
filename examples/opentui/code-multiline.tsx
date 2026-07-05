import { Code } from "@/registry/bases/opentui/ui/code";

export default function CodeMultiline() {
  return (
    <Code language="typescript">
      {`const greeting = "Hello, world!";\nconsole.log(greeting);`}
    </Code>
  );
}
