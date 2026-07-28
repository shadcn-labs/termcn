"use client";

/* eslint-disable func-style, no-use-before-define -- Builder subcomponents are kept in screen-reading order. */

import {
  ActivityIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  BoxIcon,
  BoxesIcon,
  BracesIcon,
  BrushIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
  CircleHelpIcon,
  Code2Icon,
  Columns3Icon,
  CopyIcon,
  DownloadIcon,
  FileCode2Icon,
  FileTextIcon,
  FolderOpenIcon,
  Grid3X3Icon,
  ItalicIcon,
  Layers3Icon,
  ListIcon,
  ListTreeIcon,
  LoaderCircleIcon,
  MinusIcon,
  MonitorIcon,
  MousePointer2Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PlusIcon,
  Redo2Icon,
  Rows3Icon,
  SaveIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  SquareIcon,
  Table2Icon,
  TerminalIcon,
  TextCursorInputIcon,
  TypeIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { LogoMark } from "@/components/logo";
import { TerminalPreview } from "@/components/terminal-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Framework = "ink" | "opentui";
type LayerKind = "container" | "help" | "list" | "separator" | "table" | "text";

interface LayerNode {
  children?: LayerNode[];
  id: string;
  kind: LayerKind;
  label: string;
}

interface StudioTemplate {
  badge?: "INK" | "PRO";
  description: string;
  id: string;
  preview: string;
  title: string;
}

const STUDIO_THEMES = [
  {
    colors: ["#22d3ee", "#f5f515", "#14201e"],
    label: "Dark",
    slug: "default",
  },
  {
    colors: ["#1015c8", "#d210d3", "#e5e7eb"],
    label: "Light",
    slug: "high-contrast-light",
  },
  {
    colors: ["#bd93f9", "#8be9fd", "#282a36"],
    label: "Dracula",
    slug: "dracula",
  },
  {
    colors: ["#cba6f7", "#94e2d5", "#1e1e2e"],
    label: "Catppuccin",
    slug: "catppuccin",
  },
  {
    colors: ["#88c0d0", "#a3be8c", "#2e3440"],
    label: "Nord",
    slug: "nord",
  },
  {
    colors: ["#268bd2", "#b58900", "#073642"],
    label: "Solarized",
    slug: "solarized",
  },
  {
    colors: ["#7aa2f7", "#7dcfff", "#1a1b26"],
    label: "Tokyo Night",
    slug: "tokyo-night",
  },
] as const;

type ThemeSlug = (typeof STUDIO_THEMES)[number]["slug"];

const STUDIO_THEME_STYLES: Record<
  ThemeSlug,
  {
    accent: string;
    background: string;
    border: string;
    foreground: string;
    muted: string;
    primary: string;
    surface: string;
  }
> = {
  catppuccin: {
    accent: "#f5c2e7",
    background: "#1e1e2e",
    border: "#585b70",
    foreground: "#cdd6f4",
    muted: "#7f849c",
    primary: "#89dceb",
    surface: "#313244",
  },
  default: {
    accent: "#8ce64d",
    background: "#1d1e31",
    border: "#54576d",
    foreground: "#d1cfda",
    muted: "#7c7b88",
    primary: "#28e4e6",
    surface: "#202136",
  },
  dracula: {
    accent: "#50fa7b",
    background: "#282a36",
    border: "#6272a4",
    foreground: "#f8f8f2",
    muted: "#8b8c98",
    primary: "#8be9fd",
    surface: "#303241",
  },
  "high-contrast-light": {
    accent: "#0b7a42",
    background: "#f5f5f4",
    border: "#a8a29e",
    foreground: "#171717",
    muted: "#737373",
    primary: "#075985",
    surface: "#ffffff",
  },
  nord: {
    accent: "#a3be8c",
    background: "#2e3440",
    border: "#4c566a",
    foreground: "#d8dee9",
    muted: "#7f899b",
    primary: "#88c0d0",
    surface: "#343c4a",
  },
  solarized: {
    accent: "#b58900",
    background: "#002b36",
    border: "#586e75",
    foreground: "#eee8d5",
    muted: "#839496",
    primary: "#2aa198",
    surface: "#073642",
  },
  "tokyo-night": {
    accent: "#9ece6a",
    background: "#1a1b26",
    border: "#414868",
    foreground: "#c0caf5",
    muted: "#565f89",
    primary: "#7dcfff",
    surface: "#24283b",
  },
};

const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    description: "Classic counter with keyboard controls",
    id: "counter",
    preview: "digits-demo",
    title: "Counter",
  },
  {
    description: "Two-column dashboard with metrics and activity",
    id: "dashboard",
    preview: "usage-monitor-demo",
    title: "Dashboard",
  },
  {
    description: "Full application shell with navigation and status",
    id: "website-layout",
    preview: "app-shell-demo",
    title: "Website Layout",
  },
  {
    description: "Validated terminal form with structured fields",
    id: "form",
    preview: "form-demo",
    title: "Form",
  },
  {
    description: "Sortable data explorer with keyboard navigation",
    id: "data-explorer",
    preview: "data-grid-demo",
    title: "Data Explorer",
  },
  {
    description: "Operational dashboard for host resources and processes",
    id: "system-monitor",
    preview: "usage-monitor-demo",
    title: "System Monitor",
  },
  {
    description: "Streaming conversation with tools and status",
    id: "chat-application",
    preview: "chat-thread-demo",
    title: "Chat Application",
  },
  {
    description: "Browse nested project files and directories",
    id: "file-explorer",
    preview: "directory-tree-demo",
    title: "File Explorer",
  },
  {
    description: "Keyboard-first task list with status controls",
    id: "todo-list",
    preview: "list-demo",
    title: "Todo List Manager",
  },
  {
    description: "Inspect REST requests, approvals, and responses",
    id: "rest-api",
    preview: "tool-call-demo",
    title: "REST API Client",
  },
  {
    description: "Compact player with progress and transport controls",
    id: "music-player",
    preview: "progress-bar-demo",
    title: "Terminal Music Player",
  },
  {
    description: "Full-screen operations dashboard with live telemetry",
    id: "devops-dashboard",
    preview: "app-shell-demo",
    title: "DevOps Dashboard",
  },
  {
    description: "Review patches with focused before-and-after context",
    id: "code-review",
    preview: "diff-view-demo",
    title: "Code Review Tool",
  },
  {
    description: "Prioritized system alerts with clear actions",
    id: "alert-center",
    preview: "alert-demo",
    title: "System Alert Center",
  },
  {
    description: "Render project documentation in the terminal",
    id: "readme-viewer",
    preview: "markdown-demo",
    title: "Project README Viewer",
  },
  {
    description: "Terminal analytics with dithered data visualizations",
    id: "analytics",
    preview: "dither-bar-chart-demo",
    title: "Analytics Dashboard",
  },
  {
    badge: "INK",
    description: "Guided multi-step setup with validation",
    id: "cli-wizard",
    preview: "wizard-demo",
    title: "CLI Wizard",
  },
  {
    badge: "INK",
    description: "Package installation progress and dependency details",
    id: "package-manager",
    preview: "multi-progress-demo",
    title: "Package Manager",
  },
  {
    badge: "INK",
    description: "Git repository status viewer",
    id: "git-status",
    preview: "git-status-demo",
    title: "Git Status",
  },
  {
    badge: "INK",
    description: "Interactive selection menu with descriptions",
    id: "interactive-menu",
    preview: "menu-demo",
    title: "Interactive Menu",
  },
  {
    badge: "INK",
    description: "Structured application logs with severity levels",
    id: "log-viewer",
    preview: "log-demo",
    title: "Log Viewer",
  },
  {
    badge: "PRO",
    description: "Agent conversation with streaming tool activity",
    id: "ai-agent",
    preview: "chat-thread-demo",
    title: "AI Coding Agent",
  },
  {
    badge: "PRO",
    description: "IDE-inspired tabs, panes, and command surfaces",
    id: "ide-panels",
    preview: "tabbed-content-demo",
    title: "IDE Panels",
  },
];

