export const urlToName = (url: string) => url.replace(/(^\w+:|^)\/\//, "");

export const addQueryParams = (
  urlString: string,
  query: Record<string, string>
): string => {
  try {
    const url = new URL(urlString);

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  } catch {
    return urlString;
  }
};
