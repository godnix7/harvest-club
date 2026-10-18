// Client-safe constants (no database imports).
export const EVENT_CATEGORIES: Record<string, string> = {
  HACKATHON: "Hackathon",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  INDUSTRIAL_VISIT: "Industrial Visit",
  OTHER: "Other",
};

export const EVENT_STATUSES: Record<string, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const TEAM_CATEGORIES: Record<string, string> = {
  FACULTY: "Faculty Coordinators",
  EXECUTIVE: "Leadership (President, Vice President, Secretary…)",
  CORE: "Team member (core / wing teams)",
  PREVIOUS: "Previous Teams",
};

export const SPONSOR_TIERS = ["TITLE", "PLATINUM", "GOLD", "SILVER", "PARTNER"];
