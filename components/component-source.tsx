import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper";
import { formatCode } from "@/lib/format-code";
import { highlightCode } from "@/lib/highlight-code";
import { readFileFromRoot } from "@/lib/read-file";
import { getDemoSource, getRegistrySource } from "@/lib/registry";
import { cn } from "@/lib/utils";
import type { BaseName } from "@/registry/bases";

import { CopyButton } from "./copy-button";
import { getIconForLanguageExtension } from "./icons";

const ComponentCode = ({
  code,
  highlightedCode,
  language,
  title,
}: {
  code: string;
  highlightedCode: string;
  language: string;
  title: string | undefined;
}) => (
  <figure data-rehype-pretty-code-figure="" className="[&>pre]:max-h-96">
    {title && (
      <figcaption
        data-rehype-pretty-code-title=""
        className="flex items-center gap-2 text-code-foreground [&_svg]:size-4 [&_svg]:text-code-foreground [&_svg]:opacity-70"
        data-language={language}
      >
        {getIconForLanguageExtension(language)}
        {title}
      </figcaption>
    )}
    <CopyButton value={code} event="copy_primitive_code" />
    {/* eslint-disable-next-line react/no-danger */}
    <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  </figure>
);

export const ComponentSource = async ({
  name,
  src,
  base,
  title,
  collapsible = true,
  className,
  language,
}: {
  name?: string;
  src?: string;
  base?: BaseName;
  title?: string;
  collapsible?: boolean;
  className?: string;
  language?: string;
}) => {
  let code: string | null = null;

  if (name) {
    code =
      (await getDemoSource(name, base)) ??
      (await getRegistrySource(name, base));
  }

  if (src) {
    code = await readFileFromRoot(src);
  }

  if (!code) {
    return null;
  }

  code = await formatCode(code);

  const lang = language ?? title?.split(".").pop() ?? "tsx";
  const highlightedCode = await highlightCode(code, lang);

  if (!collapsible) {
    return (
      <div className={cn("relative", className)}>
        <ComponentCode
          code={code}
          highlightedCode={highlightedCode}
          language={lang}
          title={title}
        />
      </div>
    );
  }

  return (
    <CodeCollapsibleWrapper
      className={className}
      navTriggerClassName={cn(!title && "top-3")}
    >
      <ComponentCode
        code={code}
        highlightedCode={highlightedCode}
        language={lang}
        title={title}
      />
    </CodeCollapsibleWrapper>
  );
};
