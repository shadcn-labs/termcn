import { inkRegistryBase } from "@/registry/bases/ink/registry";
import { opentuiRegistryBase } from "@/registry/bases/opentui/registry";

export const BASES = [
  {
    ...inkRegistryBase,
    dependencies: ["ink"],
    description: "React-powered terminal components rendered with Ink.",
    meta: {
      logo: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 894 474'><path d='M0 0h894v474H0z'/><path d='M258 78h81v63h30v63h24v63h27v63h27V78h54v315H393v-63h-24v-63h-30v-63h-27v189h-54z' fill='#03ffda'/><path d='M555 78h54v126h54v-63h27V78h54v63h-27v63h-27v63h27v63h27v63h-54v-63h-27v-63h-54v126h-54z' fill='#ff9208'/><path d='M258 78h81v63h30v126h-30v-63h-27v189h-54z' fill='#a300ff'/><path d='M555 78h54v315h-54z' fill='#8fff0b'/><path d='M150 78h54v315h-54z' fill='#fe000f'/><path d='M555 78h27v315h-27z' fill='#4bfe16'/><path d='M474 78h27v315h-27z' fill='#05ff93'/><path d='M258 78h27v315h-27z' fill='#e900ff'/><path d='M369 204h24v63h27v63h27v63h-54v-63h-24z' fill='#0075ff'/><path d='M312 78h27v63h30v126h-30v-63h-27z' fill='#1900fe'/><path d='M690 267h27v63h27v63h-54zm0-189h54v63h-27v63h-27z' fill='#fe8d03'/><path d='M609 204h54v63h-54z' fill='#fedb08'/><path d='M582 78h27v126h-27z' fill='#4fff02'/><path d='M555 78h27v126h-27z' fill='#24fe18'/><path d='M474 78h27v126h-27z' fill='#07feba'/><path d='M447 78h27v126h-27z' fill='#03ffff'/><path d='M312 78h27v126h-27z' fill='#5d02ff'/><path d='M369 204h24v126h-24z' fill='#0247ff'/><path d='M717 330h27v63h-27z' fill='#ff4802'/><path d='M582 330h27v63h-27z' fill='#61ff00'/><path d='M555 330h27v63h-27z' fill='#00ff0d'/><path d='M474 330h27v63h-27z' fill='#07feba'/><path d='M447 330h27v63h-27z' fill='#1efdff'/><path d='M420 330h27v63h-27z' fill='#00bafe'/><path d='M690 267h27v63h-27z' fill='#ff4a04'/><path d='M393 267h27v63h-27z' fill='#0193fe'/><path d='M609 204h27v63h-27z' fill='#ddfe00'/><path d='M663 141h27v63h-27z' fill='#ffd210'/><path d='M717 78h27v63h-27z' fill='#fe4902'/></svg>",
    },
    title: "Ink",
    type: "registry:style",
  },
  {
    ...opentuiRegistryBase,
    dependencies: ["@opentui/react"],
    description: "React-powered terminal components rendered with OpenTUI.",
    meta: {
      logo: "<svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='2' y='3' width='20' height='18' fill='var(--color-foreground)'></rect><rect x='6' y='8' width='3' height='8' fill='var(--color-background)'></rect></svg>",
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
