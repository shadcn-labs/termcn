export const PERSONAL_SEAT_LIMIT = 1;
export const TEAM_SEAT_LIMIT = 5;

export const seatLimitForTier = (tier: "personal" | "team") =>
  tier === "team" ? TEAM_SEAT_LIMIT : PERSONAL_SEAT_LIMIT;
