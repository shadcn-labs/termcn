import { Code } from "@/registry/bases/ink/ui/code";

export default function CodeMultiline() {
  return (
    <Code language="typescript">
      {`const greeting = "Hello, world!";\nconsole.log(greeting);`}
    </Code>
  );
}
