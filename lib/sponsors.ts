interface Sponsor {
  name: string;
  href: string;
  logo?: string;
}

export const tiers = [
  {
    colors: {
      bg: "linear-gradient(145deg, #d4a84b 0%, #f5d98a 30%, #c9952e 60%, #e8c55a 100%)",
      border: "#c9952e",
      slotBg: "rgba(212, 168, 75, 0.08)",
      slotBorder: "rgba(201, 149, 46, 0.25)",
      text: "#5c3d0e",
    },
    name: "Gold",
    slots: 3,
    sponsors: [] as Sponsor[],
  },
  {
    colors: {
      bg: "linear-gradient(145deg, #a8a8a8 0%, #d4d4d4 30%, #8a8a8a 60%, #c0c0c0 100%)",
      border: "#8a8a8a",
      slotBg: "rgba(168, 168, 168, 0.06)",
      slotBorder: "rgba(138, 138, 138, 0.2)",
      text: "#2a2a2a",
    },
    name: "Silver",
    slots: 3,
    sponsors: [] as Sponsor[],
  },
  {
    colors: {
      bg: "linear-gradient(145deg, #b5745a 0%, #d4956e 30%, #8c5a3e 60%, #c98a68 100%)",
      border: "#8c5a3e",
      slotBg: "rgba(181, 116, 90, 0.06)",
      slotBorder: "rgba(140, 90, 62, 0.2)",
      text: "#3d1e0e",
    },
    name: "Bronze",
    slots: 3,
    sponsors: [] as Sponsor[],
  },
];
