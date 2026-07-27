import { ROUTES } from "@/constants/routes";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
import { termcnAgentSkillDigest } from "@/lib/agent-discovery/termcn-agent-skill";

export const GET = (request: Request) => {
  const origin = requestOrigin(request);
  const base = origin.replace(/\/$/, "");

  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          description:
            "Install and use termcn terminal UI components via the public shadcn registry and documentation.",
          digest: termcnAgentSkillDigest(),
          name: "termcn-registry",
          type: "skill-md",
          url: `${base}${ROUTES.AGENT_SKILLS_TERMCN_SKILL}`,
        },
      ],
    },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
};
