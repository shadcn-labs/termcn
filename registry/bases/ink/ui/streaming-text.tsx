import { useIsScreenReaderEnabled, Text } from "ink";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useMotion } from "@/hooks/use-motion";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { splitGraphemes } from "@/registry/bases/ink/lib/terminal-text";

export interface StreamingTextProps {
  text?: string;
  stream?: AsyncIterable<string>;
  cursor?: boolean;
  animate?: boolean;
  speed?: number;
  onComplete?: (fullText: string) => void;
  cursorColor?: string;
  isActive?: boolean;
  "aria-label"?: string;
}

export const StreamingText = ({
  text: controlledText,
  stream,
  cursor = true,
  animate = false,
  speed = 30,
  onComplete,
  cursorColor,
  isActive = true,
  "aria-label": ariaLabel,
}: StreamingTextProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const { reduced } = useMotion();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const [internalText, setInternalText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const controlledGraphemes = useMemo(
    () => splitGraphemes(controlledText ?? ""),
    [controlledText]
  );
  const motionActive = isActive && !reduced && !isScreenReaderEnabled;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!cursor || !isStreaming || !motionActive) {
      setCursorVisible(true);
      return;
    }
    const id = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(id);
  }, [cursor, isStreaming, motionActive]);

  useEffect(() => {
    if (!stream) {
      return;
    }
    let cancelled = false;
    setInternalText("");
    setIsStreaming(true);

    (async () => {
      let full = "";
      try {
        for await (const chunk of stream) {
          if (cancelled) {
            break;
          }
          full += chunk;
          if (!isScreenReaderEnabled || full.length % 64 < chunk.length) {
            setInternalText(full);
          }
        }
      } catch {
        /* noop */
      }
      if (!cancelled) {
        setInternalText(full);
        setIsStreaming(false);
        onCompleteRef.current?.(full);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isScreenReaderEnabled, stream]);

  useEffect(() => {
    if (!animate || !controlledText || stream || !motionActive) {
      setAnimatedIndex(controlledGraphemes.length);
      return;
    }
    setAnimatedIndex(0);
    setIsStreaming(true);
    let idx = 0;
    const id = setInterval(() => {
      idx += 1;
      setAnimatedIndex(idx);
      if (idx >= controlledGraphemes.length) {
        clearInterval(id);
        setIsStreaming(false);
        onCompleteRef.current?.(controlledText);
      }
    }, speed);
    return () => clearInterval(id);
  }, [
    animate,
    controlledGraphemes.length,
    controlledText,
    motionActive,
    speed,
    stream,
  ]);

  let displayText: string;
  if (stream) {
    displayText = internalText;
  } else if (animate && controlledText && motionActive) {
    displayText = controlledGraphemes.slice(0, animatedIndex).join("");
  } else {
    displayText = controlledText ?? "";
  }

  const showCursor = cursor && isStreaming && cursorVisible;
  const resolvedCursorColor = cursorColor ?? theme.colors.primary;

  return (
    <Text aria-label={ariaLabel ? `${ariaLabel}: ${displayText}` : undefined}>
      {displayText}
      {showCursor && (
        <Text aria-hidden color={resolvedCursorColor}>
          {unicode ? "▌" : "|"}
        </Text>
      )}
    </Text>
  );
};
