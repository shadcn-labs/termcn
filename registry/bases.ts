import { InkIcon, OpenTUIIcon } from "@/components/icons";
import { inkRegistryBase } from "@/registry/bases/ink/registry";
import { opentuiRegistryBase } from "@/registry/bases/opentui/registry";

export const BASES = [
  {
    ...inkRegistryBase,
    dependencies: ["ink"],
    description: "React-powered terminal components rendered with Ink.",
    meta: {
      logo: InkIcon,
    },
    title: "Ink",
    type: "registry:style",
  },
  {
    ...opentuiRegistryBase,
    dependencies: ["@opentui/react"],
    description: "React-powered terminal components rendered with OpenTUI.",
    meta: {
      logo: OpenTUIIcon,
    },
    title: "OpenTUI",
    type: "registry:style",
  },
] as const;

export type Base = (typeof BASES)[number];
export type BaseName = Base["name"];

export const BASE_NAMES = BASES.map((base) => base.name) as [
  BaseName,
  ...BaseName[],
];

export const DEFAULT_BASE_NAME = BASES[0].name;

export const getBase = (name: BaseName) =>
  BASES.find((base) => base.name === name);
