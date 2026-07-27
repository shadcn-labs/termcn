import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/logo";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;

export const GET = async (
  _req: Request,
  { params }: RouteContext<"/og/docs/[...slug]">
) => {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) {
    notFound();
  }

  const { title, description } = page.data;

  return new ImageResponse(
    <div tw="flex h-full w-full bg-black text-white">
      <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 left-16 w-[1px]" />
      <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 right-16 w-[1px]" />
      <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] top-16" />
      <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] bottom-16" />
      <div tw="flex absolute flex-row bottom-24 right-24 text-white">
        <LogoMark width={48} height={48} />
      </div>
      <div tw="flex flex-col absolute w-[896px] justify-center inset-32">
        <div
          tw="tracking-tight flex-grow-1 flex flex-col justify-center leading-[1.1]"
          style={{
            fontSize: title && title.length > 20 ? 64 : 80,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            textWrap: "balance",
          }}
        >
          {title}
        </div>
        <div
          tw="text-[40px] leading-[1.5] flex-grow-1 text-stone-400"
          style={{
            fontWeight: 500,
            textWrap: "balance",
          }}
        >
          {description}
        </div>
      </div>
    </div>,
    {
      height: 630,
      width: 1200,
    }
  );
};

export const generateStaticParams = () =>
  source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
