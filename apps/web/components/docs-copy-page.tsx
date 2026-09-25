"use client";

import { ChevronDownIcon } from "lucide-react";
import { useIntlayer } from "next-intlayer";

import {
  ChatGptIcon,
  ClaudeIcon,
  CursorIcon,
  GeminiIcon,
  GrokIcon,
  MarkdownDocIcon,
  PerplexityIcon,
  SciraIcon,
  V0Icon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { CopyButton } from "./copy-button";

interface MenuItemArgs {
  label: React.ReactNode;
  prompt: string;
  url: string;
}

const getPromptUrl = (baseURL: string, prompt: string, param = "q") =>
  `${baseURL}?${param}=${encodeURIComponent(prompt)}`;

const MENU_ITEMS: [string, (args: MenuItemArgs) => React.ReactNode][] = [
  [
    "markdown",
    ({ label, url }) => (
      <a href={`${url}.mdx`} rel="noopener noreferrer" target="_blank">
        <MarkdownDocIcon />
        {label}
      </a>
    ),
  ],
  [
    "v0",
    ({ label, prompt }) => (
      <a
        href={getPromptUrl("https://v0.dev", prompt)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <V0Icon />
        <span className="-translate-x-[2px]">{label}</span>
      </a>
    ),
  ],
  [
    "cursor",
    ({ label, prompt }) => (
      <a
        href={getPromptUrl("https://cursor.com/link/prompt", prompt, "text")}
        rel="noopener noreferrer"
        target="_blank"
      >
        <CursorIcon />
        {label}
      </a>
    ),
  ],
  [
    "chatgpt",
    ({ label, prompt }) => (
      <a
        href={getPromptUrl("https://chatgpt.com", prompt)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ChatGptIcon />
        {label}
      </a>
    ),
  ],
  [
    "claude",
    ({ label, prompt }) => (
      <a
        href={getPromptUrl("https://claude.ai/new", prompt)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ClaudeIcon />
        {label}
      </a>
    ),
  ],
  [
    "perplexity",
    ({ label, prompt }) => (
      <a
        href={getPromptUrl("https://perplexity.ai", prompt)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <PerplexityIcon />
        {label}
      </a>
    ),
  ],
  [
    "gemini",
    ({ label, prompt }) => (
      <a
        href={getPromptUrl("https://gemini.google.com/app", prompt)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GeminiIcon />
        {label}
      </a>
    ),
  ],
  [
    "grok",
    ({ label, prompt }) => (
      <a
        href={getPromptUrl("https://grok.com", prompt)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GrokIcon />
        {label}
      </a>
    ),
  ],
  [
    "scira",
    ({ label, prompt }) => (
      <a
        className="m-0 p-0"
        href={getPromptUrl("https://scira.ai/", prompt)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SciraIcon />
        {label}
      </a>
    ),
  ],
];

export const DocsCopyPage = ({ page, url }: { page: string; url: string }) => {
  const content = useIntlayer("docs-copy-page");
  const prompt = String(content.aiPrompt({ url }));
  const menuLabels: Record<string, React.ReactNode> = {
    chatgpt: content.openInChatGpt,
    claude: content.openInClaude,
    cursor: content.openInCursor,
    gemini: content.openInGemini,
    grok: content.openInGrok,
    markdown: content.viewAsMarkdown,
    perplexity: content.openInPerplexity,
    scira: content.openInScira,
    v0: content.openInV0,
  };

  const trigger = (
    <Button
      variant="secondary"
      size="sm"
      className="peer -ml-0.5 size-8 md:size-7 md:text-[0.8rem]"
    >
      <ChevronDownIcon className="rotate-180 sm:rotate-0" />
    </Button>
  );

  return (
    <Popover sounds>
      <div className="group/buttons relative flex rounded-lg bg-secondary *:data-[slot=button]:focus-visible:relative *:data-[slot=button]:focus-visible:z-10">
        <PopoverAnchor />
        <CopyButton
          value={page}
          showTooltip={false}
          sound="copy"
          variant="secondary"
          className="md:h-7 md:text-[0.8rem]"
        >
          {content.copyPage}
        </CopyButton>
        <DropdownMenu sounds>
          <DropdownMenuTrigger asChild className="hidden sm:flex">
            {trigger}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="animate-none! rounded-lg shadow-none"
          >
            {MENU_ITEMS.map(([key, render]) => (
              <DropdownMenuItem key={key} asChild sound="click">
                {render({ label: menuLabels[key], prompt, url })}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator
          orientation="vertical"
          className="absolute top-1 right-8 z-0 h-6! bg-foreground/5! peer-focus-visible:opacity-0 sm:right-7 sm:h-5!"
        />
        <PopoverTrigger asChild className="flex sm:hidden">
          {trigger}
        </PopoverTrigger>
        <PopoverContent
          className="w-52 origin-center! rounded-lg bg-background/70 p-1 shadow-none backdrop-blur-sm dark:bg-background/60"
          align="start"
        >
          {MENU_ITEMS.map(([key, render]) => (
            <Button
              variant="ghost"
              size="lg"
              asChild
              key={key}
              sound="click"
              className="w-full justify-start text-base font-normal *:[svg]:text-muted-foreground"
            >
              {render({ label: menuLabels[key], prompt, url })}
            </Button>
          ))}
        </PopoverContent>
      </div>
    </Popover>
  );
};