const GIT_STATUS_LAYERS: LayerNode[] = [
  {
    children: [
      {
        children: [
          { id: "branch", kind: "text", label: "Branch" },
          { id: "ahead", kind: "text", label: "Ahead" },
          { id: "header-spacer", kind: "container", label: "HSpacer" },
          { id: "hint", kind: "text", label: "Hint" },
        ],
        id: "header",
        kind: "container",
        label: "Header",
      },
      {
        children: [
          {
            children: [
              { id: "changed-files", kind: "table", label: "ChangedFiles" },
              { id: "status-separator", kind: "separator", label: "Sep" },
              { id: "staged-files", kind: "list", label: "StagedFiles" },
            ],
            id: "status-pane",
            kind: "container",
            label: "StatusPane",
          },
          {
            children: [
              { id: "diff-title", kind: "text", label: "DiffTitle" },
              { id: "diff", kind: "text", label: "Diff" },
              { id: "unstaged", kind: "text", label: "Unstaged" },
            ],
            id: "diff-pane",
            kind: "container",
            label: "DiffPane",
          },
        ],
        id: "body",
        kind: "container",
        label: "Body",
      },
      { id: "helpbar", kind: "help", label: "HelpBar" },
    ],
    id: "root",
    kind: "container",
    label: "Root",
  },
];

const makeGenericLayers = (template: StudioTemplate): LayerNode[] => [
  {
    children: [
      {
        children: [
          { id: "title", kind: "text", label: "Title" },
          { id: "header-hint", kind: "text", label: "Hint" },
        ],
        id: "header",
        kind: "container",
        label: "Header",
      },
      {
        children: [
          { id: "content", kind: "container", label: template.title },
          { id: "content-separator", kind: "separator", label: "Separator" },
          { id: "content-list", kind: "list", label: "Items" },
        ],
        id: "body",
        kind: "container",
        label: "Body",
      },
      { id: "helpbar", kind: "help", label: "HelpBar" },
    ],
    id: "root",
    kind: "container",
    label: "Root",
  },
];

const ASSETS = [
  { category: "Layout", icon: BoxIcon, label: "Container" },
  { category: "Layout", icon: Rows3Icon, label: "Spacer" },
  { category: "Layout", icon: MinusIcon, label: "Separator" },
  { category: "Layout", icon: Columns3Icon, label: "Scrollable" },
  { category: "Layout", icon: Grid3X3Icon, label: "Grid" },
  { category: "Layout", icon: Columns3Icon, label: "Divider Text" },
  { category: "Text", icon: TypeIcon, label: "Text" },
  { category: "Text", icon: FileTextIcon, label: "Markdown" },
  { category: "Text", icon: BracesIcon, label: "Code Block" },
  { category: "Text", icon: CircleHelpIcon, label: "Key Hint" },
  { category: "Input", icon: TextCursorInputIcon, label: "Text Input" },
  { category: "Input", icon: MousePointer2Icon, label: "Button" },
  { category: "Input", icon: SlidersHorizontalIcon, label: "Slider" },
  { category: "Input", icon: CheckIcon, label: "Checkbox" },
  { category: "Navigation", icon: ListTreeIcon, label: "Tree" },
  { category: "Navigation", icon: ListIcon, label: "List" },
  { category: "Navigation", icon: Table2Icon, label: "Table" },
  { category: "Navigation", icon: TerminalIcon, label: "Shell" },
  { category: "Feedback", icon: ActivityIcon, label: "Progress" },
  { category: "Feedback", icon: LoaderCircleIcon, label: "Spinner" },
] as const;

const ASSET_CATEGORIES = [
  "All",
  "Layout",
  "Text",
  "Input",
  "Navigation",
  "Feedback",
] as const;

const getAllIds = (nodes: LayerNode[]): string[] =>
  nodes.flatMap((node) => [
    node.id,
    ...(node.children ? getAllIds(node.children) : []),
  ]);

const findLayer = (nodes: LayerNode[], id: string | null): LayerNode | null => {
  if (!id) {
    return null;
  }

  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const child = node.children ? findLayer(node.children, id) : null;
    if (child) {
      return child;
    }
  }

  return null;
};

const getTemplateLayers = (template: StudioTemplate | null): LayerNode[] => {
  if (!template) {
    return [{ id: "root", kind: "container", label: "Root" }];
  }
  if (template.id === "git-status") {
    return GIT_STATUS_LAYERS;
  }
  return makeGenericLayers(template);
};

const getLayerIcon = (kind: LayerKind) => {
  if (kind === "help") {
    return CircleHelpIcon;
  }
  if (kind === "list") {
    return ListIcon;
  }
  if (kind === "separator") {
    return MinusIcon;
  }
  if (kind === "table") {
    return Table2Icon;
  }
  if (kind === "text") {
    return TypeIcon;
  }
  return SquareIcon;
};

