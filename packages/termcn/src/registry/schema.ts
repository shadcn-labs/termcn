import { z } from "zod";

export const registryConfigItemSchema = z.union([
  // Simple string format: "https://example.com/{name}.json"
  z.string().refine((s) => s.includes("{name}"), {
    message: "Registry URL must include {name} placeholder",
  }),
  // Advanced object format with auth options
  z.object({
    url: z.string().refine((s) => s.includes("{name}"), {
      message: "Registry URL must include {name} placeholder",
    }),
    params: z.record(z.string(), z.string()).optional(),
    headers: z.record(z.string(), z.string()).optional(),
  }),
]);

export const registryConfigSchema = z.record(
  z.string().refine((key) => key.startsWith("@"), {
    message: "Registry names must start with @ (e.g., @v0, @acme)",
  }),
  registryConfigItemSchema
);

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    style: z.string(),
    tsx: z.coerce.boolean().default(true),
    theme: z.string().optional(),
    template: z.string().optional(),
    aliases: z.object({
      components: z.string(),
      utils: z.string(),
      ui: z.string().optional(),
      lib: z.string().optional(),
      hooks: z.string().optional(),
    }),
    registries: registryConfigSchema.optional(),
  })
  .strict();

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
    utils: z.string(),
    components: z.string(),
    lib: z.string(),
    hooks: z.string(),
    ui: z.string(),
  }),
});

export const workspaceConfigSchema = z.record(configSchema);

export const registryItemTypeSchema = z.enum([
  "registry:lib",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:file",
  "registry:item",
  "registry:font",

  // Internal use only.
  "registry:example",
  "registry:internal",
]);

export const registryItemFileSchema = z.discriminatedUnion("type", [
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: z.literal("registry:file"),
    target: z.string(),
  }),
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: registryItemTypeSchema.exclude(["registry:file"]),
    target: z.string().optional(),
  }),
]);

export const registryItemEnvVarsSchema = z.record(z.string(), z.string());

// Font metadata schema for registry:font items.
export const registryItemFontSchema = z.object({
  family: z.string(),
  import: z.string().optional(),
  dependency: z.string().optional(),
});

// Common fields shared by all registry items.
export const registryItemCommonSchema = z.object({
  $schema: z.string().optional(),
  extends: z.string().optional(),
  name: z.string(),
  title: z.string().optional(),
  author: z.string().min(2).optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  envVars: registryItemEnvVarsSchema.optional(),
  meta: z.record(z.string(), z.any()).optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export const registryItemSchema = z.discriminatedUnion("type", [
  registryItemCommonSchema.extend({
    type: z.literal("registry:font"),
    font: registryItemFontSchema,
  }),
  registryItemCommonSchema.extend({
    type: registryItemTypeSchema.exclude(["registry:font"]),
  }),
]);

export type RegistryItem = z.infer<typeof registryItemSchema>;

// Helper type for registry:font items specifically.
export type RegistryFontItem = Extract<RegistryItem, { type: "registry:font" }>;

const registryBaseSchema = z
  .object({
    $schema: z.string().optional(),
    name: z.string().optional(),
    homepage: z.string().optional(),
    include: z.array(z.string()).optional(),
    items: z.array(registryItemSchema).optional(),
  })
  .refine(
    (registry) =>
      registry.items !== undefined || registry.include !== undefined,
    {
      message: "Registry must define at least one of `items` or `include`.",
      path: ["items"],
    }
  );

export const registryChunkSchema = registryBaseSchema.transform((registry) => ({
  ...registry,
  items: registry.items ?? [],
}));

export const registrySchema = registryChunkSchema.pipe(
  z.object({
    $schema: z.string().optional(),
    name: z.string(),
    homepage: z.string(),
    include: z.array(z.string()).optional(),
    items: z.array(registryItemSchema),
  })
);

export type Registry = z.infer<typeof registrySchema>;

export const registryIndexSchema = z.array(registryItemSchema);

export const registryResolvedItemsTreeSchema = registryItemCommonSchema
  .pick({
    dependencies: true,
    devDependencies: true,
    files: true,
    envVars: true,
    docs: true,
  })
  .extend({
    fonts: z
      .array(
        registryItemCommonSchema.extend({
          type: z.literal("registry:font"),
          font: registryItemFontSchema,
        })
      )
      .optional(),
  });

export const searchResultItemSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  registry: z.string(),
  addCommandArgument: z.string(),
});

export const searchResultErrorSchema = z.object({
  registry: z.string(),
  message: z.string(),
});

export const searchResultsSchema = z.object({
  pagination: z.object({
    total: z.number(),
    offset: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
  }),
  items: z.array(searchResultItemSchema),
  errors: z.array(searchResultErrorSchema).optional(),
});

export const registriesSchema = z.array(
  z.object({
    name: z.string(),
    homepage: z.string().optional(),
    url: z.string(),
    description: z.string().optional(),
  })
);
