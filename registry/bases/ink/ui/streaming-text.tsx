import { Text } from "ink";
import React, { useState, useEffect, useRef } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface StreamingTextProps {
  text?: string;
  stream?: AsyncIterable<string>;
  cursor?: boolean;
  animate?: boolean;
  speed?: number;
  onComplete?: (fullText: string) => void;
  cursorColor?: string;
}

export const StreamingText = ({
  text: controlledText,
  stream,
  cursor = true,
  animate = false,
  speed = 30,
  onComplete,
  cursorColor,
}: StreamingTextProps) => {
  const theme = useTheme();
  const [internalText, setInternalText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!cursor) {
      return;
    }
    const id = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(id);
  }, [cursor]);

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
          setInternalText(full);
        }
      } catch {
        /* noop */
      }
      if (!cancelled) {
        setIsStreaming(false);
        onCompleteRef.current?.(full);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stream]);

  useEffect(() => {
    if (!animate || !controlledText || stream) {
      return;
    }
    setAnimatedIndex(0);
    setIsStreaming(true);
    let idx = 0;
    const id = setInterval(() => {
      idx += 1;
      setAnimatedIndex(idx);
      if (idx >= controlledText.length) {
        clearInterval(id);
        setIsStreaming(false);
        onCompleteRef.current?.(controlledText);
      }
    }, speed);
    return () => clearInterval(id);
  }, [controlledText, animate, speed, stream]);

  let displayText: string;
  if (stream) {
    displayText = internalText;
  } else if (animate && controlledText) {
    displayText = controlledText.slice(0, animatedIndex);
  } else {
    displayText = controlledText ?? "";
  }

  const showCursor = cursor && isStreaming && cursorVisible;
  const resolvedCursorColor = cursorColor ?? theme.colors.primary;

  return (
    <Text>
      {displayText}
      {showCursor && <Text color={resolvedCursorColor}>▌</Text>}
    </Text>
  );
};
