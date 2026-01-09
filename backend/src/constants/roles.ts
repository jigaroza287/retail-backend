export const ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
