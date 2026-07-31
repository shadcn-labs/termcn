export const GITHUB = {
  branch: "main",
  repo: "termcn",
  user: "Aniket-508",
} as const;

const GITHUB_URL = `https://github.com/${GITHUB.user}/${GITHUB.repo}`;

export const LINK = {
  AGENTCN: "https://agentcn.run",
  BLUESKY: "https://bsky.app/profile/shadcnlabs.bsky.social",
  DISCORD: "https://discord.gg/N6G36KhYK4",
  EMAILCN: "https://emailcn.run",
  FRAMECN: "https://framecn.dev",
  GITHUB: GITHUB_URL,
  LICENSE: `${GITHUB_URL}/blob/${GITHUB.branch}/LICENSE`,
  MCPCN: "https://mcpcn.dev",
  OGIMAGECN: "https://ogimagecn.com",
  PORTFOLIO: "https://aniketpawar.com",
  SHADCN_LABS: "https://shadcn-labs.com",
  SHADCN_MCP_DOCS: "https://ui.shadcn.com/docs/mcp",
  SPONSOR: `https://github.com/sponsors/${GITHUB.user}`,
  X: "https://x.com/alaymanguy",
  X_SHADCN_LABS: "https://x.com/shadcnlabs",
} as const;
