import path from "path";

import fs from "fs-extra";
import { z } from "zod";

import { addOptionsSchema } from "@/src/commands/add";
import { TERMCN_URL } from "@/src/registry/constants";
import * as ERRORS from "@/src/utils/errors";
import { CONFIG_FILE, getConfig } from "@/src/utils/get-config";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";

export async function preFlightAdd(options: z.infer<typeof addOptionsSchema>) {
  const errors: Record<string, boolean> = {};

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, "package.json"))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true;
    return {
      errors,
      config: null,
    };
  }

  if (!fs.existsSync(path.resolve(options.cwd, CONFIG_FILE))) {
    errors[ERRORS.MISSING_CONFIG] = true;
    return {
      errors,
      config: null,
    };
  }

  try {
    const config = await getConfig(options.cwd);

    return {
      errors,
      config: config!,
    };
  } catch {
    logger.break();
    logger.error(
      `An invalid ${highlighter.info(CONFIG_FILE)} file was found at ${highlighter.info(
        options.cwd
      )}.\nBefore you can add components, create a valid config by running ${highlighter.info(
        "termcn init"
      )}.`
    );
    logger.error(
      `Learn more at ${highlighter.info(`${TERMCN_URL}/docs/termcn-json`)}.`
    );
    logger.break();
    process.exit(1);
  }
}
