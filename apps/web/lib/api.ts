export const markdownResponse = (body: string, includeBody: boolean) => {
  const tokens = Math.ceil(body.length / 4);

  return new Response(includeBody ? body : null, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokens),
    },
  });
};
