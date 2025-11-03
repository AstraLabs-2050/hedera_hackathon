import { subDays, subMonths, subYears, isAfter, parseISO } from "date-fns";
import { Stat } from "@/types/stat";

export function filterStatsByRange(
  allStats: Stat[],
  filter: string,
  customDate: string | null
): Stat[] {
  const now = new Date();
  let fromDate: Date;

  if (filter === "custom" && customDate) {
    fromDate = parseISO(customDate);
  } else {
    switch (filter) {
      case "24h":
        fromDate = subDays(now, 1);
        break;
      case "7d":
        fromDate = subDays(now, 7);
        break;
      case "1mo":
        fromDate = subMonths(now, 1);
        break;
      case "1y":
        fromDate = subYears(now, 1);
        break;
      default:
        fromDate = subDays(now, 7); // default fallback
    }
  }

  // Now filter your data
  return allStats.filter((stat) => {
    const statDate = parseISO(stat.date);
    return isAfter(statDate, fromDate);
  });
}
