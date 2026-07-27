"use client";

import { ChevronDownIcon } from "lucide-react";

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

const getPromptUrl = (baseURL: string, url: string, param = "q") =>
  `${baseURL}?${param}=${encodeURIComponent(
    `I'm looking at this termcn documentation: ${url}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.
`
  )}`;

const MENU_ITEMS: [string, (url: string) => React.ReactNode][] = [
  [
    "markdown",
    (url) => (
      <a href={`${url}.mdx`} rel="noopener noreferrer" target="_blank">
        <MarkdownDocIcon />
        View as Markdown
      </a>
    ),
  ],
  [
    "v0",
    (url) => (
      <a
        href={getPromptUrl("https://v0.dev", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <V0Icon />
        <span className="-translate-x-[2px]">Open in v0</span>
      </a>
    ),
  ],
  [
    "cursor",
    (url) => (
      <a
        href={getPromptUrl("https://cursor.com/link/prompt", url, "text")}
        rel="noopener noreferrer"
        target="_blank"
      >
        <CursorIcon />
        Open in Cursor
      </a>
    ),
  ],
  [
    "chatgpt",
    (url) => (
      <a
        href={getPromptUrl("https://chatgpt.com", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ChatGptIcon />
        Open in ChatGPT
      </a>
    ),
  ],
  [
    "claude",
    (url) => (
      <a
        href={getPromptUrl("https://claude.ai/new", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ClaudeIcon />
        Open in Claude
      </a>
    ),
  ],
  [
    "perplexity",
    (url) => (
      <a
        href={getPromptUrl("https://perplexity.ai", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <PerplexityIcon />
        Open in Perplexity
      </a>
    ),
  ],
  [
    "gemini",
    (url) => (
      <a
        href={getPromptUrl("https://gemini.google.com/app", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GeminiIcon />
        Open in Gemini
      </a>
    ),
  ],
  [
    "grok",
    (url) => (
      <a
        href={getPromptUrl("https://grok.com", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GrokIcon />
        Open in Grok
      </a>
    ),
  ],
  [
    "scira",
    (url) => (
      <a
        className="m-0 p-0"
        href={getPromptUrl("https://scira.ai/", url)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SciraIcon />
        Open in Scira AI
      </a>
    ),
  ],
];

export const DocsCopyPage = ({ page, url }: { page: string; url: string }) => {
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
          Copy Page
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
                {render(url)}
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
              {render(url)}
            </Button>
          ))}
        </PopoverContent>
      </div>
    </Popover>
  );
};
