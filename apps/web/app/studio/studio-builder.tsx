"use client";

/* eslint-disable func-style, no-use-before-define -- Builder subcomponents are kept in screen-reading order. */

import { api } from "@termcn/backend/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
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
  LockIcon,
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
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { LogoMark } from "@/components/logo";
import { ModeSwitcher } from "@/components/mode-switcher";
import { TerminalPreview } from "@/components/terminal-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type Framework = "ink" | "opentui";
type StudioExport = "copy" | "file" | "project";
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

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  loading: () => <CodeEditorSkeleton />,
  ssr: false,
});

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
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const access = useQuery(
    api.billing.getCurrentAccess,
    isAuthenticated ? {} : "skip"
  );
  const isDesktop = useMediaQuery("(min-width: 1280px)");
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
  const [exportGateOpen, setExportGateOpen] = useState(false);

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
  const [code, setCode] = useState(generatedCode);
  const canExport = access?.products.bundle === true;
  const isExportLoading =
    isAuthLoading || (isAuthenticated && access === undefined);

  useEffect(() => {
    setCode(generatedCode);
  }, [generatedCode]);

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
        code,
        framework,
        template: activeTemplate?.id ?? null,
        theme,
      })
    );
    toast.success("Project saved locally");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("TypeScript copied");
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "App.tsx";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("App.tsx downloaded");
  };

  const copyProjectCommand = async () => {
    await navigator.clipboard.writeText(
      `pnpm dlx termcn@latest studio --template ${activeTemplate?.id ?? "blank"}`
    );
    toast.success("Project command copied");
  };

  const requestExport = (kind: StudioExport) => {
    if (isExportLoading) {
      toast("Checking Pro access…");
      return;
    }
    if (!canExport) {
      setExportGateOpen(true);
      return;
    }
    if (kind === "file") {
      downloadCode();
      return;
    }
    if (kind === "project") {
      void copyProjectCommand();
      return;
    }
    void copyCode();
  };

  return (
    <div className="bg-muted/30 min-h-svh">
      <DesktopStudioNotice />

      <div className="bg-background text-foreground hidden h-svh min-h-[680px] w-full flex-col overflow-hidden font-sans xl:flex">
        <StudioToolbar
          activeTemplate={activeTemplate}
          canExport={canExport}
          framework={framework}
          isExportLoading={isExportLoading}
          leftOpen={leftOpen}
          rightOpen={rightOpen}
          onFrameworkChange={setFramework}
          onLeftOpenChange={setLeftOpen}
          onOpenTemplates={() => setTemplateOpen(true)}
          onRequestExport={requestExport}
          onRightOpenChange={setRightOpen}
          onSave={saveProject}
        />

        <div className="flex min-h-0 flex-1">
          {leftOpen && (
            <aside className="bg-background flex w-[262px] shrink-0 flex-col border-r">
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

          <main className="bg-muted/20 flex min-w-0 flex-1 flex-col">
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
                selectedLayerId={selectedLayerId}
                theme={theme}
                onOpenTemplates={() => setTemplateOpen(true)}
              />
            ) : (
              <CodeCanvas
                canExport={canExport}
                code={code}
                framework={framework}
                onChange={setCode}
                onCopy={() => requestExport("copy")}
              />
            )}
          </main>

          {rightOpen && (
            <aside className="bg-background flex w-[320px] shrink-0 flex-col border-l">
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
      </div>

      {isDesktop && (
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
      )}

      <ExportGateDialog
        isAuthenticated={isAuthenticated}
        open={exportGateOpen}
        onOpenChange={setExportGateOpen}
      />
    </div>
  );
}

function StudioToolbar({
  activeTemplate,
  canExport,
  framework,
  isExportLoading,
  leftOpen,
  onFrameworkChange,
  onLeftOpenChange,
  onOpenTemplates,
  onRequestExport,
  onRightOpenChange,
  onSave,
  rightOpen,
}: {
  activeTemplate: StudioTemplate | null;
  canExport: boolean;
  framework: Framework;
  isExportLoading: boolean;
  leftOpen: boolean;
  onFrameworkChange: (framework: Framework) => void;
  onLeftOpenChange: (open: boolean) => void;
  onOpenTemplates: () => void;
  onRequestExport: (kind: StudioExport) => void;
  onRightOpenChange: (open: boolean) => void;
  onSave: () => void;
  rightOpen: boolean;
}) {
  let exportIcon = <LockIcon />;
  if (isExportLoading) {
    exportIcon = <LoaderCircleIcon className="animate-spin" />;
  } else if (canExport) {
    exportIcon = <DownloadIcon />;
  }

  return (
    <header className="bg-background relative flex h-14 shrink-0 items-center border-b px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex items-center gap-2 border-r pr-3">
          <LogoMark className="size-5" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            termcn
            <span className="text-muted-foreground">.studio</span>
          </span>
        </div>
        <StudioIconButton
          label={leftOpen ? "Hide left panel" : "Show left panel"}
          onClick={() => onLeftOpenChange(!leftOpen)}
        >
          {leftOpen ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
        </StudioIconButton>
      </div>

      <div className="text-muted-foreground pointer-events-none absolute left-1/2 max-w-[28vw] -translate-x-1/2 truncate text-sm font-medium">
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
        <span className="bg-border mx-1 hidden h-5 w-px sm:block" />
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
              className="text-muted-foreground size-8 rounded-lg"
              size="icon-sm"
              sound="click"
              variant="ghost"
            >
              <BoxesIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-1.5">
            <DropdownMenuItem onSelect={onOpenTemplates}>
              <BoxesIcon />
              <div className="flex flex-col">
                <span>Template gallery</span>
                <span className="text-muted-foreground text-[10px]">
                  Start from a complete screen
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRequestExport("file")}>
              <FileCode2Icon />
              <div className="flex flex-col">
                <span>TypeScript file</span>
                <span className="text-muted-foreground text-[10px]">
                  Download App.tsx
                </span>
              </div>
              {!canExport && <LockIcon className="ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onRequestExport("copy")}>
              <CopyIcon />
              Copy code
              {!canExport && <LockIcon className="ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeSwitcher />
        <span className="bg-border mx-1 h-5 w-px" />
        <NativeSelect
          aria-label="Renderer"
          className="w-28 font-mono"
          size="sm"
          value={framework}
          onChange={(event) =>
            onFrameworkChange(event.target.value as Framework)
          }
        >
          <NativeSelectOption value="ink">Ink v6</NativeSelectOption>
          <NativeSelectOption value="opentui">OpenTUI</NativeSelectOption>
        </NativeSelect>
        <DropdownMenu>
          <div className="flex">
            <Button
              className="h-8 rounded-r-none px-3"
              disabled={isExportLoading}
              onClick={() => onRequestExport("file")}
              sound="click"
              variant={canExport ? "default" : "outline"}
            >
              {exportIcon}
              <span className="hidden xl:inline">Export</span>
            </Button>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open export menu"
                className="h-8 rounded-l-none border-l px-2"
                sound="click"
                variant={canExport ? "default" : "outline"}
              >
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="end" className="w-64 p-1.5">
            <DropdownMenuItem onSelect={() => onRequestExport("project")}>
              <TerminalIcon />
              <div className="flex flex-col">
                <span>npm project</span>
                <span className="text-muted-foreground text-[10px]">
                  package.json + App.tsx
                </span>
              </div>
              {!canExport && <LockIcon className="ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRequestExport("file")}>
              <FileCode2Icon />
              <div className="flex flex-col">
                <span>TypeScript file</span>
                <span className="text-muted-foreground text-[10px]">
                  App.tsx only
                </span>
              </div>
              {!canExport && <LockIcon className="ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onRequestExport("copy")}>
              <CopyIcon />
              <div className="flex flex-col">
                <span>Copy code</span>
                <span className="text-muted-foreground text-[10px]">
                  Copy TypeScript code
                </span>
              </div>
              {!canExport && <LockIcon className="ml-auto" />}
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={cn("text-muted-foreground size-8 rounded-lg", className)}
          size="icon-sm"
          sound="click"
          variant="ghost"
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
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
    <Tabs
      className="h-12 shrink-0 gap-0 border-b px-3"
      value={active}
      onValueChange={(value) => onChange(value as T)}
    >
      <TabsList
        className={cn(
          "h-full gap-1 rounded-none bg-transparent p-0",
          fill ? "w-full" : "w-fit"
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              className={cn(
                "data-[state=active]:border-primary relative h-full rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-3 text-xs shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                fill ? "flex-1" : "min-w-24"
              )}
              key={tab.id}
              value={tab.id}
            >
              <Icon className="size-4" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
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
      <div className="flex h-11 shrink-0 items-center border-b px-3">
        <Layers3Icon className="text-muted-foreground mr-2 size-4" />
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
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
      <div className="text-muted-foreground border-t px-3 py-2 text-[10px]">
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
            "group hover:bg-muted flex h-8 items-center pr-2 text-xs",
            selected && "bg-accent text-accent-foreground"
          )}
          style={{ paddingLeft: 6 + depth * 16 }}
        >
          <Button
            aria-label={
              open ? `Collapse ${node.label}` : `Expand ${node.label}`
            }
            className={cn(
              "size-5 shrink-0 rounded",
              !hasChildren && "pointer-events-none opacity-0"
            )}
            size="icon-sm"
            variant="ghost"
            onClick={() => hasChildren && onToggle(node.id)}
          >
            <ChevronRightIcon
              className={cn("size-3 transition-transform", open && "rotate-90")}
            />
          </Button>
          <Button
            className="h-8 min-w-0 flex-1 justify-start gap-2 px-1 text-left text-xs font-normal"
            variant="ghost"
            onClick={() => onSelect(node.id)}
          >
            <Icon className="text-muted-foreground size-3.5 shrink-0" />
            <span className="truncate">
              {renamedLayers[node.id] ?? node.label}
            </span>
            {hasChildren && (
              <span className="text-muted-foreground ml-auto text-[10px]">
                {node.children?.length}
              </span>
            )}
          </Button>
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
      <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Components
        </span>
        <Badge variant="secondary">{ASSETS.length}</Badge>
        <StudioIconButton
          className="ml-auto"
          label="Close assets panel"
          onClick={onClose}
        >
          <XIcon />
        </StudioIconButton>
      </div>
      <div className="border-b p-3">
        <div className="relative">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            aria-label="Search widgets"
            className="h-8 pl-8 text-xs"
            placeholder="Search widgets..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto">
          {ASSET_CATEGORIES.map((item) => (
            <Button
              className="h-6 rounded-full px-2 text-[9px]"
              key={item}
              size="sm"
              variant={category === item ? "secondary" : "ghost"}
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <div className="no-scrollbar grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-1.5 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              className="group text-muted-foreground hover:text-foreground min-h-16 h-auto flex-col gap-1.5 p-2 text-[9px] font-normal"
              key={item.label}
              variant="outline"
              onClick={() => onAdd(item.label)}
            >
              <Icon className="size-4" />
              <span className="line-clamp-2">{item.label}</span>
            </Button>
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
  selectedLayerId,
  theme,
}: {
  activeTemplate: StudioTemplate | null;
  framework: Framework;
  onOpenTemplates: () => void;
  selectedLayer: LayerNode | null;
  selectedLayerId: string | null;
  theme: ThemeSlug;
}) {
  if (!activeTemplate) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-8">
        <Button
          className="text-muted-foreground hover:text-foreground min-h-64 h-auto w-full max-w-2xl flex-col gap-4 border-dashed"
          variant="outline"
          onClick={onOpenTemplates}
        >
          <span className="bg-muted flex size-12 items-center justify-center rounded-xl border">
            <PlusIcon className="size-5" />
          </span>
          <span className="text-center">
            <span className="text-foreground block text-sm font-medium">
              Start with a template
            </span>
            <span className="mt-1 block text-xs">
              Or add components from the Assets panel
            </span>
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 relative flex min-h-0 flex-1 overflow-auto p-4">
      <div
        className={cn(
          "bg-card relative m-auto w-full min-w-[680px] max-w-[1280px] overflow-hidden rounded-lg border shadow-xl",
          selectedLayerId === "root" && "ring-primary ring-2 ring-offset-2"
        )}
      >
        {activeTemplate.id === "git-status" ? (
          <GitStatusStudioPreview
            selectedLayerId={selectedLayerId}
            theme={theme}
          />
        ) : (
          <>
            <TerminalPreview
              base={framework}
              name={activeTemplate.preview}
              rows={38}
              theme={theme}
            />
            <GenericSelectionOverlay layerId={selectedLayerId} />
          </>
        )}
      </div>
      {selectedLayer && (
        <Badge
          className="pointer-events-none absolute right-5 bottom-5 shadow-sm"
          variant="secondary"
        >
          Editing {selectedLayer.label}
        </Badge>
      )}
    </div>
  );
}

function GitStatusStudioPreview({
  compact = false,
  selectedLayerId = null,
  theme,
}: {
  compact?: boolean;
  selectedLayerId?: string | null;
  theme: ThemeSlug;
}) {
  const colors = STUDIO_THEME_STYLES[theme];
  const selectedClass = (id: string) =>
    !compact &&
    selectedLayerId === id &&
    "relative z-10 ring-2 ring-blue-500 ring-inset bg-blue-500/10";
  const files = [
    ["src/lib/template.ts", "modified"],
    ["src/components/app.tsx", "modified"],
    ["src/lib/defaults.ts", "staged"],
  ];

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden font-mono",
        compact ? "h-[360px] text-[10px]" : "min-h-[680px] text-sm",
        selectedClass("root")
      )}
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
      }}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border px-4",
          compact ? "m-2 h-9" : "m-4 h-12",
          selectedClass("header")
        )}
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <span
          className={cn("font-semibold", selectedClass("branch"))}
          style={{ color: colors.accent }}
        >
          On branch feature/template-frameworks
        </span>
        <span
          className={cn("ml-3", selectedClass("ahead"))}
          style={{ color: colors.primary }}
        >
          [ahead 2]
        </span>
        <span
          className={cn("min-w-3 flex-1", selectedClass("header-spacer"))}
        />
        <span
          className={cn("hidden sm:inline", selectedClass("hint"))}
          style={{ color: colors.muted }}
        >
          working tree has pending changes
        </span>
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-[minmax(190px,0.8fr)_minmax(320px,1.8fr)]",
          compact ? "gap-2 px-2" : "gap-4 px-4",
          selectedClass("body")
        )}
      >
        <section
          className={cn(
            "flex min-h-0 flex-col border p-4",
            selectedClass("status-pane")
          )}
          style={{ borderColor: colors.border }}
        >
          <div
            className={cn(
              "grid grid-cols-[1.5fr_1fr] border",
              selectedClass("changed-files")
            )}
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
            className={cn("my-5 h-px", selectedClass("status-separator"))}
            style={{ backgroundColor: colors.border }}
          />

          <div
            className={cn("border p-2", selectedClass("staged-files"))}
            style={{ borderColor: colors.border }}
          >
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
          className={cn(
            "flex min-h-0 flex-col border p-5",
            selectedClass("diff-pane")
          )}
          style={{ borderColor: colors.border }}
        >
          <h3 className={cn("font-semibold", selectedClass("diff-title"))}>
            Diff Preview
          </h3>
          <pre
            className={cn(
              "mt-5 min-h-0 flex-1 overflow-hidden border p-4 whitespace-pre-wrap",
              compact ? "leading-4" : "leading-6",
              selectedClass("diff")
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
          <div
            className={cn("mt-4 shrink-0", selectedClass("unstaged"))}
            style={{ color: colors.primary }}
          >
            [2 files unstaged]
          </div>
        </section>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-6 px-5",
          compact ? "h-8" : "h-12",
          selectedClass("helpbar")
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

const GENERIC_LAYER_BOUNDS: Record<string, string> = {
  body: "top-[19%] right-[3%] bottom-[12%] left-[3%]",
  content: "top-[25%] right-[8%] bottom-[34%] left-[8%]",
  "content-list": "right-[8%] bottom-[17%] left-[8%] h-[14%]",
  "content-separator": "top-[64%] right-[8%] left-[8%] h-3",
  header: "top-[3%] right-[3%] left-[3%] h-[14%]",
  "header-hint": "top-[7%] right-[6%] h-[6%] w-[24%]",
  helpbar: "right-[3%] bottom-[3%] left-[3%] h-[7%]",
  root: "inset-0",
  title: "top-[7%] left-[6%] h-[6%] w-[28%]",
};

function GenericSelectionOverlay({ layerId }: { layerId: string | null }) {
  if (!layerId) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-20 rounded-sm bg-blue-500/10 ring-2 ring-blue-500 ring-inset",
        GENERIC_LAYER_BOUNDS[layerId] ?? "inset-[8%]"
      )}
    >
      <Badge className="absolute top-2 left-2 shadow-sm" variant="secondary">
        {layerId}
      </Badge>
    </div>
  );
}

