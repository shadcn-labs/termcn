import { ToolApproval } from "@/registry/bases/ink/ui/tool-approval";

export default function ToolApprovalDemo() {
  return (
    <ToolApproval
      name="execute_shell"
      description="Run a shell command on the host machine"
      args={{ command: "rm -rf ./dist" }}
      risk="high"
    />
  );
}