const getBorderGlyph = (index: number) => {
  if (index < 4) {
    return "─";
  }
  if (index === 4) {
    return "╭";
  }
  return "│";
};

const getGeneratedCode = ({
  framework,
  template,
  theme,
}: {
  framework: Framework;
  template: StudioTemplate | null;
  theme: ThemeSlug;
}) => `import React from "react";
import { render } from "${framework === "ink" ? "ink" : "@opentui/react"}";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ${template ? template.title.replaceAll(/[^a-zA-Z0-9]/g, "") : "App"} } from "./app";

const App = () => (
  <ThemeProvider theme="${theme}">
    <${template ? template.title.replaceAll(/[^a-zA-Z0-9]/g, "") : "App"} />
  </ThemeProvider>
);

render(<App />);
`;

export function StudioBuilder() {
  const initialTemplate =
    STUDIO_TEMPLATES.find((template) => template.id === "git-status") ??
    STUDIO_TEMPLATES[0];
  const [activeTemplate, setActiveTemplate] = useState<StudioTemplate | null>(
    initialTemplate
  );
  const [templateSelection, setTemplateSelection] = useState("system-monitor");
  const [templateOpen, setTemplateOpen] = useState(true);
  const [framework, setFramework] = useState<Framework>("ink");
  const [theme, setTheme] = useState<ThemeSlug>("default");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState<"assets" | "layers">("layers");
  const [canvasTab, setCanvasTab] = useState<"build" | "code">("build");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(getAllIds(GIT_STATUS_LAYERS))
  );
  const [renamedLayers, setRenamedLayers] = useState<Record<string, string>>(
    {}
  );
  const [contentValues, setContentValues] = useState<Record<string, string>>(
    {}
  );
  const [assetCategory, setAssetCategory] =
    useState<(typeof ASSET_CATEGORIES)[number]>("All");
  const [assetSearch, setAssetSearch] = useState("");
  const [align, setAlign] = useState<"center" | "left" | "right">("left");
  const [bold, setBold] = useState(false);
  const [dim, setDim] = useState(false);
  const [italic, setItalic] = useState(false);
  const [color, setColor] = useState("Green");

  const layers = useMemo(
    () => getTemplateLayers(activeTemplate),
    [activeTemplate]
  );
  const selectedLayer = findLayer(layers, selectedLayerId);
  const selectedTemplate =
    STUDIO_TEMPLATES.find((template) => template.id === templateSelection) ??
    STUDIO_TEMPLATES[0];
  const filteredAssets = ASSETS.filter((asset) => {
    const matchesCategory =
      assetCategory === "All" || asset.category === assetCategory;
    const matchesSearch = asset.label
      .toLowerCase()
      .includes(assetSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const generatedCode = getGeneratedCode({
    framework,
    template: activeTemplate,
    theme,
  });

  const useTemplate = () => {
    setActiveTemplate(selectedTemplate);
    setSelectedLayerId(null);
    setExpanded(new Set(getAllIds(makeGenericLayers(selectedTemplate))));
    if (selectedTemplate.id === "git-status") {
      setExpanded(new Set(getAllIds(GIT_STATUS_LAYERS)));
    }
    setTemplateOpen(false);
  };

  const useEmptyCanvas = () => {
    setActiveTemplate(null);
    setSelectedLayerId(null);
    setExpanded(new Set(["root"]));
    setTemplateOpen(false);
  };

  const saveProject = () => {
    localStorage.setItem(
      "termcn-studio-project",
      JSON.stringify({
        framework,
        template: activeTemplate?.id ?? null,
        theme,
      })
    );
    toast.success("Project saved locally");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    toast.success("TypeScript copied");
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "App.tsx";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("App.tsx downloaded");
  };

  return (
    <div className="dark flex h-svh min-h-[640px] w-full flex-col overflow-hidden bg-[#151516] font-sans text-neutral-200">
      <StudioToolbar
        activeTemplate={activeTemplate}
        code={generatedCode}
        framework={framework}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onCopyCode={copyCode}
        onDownloadCode={downloadCode}
        onFrameworkChange={setFramework}
        onLeftOpenChange={setLeftOpen}
        onOpenTemplates={() => setTemplateOpen(true)}
        onRightOpenChange={setRightOpen}
        onSave={saveProject}
      />

      <div className="flex min-h-0 flex-1">
        {leftOpen && (
          <aside className="hidden w-[262px] shrink-0 flex-col border-r border-white/8 bg-[#151516] lg:flex">
            <PanelTabs
              active={leftTab}
              onChange={setLeftTab}
              tabs={[
                { icon: Layers3Icon, id: "layers", label: "Layers" },
                { icon: BoxesIcon, id: "assets", label: "Assets" },
              ]}
            />
            {leftTab === "layers" ? (
              <LayersPanel
                expanded={expanded}
                layers={layers}
                renamedLayers={renamedLayers}
                selectedLayerId={selectedLayerId}
                onClose={() => setLeftOpen(false)}
                onExpandedChange={setExpanded}
                onSelect={setSelectedLayerId}
              />
            ) : (
              <AssetsPanel
                category={assetCategory}
                items={filteredAssets}
                search={assetSearch}
                onAdd={(label) => {
                  toast.success(`${label} added to the canvas`);
                  setLeftTab("layers");
                }}
                onCategoryChange={setAssetCategory}
                onClose={() => setLeftOpen(false)}
                onSearchChange={setAssetSearch}
              />
            )}
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col bg-[#171718]">
          <PanelTabs
            active={canvasTab}
            fill={false}
            onChange={setCanvasTab}
            tabs={[
              { icon: BrushIcon, id: "build", label: "Build" },
              { icon: Code2Icon, id: "code", label: "Code" },
            ]}
          />

          {canvasTab === "build" ? (
            <BuildCanvas
              activeTemplate={activeTemplate}
              framework={framework}
              selectedLayer={selectedLayer}
              theme={theme}
              onOpenTemplates={() => setTemplateOpen(true)}
            />
          ) : (
            <CodeCanvas code={generatedCode} onCopy={copyCode} />
          )}
        </main>

        {rightOpen && (
          <aside className="hidden w-[320px] shrink-0 flex-col border-l border-white/8 bg-[#151516] xl:flex">
            <PropertiesPanel
              align={align}
              bold={bold}
              color={color}
              content={
                selectedLayer
                  ? (contentValues[selectedLayer.id] ?? selectedLayer.label)
                  : ""
              }
              dim={dim}
              italic={italic}
              renamedLayers={renamedLayers}
              selectedLayer={selectedLayer}
              theme={theme}
              onAlignChange={setAlign}
              onBoldChange={setBold}
              onClose={() => setRightOpen(false)}
              onColorChange={setColor}
              onContentChange={(value) => {
                if (selectedLayer) {
                  setContentValues((current) => ({
                    ...current,
                    [selectedLayer.id]: value,
                  }));
                }
              }}
              onDimChange={setDim}
              onItalicChange={setItalic}
              onNameChange={(value) => {
                if (selectedLayer) {
                  setRenamedLayers((current) => ({
                    ...current,
                    [selectedLayer.id]: value,
                  }));
                }
              }}
              onThemeChange={setTheme}
            />
          </aside>
        )}
      </div>

      <StudioStatus
        framework={framework}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        theme={theme}
        onLeftOpenChange={setLeftOpen}
        onRightOpenChange={setRightOpen}
      />

      <TemplateChooser
        framework={framework}
        open={templateOpen}
        selected={selectedTemplate}
        selectedId={templateSelection}
        theme={theme}
        onEmptyCanvas={useEmptyCanvas}
        onOpenChange={setTemplateOpen}
        onSelect={setTemplateSelection}
        onUseTemplate={useTemplate}
      />
    </div>
  );
}

function StudioToolbar({
  activeTemplate,
  code,
  framework,
  leftOpen,
  onCopyCode,
  onDownloadCode,
  onFrameworkChange,
  onLeftOpenChange,
  onOpenTemplates,
  onRightOpenChange,
  onSave,
  rightOpen,
}: {
  activeTemplate: StudioTemplate | null;
  code: string;
  framework: Framework;
  leftOpen: boolean;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  onFrameworkChange: (framework: Framework) => void;
  onLeftOpenChange: (open: boolean) => void;
  onOpenTemplates: () => void;
  onRightOpenChange: (open: boolean) => void;
  onSave: () => void;
  rightOpen: boolean;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-white/8 bg-[#181819] px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex items-center gap-2 border-r border-white/8 pr-3">
          <LogoMark className="size-5 text-emerald-400" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            termcn
            <span className="text-neutral-500">.studio</span>
          </span>
        </div>
        <StudioIconButton
          label={leftOpen ? "Hide left panel" : "Show left panel"}
          onClick={() => onLeftOpenChange(!leftOpen)}
        >
          {leftOpen ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
        </StudioIconButton>
      </div>

      <div className="pointer-events-none absolute left-1/2 max-w-[32vw] -translate-x-1/2 truncate text-sm font-medium text-neutral-400">
        {activeTemplate?.id ?? "my-tui-app"}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
        <StudioIconButton
          className="hidden sm:inline-flex"
          label="Undo"
          onClick={() => toast("Nothing to undo")}
        >
          <Undo2Icon />
        </StudioIconButton>
        <StudioIconButton
          className="hidden sm:inline-flex"
          disabled
          label="Redo"
        >
          <Redo2Icon />
        </StudioIconButton>
        <span className="mx-1 hidden h-5 w-px bg-white/8 sm:block" />
        <StudioIconButton label="Save project" onClick={onSave}>
          <SaveIcon />
        </StudioIconButton>
        <StudioIconButton label="Choose a template" onClick={onOpenTemplates}>
          <FolderOpenIcon />
        </StudioIconButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open project menu"
              className="size-8 rounded-lg text-neutral-400 hover:bg-white/8 hover:text-neutral-100"
              size="icon-sm"
              sound="click"
              variant="ghost"
            >
              <BoxesIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="dark w-60 border-white/10 bg-neutral-900 p-1.5 text-neutral-100"
          >
            <DropdownMenuItem onSelect={onOpenTemplates}>
              <BoxesIcon />
              <div className="flex flex-col">
                <span>Template gallery</span>
                <span className="text-[10px] text-neutral-500">
                  Start from a complete screen
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDownloadCode}>
              <FileCode2Icon />
              <div className="flex flex-col">
                <span>TypeScript file</span>
                <span className="text-[10px] text-neutral-500">
                  Download App.tsx
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCopyCode}>
              <CopyIcon />
              Copy code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="mx-1 h-5 w-px bg-white/8" />
        <select
          aria-label="Renderer"
          className="h-9 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 text-xs font-medium text-blue-300 outline-none focus:border-blue-400"
          value={framework}
          onChange={(event) =>
            onFrameworkChange(event.target.value as Framework)
          }
        >
          <option value="ink">Ink v6</option>
          <option value="opentui">OpenTUI</option>
        </select>
        <DropdownMenu>
          <div className="flex">
            <Button
              className="h-9 rounded-r-none bg-emerald-600 px-3 text-white hover:bg-emerald-500"
              onClick={onDownloadCode}
              sound="click"
            >
              <DownloadIcon />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open export menu"
                className="h-9 rounded-l-none border-l border-white/15 bg-emerald-600 px-2 text-white hover:bg-emerald-500"
                sound="click"
              >
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent
            align="end"
            className="dark w-64 border-white/10 bg-neutral-900 p-1.5 text-neutral-100"
          >
            <DropdownMenuItem
              onSelect={() => {
                navigator.clipboard.writeText(
                  `pnpm dlx termcn@latest studio --template ${activeTemplate?.id ?? "blank"}`
                );
                toast.success("Project command copied");
              }}
            >
              <TerminalIcon />
              <div className="flex flex-col">
                <span>npm project</span>
                <span className="text-[10px] text-neutral-500">
                  package.json + App.tsx
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDownloadCode}>
              <FileCode2Icon />
              <div className="flex flex-col">
                <span>TypeScript file</span>
                <span className="text-[10px] text-neutral-500">
                  App.tsx only
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                navigator.clipboard.writeText(code);
                toast.success("TypeScript copied");
              }}
            >
              <CopyIcon />
              <div className="flex flex-col">
                <span>Copy code</span>
                <span className="text-[10px] text-neutral-500">
                  Copy TypeScript code
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <StudioIconButton
          label={rightOpen ? "Hide properties" : "Show properties"}
          onClick={() => onRightOpenChange(!rightOpen)}
        >
          {rightOpen ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
        </StudioIconButton>
      </div>
    </header>
  );
}

function StudioIconButton({
  children,
  className,
  label,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "size-8 rounded-lg text-neutral-500 hover:bg-white/8 hover:text-neutral-100",
        className
      )}
      size="icon-sm"
      sound="click"
      title={label}
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  );
}

function PanelTabs<T extends string>({
  active,
  fill = true,
  onChange,
  tabs,
}: {
  active: T;
  fill?: boolean;
  onChange: (tab: T) => void;
  tabs: {
    icon: React.ComponentType<{ className?: string }>;
    id: T;
    label: string;
  }[];
}) {
  return (
    <div className="flex h-12 shrink-0 items-stretch border-b border-white/8 px-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = active === tab.id;
        return (
          <button
            aria-pressed={selected}
            className={cn(
              "relative flex min-w-0 items-center justify-center gap-2 px-3 text-xs font-medium text-neutral-500 outline-none hover:text-neutral-200 focus-visible:ring-1 focus-visible:ring-emerald-400/60",
              fill ? "flex-1" : "min-w-24",
              selected && "text-neutral-100"
            )}
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
          >
            <Icon className="size-4" />
            {tab.label}
            {selected && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-emerald-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function LayersPanel({
  expanded,
  layers,
  onClose,
  onExpandedChange,
  onSelect,
  renamedLayers,
  selectedLayerId,
}: {
  expanded: Set<string>;
  layers: LayerNode[];
  onClose: () => void;
  onExpandedChange: (expanded: Set<string>) => void;
  onSelect: (id: string) => void;
  renamedLayers: Record<string, string>;
  selectedLayerId: string | null;
}) {
  const toggleExpanded = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onExpandedChange(next);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center border-b border-white/6 px-3">
        <Layers3Icon className="mr-2 size-4 text-neutral-500" />
        <span className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
          Layers
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <StudioIconButton
            label="Collapse all layers"
            onClick={() => onExpandedChange(new Set())}
          >
            <ChevronsDownIcon />
          </StudioIconButton>
          <StudioIconButton
            label="Expand all layers"
            onClick={() => onExpandedChange(new Set(getAllIds(layers)))}
          >
            <ChevronsUpIcon />
          </StudioIconButton>
          <StudioIconButton label="Close layers panel" onClick={onClose}>
            <XIcon />
          </StudioIconButton>
        </div>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto py-1.5">
        <LayerRows
          depth={0}
          expanded={expanded}
          nodes={layers}
          renamedLayers={renamedLayers}
          selectedLayerId={selectedLayerId}
          onSelect={onSelect}
          onToggle={toggleExpanded}
        />
      </div>
      <div className="border-t border-white/6 px-3 py-2 text-[10px] text-neutral-600">
        {getAllIds(layers).length} widgets
      </div>
    </div>
  );
}

function LayerRows({
  depth,
  expanded,
  nodes,
  onSelect,
  onToggle,
  renamedLayers,
  selectedLayerId,
}: {
  depth: number;
  expanded: Set<string>;
  nodes: LayerNode[];
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  renamedLayers: Record<string, string>;
  selectedLayerId: string | null;
}) {
  return nodes.map((node) => {
    const Icon = getLayerIcon(node.kind);
    const hasChildren = Boolean(node.children?.length);
    const open = expanded.has(node.id);
    const selected = selectedLayerId === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "group flex h-8 items-center pr-2 text-xs text-neutral-400 hover:bg-white/4 hover:text-neutral-100",
            selected && "bg-blue-500/20 text-blue-200 hover:bg-blue-500/20"
          )}
          style={{ paddingLeft: 6 + depth * 16 }}
        >
          <button
            aria-label={
              open ? `Collapse ${node.label}` : `Expand ${node.label}`
            }
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded outline-none hover:bg-white/8 focus-visible:ring-1 focus-visible:ring-blue-400",
              !hasChildren && "pointer-events-none opacity-0"
            )}
            type="button"
            onClick={() => hasChildren && onToggle(node.id)}
          >
            <ChevronRightIcon
              className={cn("size-3 transition-transform", open && "rotate-90")}
            />
          </button>
          <button
            className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none focus-visible:text-blue-200"
            type="button"
            onClick={() => onSelect(node.id)}
          >
            <Icon className="size-3.5 shrink-0 text-neutral-500" />
            <span className="truncate">
              {renamedLayers[node.id] ?? node.label}
            </span>
            {hasChildren && (
              <span className="ml-auto text-[10px] text-neutral-600">
                {node.children?.length}
              </span>
            )}
          </button>
        </div>
        {hasChildren && open && (
          <LayerRows
            depth={depth + 1}
            expanded={expanded}
            nodes={node.children ?? []}
            renamedLayers={renamedLayers}
            selectedLayerId={selectedLayerId}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        )}
      </div>
    );
  });
}