function CodeEditorSkeleton() {
  return (
    <div className="bg-background grid h-full gap-3 p-5">
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton
          className={cn("h-4", index % 3 === 0 ? "w-3/5" : "w-4/5")}
          key={index}
        />
      ))}
    </div>
  );
}

function CodeCanvas({
  canExport,
  code,
  framework,
  onChange,
  onCopy,
}: {
  canExport: boolean;
  code: string;
  framework: Framework;
  onChange: (value: string) => void;
  onCopy: () => void;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <div className="bg-muted/40 flex h-10 shrink-0 items-center border-b px-4">
        <FileCode2Icon className="text-muted-foreground mr-2 size-3.5" />
        <span className="font-mono text-xs">App.tsx</span>
        <Badge className="ml-2" variant="secondary">
          {framework === "ink" ? "Ink v6" : "OpenTUI"}
        </Badge>
        <Button
          className="ml-auto h-7 text-[10px]"
          onClick={onCopy}
          size="sm"
          sound="copy"
          variant="outline"
        >
          {canExport ? <CopyIcon /> : <LockIcon />}
          Copy
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <MonacoEditor
          beforeMount={(monaco) => {
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: true,
              }
            );
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              allowNonTsExtensions: true,
              jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
              target: monaco.languages.typescript.ScriptTarget.ES2022,
            });
          }}
          language="typescript"
          loading={<CodeEditorSkeleton />}
          path={`${framework}/App.tsx`}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => onChange(value ?? "")}
          options={{
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            fontFamily:
              "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontLigatures: true,
            fontSize: 13,
            lineHeight: 22,
            minimap: { enabled: true, scale: 1 },
            padding: { bottom: 16, top: 16 },
            renderLineHighlight: "all",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>
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
      <div className="flex h-12 shrink-0 items-center border-b px-3">
        <SlidersHorizontalIcon className="text-muted-foreground mr-2 size-4" />
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
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
                <Button
                  aria-pressed={selected}
                  className="min-h-14 h-auto flex-col gap-1.5 px-1 text-[9px] font-normal"
                  key={item.slug}
                  variant={selected ? "secondary" : "outline"}
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
                </Button>
              );
            })}
          </div>
        </InspectorSection>

        {selectedLayer ? (
          <>
            <InspectorSection label="Component">
              <InspectorField label="Name">
                <Input
                  className="h-7 px-2 text-[11px]"
                  value={renamedLayers[selectedLayer.id] ?? selectedLayer.label}
                  onChange={(event) => onNameChange(event.target.value)}
                />
              </InspectorField>
              <div className="mt-2">
                <Badge className="font-mono text-[9px]" variant="secondary">
                  {selectedLayer.kind}
                </Badge>
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
                <div className="grid grid-cols-3 overflow-hidden rounded-md border">
                  {[
                    { icon: AlignLeftIcon, value: "left" as const },
                    { icon: AlignCenterIcon, value: "center" as const },
                    { icon: AlignRightIcon, value: "right" as const },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Toggle
                        aria-label={`Align ${item.value}`}
                        className="h-7 rounded-none border-r last:border-r-0"
                        key={item.value}
                        pressed={align === item.value}
                        size="sm"
                        onPressedChange={(pressed) => {
                          if (pressed) {
                            onAlignChange(item.value);
                          }
                        }}
                      >
                        <Icon className="size-3.5" />
                      </Toggle>
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
                    <Button
                      aria-label={`Border style ${index + 1}`}
                      className="h-7 px-0 text-[10px]"
                      key={index}
                      size="sm"
                      variant={index === 0 ? "secondary" : "outline"}
                    >
                      {getBorderGlyph(index)}
                    </Button>
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
                <NativeSelect
                  className="w-full text-[11px]"
                  size="sm"
                  value={color}
                  onChange={(event) => onColorChange(event.target.value)}
                >
                  {["Green", "Cyan", "Blue", "Yellow", "Magenta", "Reset"].map(
                    (item) => (
                      <NativeSelectOption key={item}>{item}</NativeSelectOption>
                    )
                  )}
                </NativeSelect>
              </InspectorField>
            </InspectorSection>

            <InspectorSection label="Content">
              <Textarea
                aria-label="Component content"
                className="min-h-20 resize-none text-[11px] leading-5"
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
              />
              <label
                className="text-muted-foreground mt-3 flex items-center gap-2 text-[10px]"
                htmlFor="studio-wrap-content"
              >
                <Switch id="studio-wrap-content" />
                Wrap
              </label>
            </InspectorSection>
          </>
        ) : (
          <div className="text-muted-foreground flex min-h-72 items-center justify-center px-6 text-center text-xs">
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
    <section className="border-b p-4">
      <div className="text-muted-foreground mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider uppercase">
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
      <span className="text-muted-foreground mb-1 block text-[9px]">
        {label}
      </span>
      {children}
    </label>
  );
}

function UnitInput({ value }: { value: string }) {
  return (
    <div className="flex h-7 overflow-hidden rounded-md border">
      <Input
        aria-label="Property value"
        className="h-7 min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 text-[10px] shadow-none focus-visible:ring-0"
        defaultValue={value}
      />
      <span className="text-muted-foreground flex w-7 items-center justify-center border-l text-[8px]">
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
    <Toggle
      className="h-8 justify-start gap-2 px-2 text-[10px]"
      pressed={pressed}
      size="sm"
      variant="outline"
      onPressedChange={onChange}
    >
      <Icon className="size-3" />
      {label}
    </Toggle>
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
    <footer className="bg-background text-muted-foreground flex h-7 shrink-0 items-center border-t px-2 text-[9px]">
      <Button
        className="h-5 px-1.5 text-[9px] lg:hidden"
        size="sm"
        variant="ghost"
        onClick={() => onLeftOpenChange(!leftOpen)}
      >
        Layers
      </Button>
      <div className="ml-auto flex items-center gap-3">
        <span>{framework === "ink" ? "Ink v6" : "OpenTUI"}</span>
        <span className="flex items-center gap-1">
          <MonitorIcon className="size-3" />
          102×40
        </span>
        <span>{themeLabel.toLowerCase()}</span>
        <Button
          className="h-5 px-1.5 text-[9px] xl:hidden"
          size="sm"
          variant="ghost"
          onClick={() => onRightOpenChange(!rightOpen)}
        >
          Properties
        </Button>
      </div>
    </footer>
  );
}

function DesktopStudioNotice() {
  return (
    <div className="grid min-h-svh place-items-center p-6 xl:hidden">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge className="mb-2" variant="outline">
            <MonitorIcon />
            Desktop workspace
          </Badge>
          <CardTitle className="text-2xl">Studio needs more room</CardTitle>
          <CardDescription className="leading-6">
            termcn Studio is available on desktop screens at least 1280 pixels
            wide. Your project stays available when you return on desktop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted text-muted-foreground rounded-lg border p-4 text-sm leading-6">
            The layer tree, live terminal canvas, properties inspector, and code
            workspace are designed to remain visible together.
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button asChild>
            <Link href={ROUTES.HOME}>Back to termcn</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.PRO}>Explore Pro</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ExportGateDialog({
  isAuthenticated,
  onOpenChange,
  open,
}: {
  isAuthenticated: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const destination = isAuthenticated
    ? ROUTES.PRO
    : `${ROUTES.SIGN_IN}?callbackURL=${encodeURIComponent(ROUTES.STUDIO)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Badge className="mb-2" variant="outline">
            <LockIcon />
            Pro export
          </Badge>
          <DialogTitle>
            {isAuthenticated
              ? "Upgrade to export your Studio project"
              : "Sign in to export your Studio project"}
          </DialogTitle>
          <DialogDescription className="leading-6">
            Everyone can build, theme, preview, and edit code in Studio. Export,
            downloads, and copying generated project code are available with a
            termcn Pro bundle.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex gap-2">
          <Button asChild className="flex-1">
            <Link href={destination}>
              {isAuthenticated ? "View Pro plans" : "Sign in"}
            </Link>
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Keep building
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
        className="bg-background text-foreground h-[min(760px,calc(100svh-2rem))] w-[calc(100vw-2rem)] max-w-[1040px] gap-0 overflow-hidden p-0 shadow-2xl duration-200 motion-reduce:animate-none motion-reduce:transition-none sm:max-w-[1040px]"
        overlayClassName="bg-background/70 backdrop-blur-md motion-reduce:animate-none"
      >
        <div className="flex h-14 shrink-0 items-center border-b px-4 pr-24">
          <DialogHeader className="gap-0 text-left">
            <DialogTitle className="text-sm">Choose a Template</DialogTitle>
            <DialogDescription className="text-[10px]">
              {STUDIO_TEMPLATES.length} templates
            </DialogDescription>
          </DialogHeader>
          <Button
            className="absolute top-3 right-12 h-8 text-[10px]"
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
            className="no-scrollbar w-60 shrink-0 overflow-y-auto border-r py-1"
          >
            {STUDIO_TEMPLATES.map((template) => (
              <Button
                aria-current={template.id === selectedId ? "true" : undefined}
                className="h-9 w-full justify-start rounded-none border-b px-3 text-left text-[11px] font-normal"
                key={template.id}
                variant={template.id === selectedId ? "secondary" : "ghost"}
                onClick={() => onSelect(template.id)}
              >
                <span className="truncate">{template.title}</span>
                {template.badge && (
                  <Badge
                    className={cn(
                      "ml-auto text-[8px]",
                      template.badge === "PRO"
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
                        : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                    )}
                    variant="secondary"
                  >
                    {template.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="bg-muted/40 flex min-h-0 flex-1 items-center justify-center overflow-auto p-8">
              <div
                className="w-full max-w-2xl overflow-hidden rounded-lg border bg-black shadow-2xl motion-reduce:animate-none"
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
            <div className="flex min-h-14 shrink-0 items-center gap-4 border-t px-4">
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  {selected.title}
                </div>
                <div className="text-muted-foreground truncate text-[10px]">
                  {selected.description}
                </div>
              </div>
              <Button
                className="ml-auto h-8 px-4 text-[10px]"
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
