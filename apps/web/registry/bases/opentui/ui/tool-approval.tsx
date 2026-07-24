/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export type RiskLevel = "low" | "medium" | "high";

export interface ToolApprovalProps {
  name: string;
  description?: string;
  args?: Record<string, unknown>;
  risk?: RiskLevel;
  onApprove?: () => void;
  onDeny?: () => void;
  onAlwaysAllow?: () => void;
  timeout?: number;
}

export const ToolApproval = ({
  name,
  description,
  args,
  risk = "low",
  onApprove,
  onDeny,
  onAlwaysAllow,
  timeout,
}: ToolApprovalProps) => {
  const theme = useTheme();
  const [remaining, setRemaining] = useState(timeout ?? 0);
  const onDenyRef = useRef(onDeny);

  useEffect(() => {
    onDenyRef.current = onDeny;
  }, [onDeny]);

  useEffect(() => {
    if (!timeout) {
      return;
    }
    setRemaining(timeout);
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          onDenyRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeout]);

  useKeyboard((key) => {
    if (key.name === "y" || key.name === "Y") {
      onApprove?.();
    } else if (key.name === "n" || key.name === "N") {
      onDeny?.();
    } else if ((key.name === "a" || key.name === "A") && onAlwaysAllow) {
      onAlwaysAllow();
    }
  });

  const riskBorderColor: Record<RiskLevel, string> = {
    high: theme.colors.error ?? "red",
    low: theme.colors.success ?? "green",
    medium: theme.colors.warning ?? "yellow",
  };

  const riskLabel: Record<RiskLevel, string> = {
    high: "HIGH",
    low: "LOW",
    medium: "MEDIUM",
  };

  const riskLabelColor: Record<RiskLevel, string> = {
    high: theme.colors.error ?? "red",
    low: theme.colors.success ?? "green",
    medium: theme.colors.warning ?? "yellow",
  };

  const borderColor = riskBorderColor[risk];

  return (
    <box
      flexDirection="column"
      borderStyle="rounded"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={0}
      paddingBottom={0}
    >
      <box gap={2}>
        <text fg={theme.colors.foreground}>
          <b>Tool Approval Required</b>
        </text>
        <text fg={riskLabelColor[risk]}>
          <b>{`[${riskLabel[risk]} RISK]`}</b>
        </text>
        {timeout && remaining > 0 && (
          <text
            fg={theme.colors.warning ?? "yellow"}
          >{`Auto-deny in ${remaining}s`}</text>
        )}
      </box>

      <box flexDirection="column" marginTop={1}>
        <box gap={1}>
          <text fg={theme.colors.mutedForeground}>Tool:</text>
          <text fg={theme.colors.primary}>
            <b>{name}</b>
          </text>
        </box>
        {description && (
          <box gap={1}>
            <text fg={theme.colors.mutedForeground}>Description:</text>
            <text fg="#666">{description}</text>
          </box>
        )}
      </box>

      {args && Object.keys(args).length > 0 && (
        <box flexDirection="column" marginTop={1}>
          <text fg="#666">Arguments:</text>
          {...Object.entries(args).map(([k, v]) => (
            <box key={k} gap={1} paddingLeft={2}>
              <text fg={theme.colors.accent}>{`${k}:`}</text>
              <text fg="#666">{JSON.stringify(v)}</text>
            </box>
          ))}
        </box>
      )}

      <box gap={2} marginTop={1}>
        <text fg={theme.colors.success ?? "green"}>
          <b>[y] Approve</b>
        </text>
        <text fg={theme.colors.error ?? "red"}>
          <b>[n] Deny</b>
        </text>
        {onAlwaysAllow && (
          <text fg={theme.colors.warning ?? "yellow"}>
            <b>[a] Always Allow</b>
          </text>
        )}
      </box>
    </box>
  );
};
