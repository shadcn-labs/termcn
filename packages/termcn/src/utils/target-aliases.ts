import { ALIAS_KEYS, type AliasKey } from "@/src/schema";

export type TargetAliasKey = AliasKey;

export function isTargetAliasKey(key: string): key is TargetAliasKey {
  return (ALIAS_KEYS as readonly string[]).includes(key);
}

export function getTargetAliasKey(target?: string): TargetAliasKey | null {
  const match = target?.match(/^@([^/]+)\//);

  return match && isTargetAliasKey(match[1]) ? match[1] : null;
}