function AssetsPanel({
  category,
  items,
  onAdd,
  onCategoryChange,
  onClose,
  onSearchChange,
  search,
}: {
  category: (typeof ASSET_CATEGORIES)[number];
  items: (typeof ASSETS)[number][];
  onAdd: (label: string) => void;
  onCategoryChange: (category: (typeof ASSET_CATEGORIES)[number]) => void;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  search: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/6 px-3">
        <span className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
          Components
        </span>
        <span className="rounded bg-white/6 px-1.5 py-0.5 text-[9px] text-neutral-500">
          {ASSETS.length}
        </span>
        <StudioIconButton
          className="ml-auto"
          label="Close assets panel"
          onClick={onClose}
        >
          <XIcon />
        </StudioIconButton>
      </div>
      <div className="border-b border-white/6 p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-neutral-600" />
          <Input
            aria-label="Search widgets"
            className="h-8 border-white/8 bg-white/3 pl-8 text-xs text-neutral-200 placeholder:text-neutral-600"
            placeholder="Search widgets..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto">
          {ASSET_CATEGORIES.map((item) => (
            <button
              className={cn(
                "rounded-full px-2 py-1 text-[9px] font-medium whitespace-nowrap text-neutral-500 hover:bg-white/6 hover:text-neutral-200",
                category === item && "bg-blue-500/15 text-blue-300"
              )}
              key={item}
              type="button"
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="no-scrollbar grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-1.5 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className="group flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/6 bg-white/2 p-2 text-[9px] text-neutral-500 outline-none hover:border-emerald-400/25 hover:bg-emerald-400/5 hover:text-neutral-200 focus-visible:border-emerald-400/60"
              key={item.label}
              type="button"
              onClick={() => onAdd(item.label)}
            >
              <Icon className="size-4 text-neutral-500 group-hover:text-emerald-300" />
              <span className="line-clamp-2">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BuildCanvas({
  activeTemplate,
  framework,
  onOpenTemplates,
  selectedLayer,
  theme,
}: {
  activeTemplate: StudioTemplate | null;
  framework: Framework;
  onOpenTemplates: () => void;
  selectedLayer: LayerNode | null;
  theme: ThemeSlug;
}) {
  if (!activeTemplate) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#1d1d1f] p-8">
        <button
          className="flex min-h-64 w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/12 bg-white/2 text-neutral-500 outline-none hover:border-emerald-400/30 hover:bg-emerald-400/3 focus-visible:border-emerald-400"
          type="button"
          onClick={onOpenTemplates}
        >
          <div className="flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4">
            <PlusIcon className="size-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-300">
              Start with a template
            </p>
            <p className="mt-1 text-xs">
              Or add components from the Assets panel
            </p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 overflow-auto bg-[#1d1d1f] p-3">
      <div
        className={cn(
          "m-auto w-full min-w-[680px] max-w-[1280px] overflow-hidden border border-white/8 bg-black shadow-2xl shadow-black/20",
          selectedLayer && "ring-1 ring-blue-500/70"
        )}
      >
        {activeTemplate.id === "git-status" ? (
          <GitStatusStudioPreview theme={theme} />
        ) : (
          <TerminalPreview
            base={framework}
            name={activeTemplate.preview}
            rows={38}
            theme={theme}
          />
        )}
      </div>
      {selectedLayer && (
        <div className="pointer-events-none absolute right-5 bottom-5 rounded-md border border-blue-400/30 bg-blue-500/15 px-2 py-1 text-[10px] text-blue-200 backdrop-blur">
          Editing {selectedLayer.label}
        </div>
      )}
    </div>
  );
}

function GitStatusStudioPreview({
  compact = false,
  theme,
}: {
  compact?: boolean;
  theme: ThemeSlug;
}) {
  const colors = STUDIO_THEME_STYLES[theme];
  const files = [
    ["src/lib/template.ts", "modified"],
    ["src/components/app.tsx", "modified"],
    ["src/lib/defaults.ts", "staged"],
  ];

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden font-mono",
        compact ? "h-[360px] text-[10px]" : "min-h-[680px] text-sm"
      )}
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
      }}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border px-4",
          compact ? "m-2 h-9" : "m-4 h-12"
        )}
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <span className="font-semibold" style={{ color: colors.accent }}>
          On branch feature/template-frameworks
        </span>
        <span className="ml-3" style={{ color: colors.primary }}>
          [ahead 2]
        </span>
        <span
          className="ml-auto hidden sm:inline"
          style={{ color: colors.muted }}
        >
          working tree has pending changes
        </span>
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-[minmax(190px,0.8fr)_minmax(320px,1.8fr)]",
          compact ? "gap-2 px-2" : "gap-4 px-4"
        )}
      >
        <section
          className="flex min-h-0 flex-col border p-4"
          style={{ borderColor: colors.border }}
        >
          <div
            className="grid grid-cols-[1.5fr_1fr] border"
            style={{ borderColor: colors.border }}
          >
            {["File", "State"].map((label) => (
              <div
                className="border-r px-3 py-2 font-semibold last:border-r-0"
                key={label}
                style={{ borderColor: colors.border }}
              >
                {label}
              </div>
            ))}
            {files.flatMap(([file, state]) => [
              <div className="truncate px-3 py-1" key={`${file}-file`}>
                {file}
              </div>,
              <div className="px-3 py-1" key={`${file}-state`}>
                {state}
              </div>,
            ])}
          </div>

          <div
            className="my-5 h-px"
            style={{ backgroundColor: colors.border }}
          />

          <div className="border p-2" style={{ borderColor: colors.border }}>
            <div
              className="px-2 py-1"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              ▶ staged: src/lib/defaults.ts
            </div>
            <div className="px-2 py-1">staged: src/lib/template.ts</div>
            <div className="px-2 py-1">unstaged: src/components</div>
          </div>
        </section>

        <section
          className="flex min-h-0 flex-col border p-5"
          style={{ borderColor: colors.border }}
        >
          <h3 className="font-semibold">Diff Preview</h3>
          <pre
            className={cn(
              "mt-5 min-h-0 flex-1 overflow-hidden border p-4 whitespace-pre-wrap",
              compact ? "leading-4" : "leading-6"
            )}
            style={{ borderColor: colors.border }}
          >
            {`@@ -5,6 +5,7 @@
 export interface TemplateDefinition {
+  frameworks?: readonly TargetFramework[];
 }

@@ -41,6 +42,7 @@
 return all.filter((t) => {
+  if (t.frameworks) return t.frameworks.includes(framework);
 });`}
          </pre>
          <div className="mt-4 shrink-0" style={{ color: colors.primary }}>
            [2 files unstaged]
          </div>
        </section>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-6 px-5",
          compact ? "h-8" : "h-12"
        )}
      >
        {[
          ["q", "quit"],
          ["Tab", "focus"],
          ["Enter", "open"],
          ["s", "stage"],
          ["?", "help"],
        ].map(([key, label]) => (
          <span className="flex items-center gap-2" key={key}>
            <strong style={{ color: colors.primary }}>{key}</strong>
            <span style={{ color: colors.muted }}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CodeCanvas({ code, onCopy }: { code: string; onCopy: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#202a35]">
      <div className="flex h-10 shrink-0 items-center border-b border-white/8 bg-[#19212a] px-4">
        <FileCode2Icon className="mr-2 size-3.5 text-blue-300" />
        <span className="text-xs text-neutral-300">App.tsx</span>
        <Button
          className="ml-auto h-7 border-white/8 bg-white/3 text-[10px] text-neutral-300 hover:bg-white/8"
          onClick={onCopy}
          size="sm"
          sound="copy"
          variant="outline"
        >
          <CopyIcon />
          Copy
        </Button>
      </div>
      <pre className="no-scrollbar min-h-0 flex-1 overflow-auto p-6 font-mono text-xs leading-6 text-neutral-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function PropertiesPanel({
  align,
  bold,
  color,
  content,
  dim,
  italic,
  onAlignChange,
  onBoldChange,
  onClose,
  onColorChange,
  onContentChange,
  onDimChange,
  onItalicChange,
  onNameChange,
  onThemeChange,
  renamedLayers,
  selectedLayer,
  theme,
}: {
  align: "center" | "left" | "right";
  bold: boolean;
  color: string;
  content: string;
  dim: boolean;
  italic: boolean;
  onAlignChange: (align: "center" | "left" | "right") => void;
  onBoldChange: (bold: boolean) => void;
  onClose: () => void;
  onColorChange: (color: string) => void;
  onContentChange: (content: string) => void;
  onDimChange: (dim: boolean) => void;
  onItalicChange: (italic: boolean) => void;
  onNameChange: (name: string) => void;
  onThemeChange: (theme: ThemeSlug) => void;
  renamedLayers: Record<string, string>;
  selectedLayer: LayerNode | null;
  theme: ThemeSlug;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center border-b border-white/8 px-3">
        <SlidersHorizontalIcon className="mr-2 size-4 text-neutral-500" />
        <span className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
          Properties
        </span>
        <StudioIconButton
          className="ml-auto"
          label="Close properties panel"
          onClick={onClose}
        >
          <XIcon />
        </StudioIconButton>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <InspectorSection label="Theme">
          <div className="grid grid-cols-4 gap-2">
            {STUDIO_THEMES.map((item) => {
              const selected = theme === item.slug;
              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/8 bg-white/2 px-1 text-[9px] text-neutral-500 outline-none hover:border-white/15 hover:text-neutral-200 focus-visible:border-emerald-400",
                    selected &&
                      "border-emerald-400/80 bg-emerald-400/8 text-emerald-300"
                  )}
                  key={item.slug}
                  type="button"
                  onClick={() => onThemeChange(item.slug)}
                >
                  <span className="flex items-center -space-x-0.5">
                    {item.colors.map((swatch) => (
                      <span
                        className="size-3 rounded-[3px] border border-black/20"
                        key={swatch}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </span>
                  <span className="line-clamp-2 leading-3">{item.label}</span>
                </button>
              );
            })}
          </div>
        </InspectorSection>

        {selectedLayer ? (
          <>
            <InspectorSection label="Component">
              <InspectorField label="Name">
                <Input
                  className="h-7 border-white/8 bg-white/3 px-2 text-[11px] text-neutral-200"
                  value={renamedLayers[selectedLayer.id] ?? selectedLayer.label}
                  onChange={(event) => onNameChange(event.target.value)}
                />
              </InspectorField>
              <div className="mt-2">
                <span className="rounded bg-white/6 px-1.5 py-1 font-mono text-[9px] text-neutral-500">
                  {selectedLayer.kind}
                </span>
              </div>
            </InspectorSection>

            <InspectorSection label="Layout">
              <div className="grid grid-cols-2 gap-2">
                <InspectorField label="Width">
                  <UnitInput value="auto" />
                </InspectorField>
                <InspectorField label="Height">
                  <UnitInput value="auto" />
                </InspectorField>
                <InspectorField label="Min W">
                  <UnitInput value="—" />
                </InspectorField>
                <InspectorField label="Max W">
                  <UnitInput value="—" />
                </InspectorField>
                <InspectorField label="Min H">
                  <UnitInput value="—" />
                </InspectorField>
                <InspectorField label="Max H">
                  <UnitInput value="—" />
                </InspectorField>
              </div>

              <InspectorField className="mt-3" label="Align">
                <div className="grid grid-cols-3 overflow-hidden rounded border border-white/8">
                  {[
                    { icon: AlignLeftIcon, value: "left" as const },
                    { icon: AlignCenterIcon, value: "center" as const },
                    { icon: AlignRightIcon, value: "right" as const },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        aria-label={`Align ${item.value}`}
                        aria-pressed={align === item.value}
                        className={cn(
                          "flex h-7 items-center justify-center border-r border-white/8 text-neutral-600 last:border-r-0 hover:bg-white/5 hover:text-neutral-300",
                          align === item.value && "bg-blue-500/20 text-blue-300"
                        )}
                        key={item.value}
                        type="button"
                        onClick={() => onAlignChange(item.value)}
                      >
                        <Icon className="size-3.5" />
                      </button>
                    );
                  })}
                </div>
              </InspectorField>
              {["Grow", "Padding", "Margin"].map((label) => (
                <InspectorField className="mt-3" key={label} label={label}>
                  <UnitInput value="0" />
                </InspectorField>
              ))}
              <InspectorField className="mt-3" label="Border">
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 8 }, (_, index) => (
                    <button
                      aria-label={`Border style ${index + 1}`}
                      className={cn(
                        "h-7 rounded border border-white/8 bg-white/2 text-[10px] text-neutral-600 hover:bg-white/7",
                        index === 0 && "border-blue-500/70 bg-blue-500/15"
                      )}
                      key={index}
                      type="button"
                    >
                      {getBorderGlyph(index)}
                    </button>
                  ))}
                </div>
              </InspectorField>
            </InspectorSection>

            <InspectorSection label="Style">
              <div className="grid grid-cols-2 gap-2">
                <ToggleProperty
                  icon={BoldIcon}
                  label="Bold"
                  pressed={bold}
                  onChange={onBoldChange}
                />
                <ToggleProperty
                  icon={ItalicIcon}
                  label="Italic"
                  pressed={italic}
                  onChange={onItalicChange}
                />
                <ToggleProperty
                  icon={MinusIcon}
                  label="Dim"
                  pressed={dim}
                  onChange={onDimChange}
                />
              </div>
              <InspectorField className="mt-3" label="FG Color">
                <select
                  className="h-8 w-full rounded border border-white/8 bg-white/3 px-2 text-[11px] text-neutral-300 outline-none"
                  value={color}
                  onChange={(event) => onColorChange(event.target.value)}
                >
                  {["Green", "Cyan", "Blue", "Yellow", "Magenta", "Reset"].map(
                    (item) => (
                      <option key={item}>{item}</option>
                    )
                  )}
                </select>
              </InspectorField>
            </InspectorSection>

            <InspectorSection label="Content">
              <textarea
                aria-label="Component content"
                className="min-h-20 w-full resize-none rounded border border-white/8 bg-white/3 p-2 text-[11px] leading-5 text-neutral-300 outline-none focus:border-blue-500/60"
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
              />
              <label className="mt-2 flex items-center gap-2 text-[10px] text-neutral-500">
                <input type="checkbox" />
                Wrap
              </label>
            </InspectorSection>
          </>
        ) : (
          <div className="flex min-h-72 items-center justify-center px-6 text-center text-xs text-neutral-600">
            Select a component to edit
          </div>
        )}
      </div>
    </div>
  );
}

