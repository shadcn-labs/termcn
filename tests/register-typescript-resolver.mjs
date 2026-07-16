import { registerHooks } from "node:module";

const rootUrl = new URL("../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const url = new URL(specifier.slice(2), rootUrl).href;
      const candidates = [
        url,
        `${url}.ts`,
        `${url}.tsx`,
        `${url}/index.ts`,
        `${url}/index.tsx`,
      ];

      let lastError;
      for (const candidate of candidates) {
        try {
          return nextResolve(candidate, context);
        } catch (error) {
          lastError = error;
        }
      }
      throw new Error(`Unable to resolve ${specifier}`, { cause: lastError });
    }

    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (
        /^\.{1,2}\//u.test(specifier) &&
        !/\.[cm]?[jt]sx?$/u.test(specifier)
      ) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});
