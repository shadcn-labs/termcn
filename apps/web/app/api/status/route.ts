export const GET = () =>
  Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
