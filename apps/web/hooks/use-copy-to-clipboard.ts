"use client";

import { useState } from "react";

const legacyCopyToClipboard = (value: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";

  document.body.append(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, value.length);

  let hasCopied = false;
  try {
    hasCopied = document.execCommand("copy");
  } catch {
    hasCopied = false;
  }

  textArea.remove();
  return hasCopied;
};

export const useCopyToClipboard = ({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number;
  onCopy?: () => void;
} = {}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (value: string) => {
    if (typeof window === "undefined") {
      return false;
    }

    if (!value) {
      return false;
    }

    let hasCopied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        hasCopied = true;
      } catch {
        hasCopied = legacyCopyToClipboard(value);
      }
    } else {
      hasCopied = legacyCopyToClipboard(value);
    }

    if (!hasCopied) {
      return false;
    }

    setIsCopied(true);

    if (onCopy) {
      onCopy();
    }

    if (timeout !== 0) {
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    }

    return true;
  };

  return { copyToClipboard, isCopied };
};
