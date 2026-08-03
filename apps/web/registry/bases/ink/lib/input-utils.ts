export const insertAt = (
  value: string,
  cursorOffset: number,
  input: string
): string => value.slice(0, cursorOffset) + input + value.slice(cursorOffset);

export const deleteBackwardAt = (
  value: string,
  cursorOffset: number
): { cursorOffset: number; value: string } => {
  if (cursorOffset <= 0) {
    return { cursorOffset: 0, value };
  }

  const nextCursorOffset = cursorOffset - 1;
  return {
    cursorOffset: nextCursorOffset,
    value: value.slice(0, nextCursorOffset) + value.slice(nextCursorOffset + 1),
  };
};

export const deleteForwardAt = (
  value: string,
  cursorOffset: number
): string => {
  if (cursorOffset >= value.length) {
    return value;
  }

  return value.slice(0, cursorOffset) + value.slice(cursorOffset + 1);
};

export const filterEmailInput = (value: string, input: string): string => {
  let hasAt = value.includes("@");

  return [...input]
    .filter((character) => {
      if (character !== "@") {
        return true;
      }
      if (hasAt) {
        return false;
      }
      hasAt = true;
      return true;
    })
    .join("");
};
