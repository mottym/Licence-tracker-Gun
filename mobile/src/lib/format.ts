export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "—";
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parts = value.split("-").map((segment) => Number.parseInt(segment, 10));
  if (parts.length !== 3 || parts.some((segment) => Number.isNaN(segment))) {
    return null;
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}