function InspectorSection({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <section className="border-b border-white/6 p-4">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
        <ChevronDownIcon className="size-3" />
        {label}
      </div>
      {children}
    </section>
  );
}

function InspectorField({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[9px] text-neutral-600">{label}</span>
      {children}
    </label>
  );
}

function UnitInput({ value }: { value: string }) {
  return (
    <div className="flex h-7 overflow-hidden rounded border border-white/8 bg-white/3">
      <input
        aria-label="Property value"
        className="min-w-0 flex-1 bg-transparent px-2 text-[10px] text-neutral-400 outline-none"
        defaultValue={value}
      />
      <span className="flex w-7 items-center justify-center border-l border-white/8 text-[8px] text-neutral-600">
        px
      </span>
    </div>
  );
}

function ToggleProperty({
  icon: Icon,
  label,
  onChange,
  pressed,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onChange: (pressed: boolean) => void;
  pressed: boolean;
}) {
  return (
    <button
      aria-pressed={pressed}
      className={cn(
        "flex h-8 items-center gap-2 rounded border border-white/8 bg-white/2 px-2 text-[10px] text-neutral-500 hover:bg-white/6",
        pressed && "border-blue-500/50 bg-blue-500/15 text-blue-300"
      )}
      type="button"
      onClick={() => onChange(!pressed)}
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}

function StudioStatus({
  framework,
  leftOpen,
  onLeftOpenChange,
  onRightOpenChange,
  rightOpen,
  theme,
}: {
  framework: Framework;
  leftOpen: boolean;
  onLeftOpenChange: (open: boolean) => void;
  onRightOpenChange: (open: boolean) => void;
  rightOpen: boolean;
  theme: ThemeSlug;
}) {
  const themeLabel =
    STUDIO_THEMES.find((item) => item.slug === theme)?.label ?? theme;

  return (
    <footer className="flex h-6 shrink-0 items-center border-t border-white/8 bg-[#171718] px-2 text-[9px] text-neutral-600">
      <button
        className="rounded px-1.5 py-0.5 hover:bg-white/6 hover:text-neutral-300 lg:hidden"
        type="button"
        onClick={() => onLeftOpenChange(!leftOpen)}
      >
        Layers
      </button>
      <div className="ml-auto flex items-center gap-3">
        <span>{framework === "ink" ? "Ink v6" : "OpenTUI"}</span>
        <span className="flex items-center gap-1">
          <MonitorIcon className="size-3" />
          102×40
        </span>
        <span>{themeLabel.toLowerCase()}</span>
        <button
          className="rounded px-1.5 py-0.5 hover:bg-white/6 hover:text-neutral-300 xl:hidden"
          type="button"
          onClick={() => onRightOpenChange(!rightOpen)}
        >
          Properties
        </button>
      </div>
    </footer>
  );
}

function TemplateChooser({
  framework,
  onEmptyCanvas,
  onOpenChange,
  onSelect,
  onUseTemplate,
  open,
  selected,
  selectedId,
  theme,
}: {
  framework: Framework;
  onEmptyCanvas: () => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
  onUseTemplate: () => void;
  open: boolean;
  selected: StudioTemplate;
  selectedId: string;
  theme: ThemeSlug;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="dark h-[min(760px,calc(100svh-2rem))] w-[calc(100vw-2rem)] max-w-[1040px] gap-0 overflow-hidden border-white/10 bg-[#0e0e0f] p-0 text-neutral-100 shadow-2xl duration-200 motion-reduce:animate-none motion-reduce:transition-none sm:max-w-[1040px]"
        overlayClassName="bg-black/65 backdrop-blur-md motion-reduce:animate-none"
      >
        <div className="flex h-14 shrink-0 items-center border-b border-white/8 px-4 pr-24">
          <DialogHeader className="gap-0 text-left">
            <DialogTitle className="text-sm">Choose a Template</DialogTitle>
            <DialogDescription className="text-[10px] text-neutral-600">
              {STUDIO_TEMPLATES.length} templates
            </DialogDescription>
          </DialogHeader>
          <Button
            className="absolute top-3 right-12 h-8 border-white/8 bg-white/5 text-[10px] text-neutral-400 hover:bg-white/10 hover:text-white"
            onClick={onEmptyCanvas}
            size="sm"
            sound="click"
            variant="outline"
          >
            Empty Canvas
          </Button>
        </div>

        <div className="flex min-h-0 flex-1">
          <nav
            aria-label="Templates"
            className="no-scrollbar w-60 shrink-0 overflow-y-auto border-r border-white/8 py-1"
          >
            {STUDIO_TEMPLATES.map((template) => (
              <button
                aria-current={template.id === selectedId ? "true" : undefined}
                className={cn(
                  "flex h-9 w-full items-center gap-2 border-b border-white/4 px-3 text-left text-[11px] text-neutral-400 outline-none hover:bg-white/5 hover:text-neutral-100 focus-visible:bg-white/7",
                  template.id === selectedId && "bg-white/10 text-white"
                )}
                key={template.id}
                type="button"
                onClick={() => onSelect(template.id)}
              >
                <span className="truncate">{template.title}</span>
                {template.badge && (
                  <span
                    className={cn(
                      "ml-auto rounded px-1.5 py-0.5 text-[8px]",
                      template.badge === "PRO"
                        ? "bg-violet-500/15 text-violet-300"
                        : "bg-cyan-500/15 text-cyan-300"
                    )}
                  >
                    {template.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#0a0a0b] p-8">
              <div
                className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl motion-reduce:animate-none"
                key={`${selected.id}-${framework}-${theme}`}
              >
                {selected.id === "git-status" ? (
                  <GitStatusStudioPreview compact theme={theme} />
                ) : (
                  <TerminalPreview
                    base={framework}
                    name={selected.preview}
                    rows={20}
                    theme={theme}
                  />
                )}
              </div>
            </div>
            <div className="flex min-h-14 shrink-0 items-center gap-4 border-t border-white/8 px-4">
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  {selected.title}
                </div>
                <div className="truncate text-[10px] text-neutral-600">
                  {selected.description}
                </div>
              </div>
              <Button
                className="ml-auto h-8 bg-neutral-100 px-4 text-[10px] text-neutral-950 hover:bg-white"
                onClick={onUseTemplate}
                size="sm"
                sound="click"
              >
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
