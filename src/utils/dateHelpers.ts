export function formatDateForPeriod(
  date: Date | string,
  period: string
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  switch (period) {
    case "daily":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "weekly":
      return `Week ${getWeekNumber(d)}`;
    case "monthly":
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    case "yearly":
      return d.getFullYear().toString();
    default:
      return d.toLocaleDateString();
  }
}

export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
