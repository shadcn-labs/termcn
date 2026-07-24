import { notFound } from "next/navigation";

import { markdownResponse } from "@/lib/api";
import { getLLMText, getPageMarkdownUrl, source } from "@/lib/source";

export const revalidate = false;

const docsMarkdown = async (
  { params }: { params: Promise<{ slug?: string[] }> },
  includeBody: boolean
) => {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) {
    notFound();
  }

  return markdownResponse(await getLLMText(page), includeBody);
};

export const GET = (
  _req: Request,
  context: { params: Promise<{ slug?: string[] }> }
) => docsMarkdown(context, true);

export const HEAD = (
  _req: Request,
  context: { params: Promise<{ slug?: string[] }> }
) => docsMarkdown(context, false);

export const generateStaticParams = () =>
  source.getPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
