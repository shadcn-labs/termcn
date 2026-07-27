"use client";

import { DownloadIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { toast } from "sonner";

import { LogoMark, getLogoMarkSVG } from "@/components/logo";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export const BrandContextMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const { copyToClipboard } = useCopyToClipboard();

  const logoMarkSvgString = getLogoMarkSVG(
    resolvedTheme === "light" ? "#000" : "#fff"
  );

  const handleCopy = useCallback(() => {
    copyToClipboard(logoMarkSvgString);
    toast.success("Icon as SVG copied");
  }, [logoMarkSvgString, copyToClipboard]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([logoMarkSvgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "termcn-icon.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Icon as SVG downloaded");
  }, [logoMarkSvgString]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>
          <LogoMark />
          Copy as SVG
        </ContextMenuItem>

        <ContextMenuItem onClick={handleDownload}>
          <DownloadIcon /> Download as SVG
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
