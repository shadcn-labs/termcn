/* @jsxImportSource @opentui/react */
import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface DefinitionItem {
  term: string;
  description: string;
}

export interface DefinitionProps {
  items: DefinitionItem[];
  termColor?: string;
}

export const Definition = ({ items, termColor }: DefinitionProps) => {
  const theme = useTheme();
  const resolvedTermColor = termColor ?? theme.colors.primary;

  return (
    <box flexDirection="column">
      {items.map((item, idx) => (
        <box
          key={idx}
          flexDirection="column"
          marginBottom={idx < items.length - 1 ? 1 : 0}
        >
          <text fg={resolvedTermColor}>
            <b>{item.term}</b>
          </text>
          <box paddingLeft={2}>
            <text fg={theme.colors.foreground}>{item.description}</text>
          </box>
        </box>
      ))}
    </box>
  );
};
