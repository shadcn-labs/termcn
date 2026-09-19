"use client";

import { DownloadIcon, SquareDashedIcon, TypeIcon } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { toast } from "sonner";

import { LogoMark, getLogoMarkSVG, getLogoTypeSVG } from "@/components/logo";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export const BrandContextMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const content = useIntlayer("brand-context-menu");
  const { resolvedTheme } = useTheme();
  const { copyToClipboard } = useCopyToClipboard();

  const color = resolvedTheme === "light" ? "#000" : "#fff";
  const logoMarkSvgString = getLogoMarkSVG(color);
  const logoTypeSvgString = getLogoTypeSVG(color);

  const handleCopyLogomark = useCallback(() => {
    copyToClipboard(logoMarkSvgString);
    toast.success(String(content.logomarkCopiedToast));
  }, [logoMarkSvgString, copyToClipboard, content.logomarkCopiedToast]);

  const handleCopyLogotype = useCallback(() => {
    copyToClipboard(logoTypeSvgString);
    toast.success(String(content.logotypeCopiedToast));
  }, [logoTypeSvgString, copyToClipboard, content.logotypeCopiedToast]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopyLogomark}>
          <LogoMark />
          {content.copyLogomarkAsSvg}
        </ContextMenuItem>

        <ContextMenuItem onClick={handleCopyLogotype}>
          <TypeIcon />
          {content.copyLogotypeAsSvg}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem asChild>
          <a
            href="https://shadcn-labs.com/brand"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SquareDashedIcon />
            {content.brandGuidelines}
          </a>
        </ContextMenuItem>

        <ContextMenuItem asChild>
          <a
            href="https://shadcn-labs.com/shadcn-labs-brand.zip"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon />
            {content.downloadBrandAssets}
          </a>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
