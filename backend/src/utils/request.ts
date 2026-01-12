export function getOptionalStringQuery(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  throw new Error("Invalid query parameter");
}
