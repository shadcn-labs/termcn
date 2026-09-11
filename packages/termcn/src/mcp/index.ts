import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dedent from "dedent";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { getRegistryItems, searchRegistries } from "@/src/registry";
import { RegistryError } from "@/src/registry/errors";
import {
  resolveSearchRegistries,
  SEARCHABLE_TYPES,
} from "@/src/registry/search";

import {
  findUnknownTypesMessage,
  formatRegistryItems,
  formatSearchResultsWithPagination,
  formatSkippedRegistries,
  getMcpConfig,
  npxTermcn,
} from "./utils";

export const server = new Server(
  {
    name: "termcn",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_items_in_registries",
        description:
          "List items from registries. Omit `registries` to also report which registries the project has configured. Requires a termcn.json created by `termcn init`.",
        inputSchema: zodToJsonSchema(
          z.object({
            registries: z
              .array(z.string())
              .optional()
              .describe(
                "Array of registry names to list (e.g., ['@termcn', '@acme']). Omit to list the registries configured in termcn.json and their items."
              ),
            types: z
              .array(z.string())
              .optional()
              .describe(
                `Filter by item type. One of: ${SEARCHABLE_TYPES.join(", ")}.`
              ),
            limit: z
              .number()
              .optional()
              .describe(
                "Maximum number of items to return (defaults to 100; use 0 for no limit)"
              ),
            offset: z
              .number()
              .optional()
              .describe("Number of items to skip for pagination"),
          })
        ),
      },
      {
        name: "search_items_in_registries",
        description:
          "Search for components in registries using fuzzy matching (requires termcn.json). After finding an item, use view_items_in_registries to read its files.",
        inputSchema: zodToJsonSchema(
          z.object({
            registries: z
              .array(z.string())
              .optional()
              .describe(
                "Array of registry names to search (e.g., ['@termcn', '@acme']). Omit to search every registry configured in termcn.json."
              ),
            query: z
              .string()
              .describe(
                "Search query string for fuzzy matching against item names and descriptions"
              ),
            types: z
              .array(z.string())
              .optional()
              .describe(
                `Filter by item type. One of: ${SEARCHABLE_TYPES.join(", ")}.`
              ),
            limit: z
              .number()
              .optional()
              .describe(
                "Maximum number of items to return (defaults to 100; use 0 for no limit)"
              ),
            offset: z
              .number()
              .optional()
              .describe("Number of items to skip for pagination"),
          })
        ),
      },
      {
        name: "view_items_in_registries",
        description:
          "View detailed information about specific registry items including the name, description, type and files content.",
        inputSchema: zodToJsonSchema(
          z.object({
            items: z
              .array(z.string())
              .describe(
                "Array of item names with registry prefix (e.g., ['@termcn/button', '@termcn/card'])"
              ),
          })
        ),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const toolArguments = request.params.arguments ?? {};

    switch (request.params.name) {
      case "search_items_in_registries": {
        const inputSchema = z.object({
          registries: z.array(z.string()).optional(),
          query: z.string(),
          types: z.array(z.string()).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        });

        const args = inputSchema.parse(toolArguments);

        const unknownTypesMessage = findUnknownTypesMessage(args.types);
        if (unknownTypesMessage) {
          return {
            content: [{ type: "text", text: unknownTypesMessage }],
            isError: true,
          };
        }

        const config = await getMcpConfig(process.cwd());

        // When registries are omitted, search every configured registry and
        // tolerate individual failures.
        const searchAll = !args.registries?.length;
        const registries = resolveSearchRegistries(
          args.registries ?? [],
          config
        );

        if (registries.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No registries are configured. Run \`${await npxTermcn(
                  "init"
                )}\` to create a termcn.json, or pass registries explicitly.`,
              },
            ],
          };
        }

        const results = await searchRegistries(registries, {
          query: args.query,
          types: args.types,
          limit: args.limit ?? 100,
          offset: args.offset,
          config,
          useCache: false,
          continueOnError: searchAll,
        });

        const skippedNote = formatSkippedRegistries(results);

        if (results.items.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: dedent`No items found matching "${
                  args.query
                }" in registries ${registries.join(
                  ", "
                )}, Try searching with a different query or registry.${skippedNote}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text:
                (await formatSearchResultsWithPagination(results, {
                  query: args.query,
                  registries,
                })) + skippedNote,
            },
          ],
        };
      }

      case "list_items_in_registries": {
        const inputSchema = z.object({
          registries: z.array(z.string()).optional(),
          types: z.array(z.string()).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        });

        const args = inputSchema.parse(toolArguments);

        const unknownTypesMessage = findUnknownTypesMessage(args.types);
        if (unknownTypesMessage) {
          return {
            content: [{ type: "text", text: unknownTypesMessage }],
            isError: true,
          };
        }

        const config = await getMcpConfig(process.cwd());

        const listAll = !args.registries?.length;
        const registries = resolveSearchRegistries(
          args.registries ?? [],
          config
        );

        if (registries.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No registries are configured. Run \`${await npxTermcn(
                  "init"
                )}\` to create a termcn.json, or pass registries explicitly.`,
              },
            ],
          };
        }

        // Without an explicit selection, report what the project has
        // configured alongside the items.
        const configuredNote = listAll
          ? `Registries configured in this project:\n${registries
              .map((registry) => `- ${registry}`)
              .join("\n")}\n\n`
          : "";

        const results = await searchRegistries(registries, {
          types: args.types,
          limit: args.limit ?? 100,
          offset: args.offset,
          config,
          useCache: false,
          continueOnError: listAll,
        });

        const skippedNote = formatSkippedRegistries(results);

        if (results.items.length === 0) {
          return {
            content: [
              {
                type: "text",
                text:
                  configuredNote +
                  `No items found in registries ${registries.join(
                    ", "
                  )}.${skippedNote}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text:
                configuredNote +
                (await formatSearchResultsWithPagination(results, {
                  registries,
                })) +
                skippedNote,
            },
          ],
        };
      }

      case "view_items_in_registries": {
        const inputSchema = z.object({
          items: z.array(z.string()),
        });

        const args = inputSchema.parse(toolArguments);
        const registryItems = await getRegistryItems(args.items, {
          config: await getMcpConfig(process.cwd()),
          useCache: false,
        });

        if (registryItems?.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: dedent`No items found for: ${args.items.join(", ")}

                Make sure the item names are correct and include the registry prefix (e.g., @termcn/button).`,
              },
            ],
          };
        }

        const formattedItems = formatRegistryItems(registryItems);

        return {
          content: [
            {
              type: "text",
              text: dedent`Item Details:

              ${formattedItems.join("\n\n---\n\n")}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Tool ${request.params.name} not found`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: dedent`Invalid input parameters:
              ${error.errors
                .map((e) => `- ${e.path.join(".")}: ${e.message}`)
                .join("\n")}
              `,
          },
        ],
        isError: true,
      };
    }

    if (error instanceof RegistryError) {
      let errorMessage = error.message;

      if (error.suggestion) {
        errorMessage += `\n\n💡 ${error.suggestion}`;
      }

      if (error.context) {
        errorMessage += `\n\nContext: ${JSON.stringify(error.context, null, 2)}`;
      }

      return {
        content: [
          {
            type: "text",
            text: dedent`Error (${error.code}): ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: dedent`Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});
