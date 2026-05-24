import { addDays, eachDayOfInterval, parseISO, isWithinInterval } from "date-fns";
import type { Availability, Rental } from "@/types";

export function getBlockedDates(
  availabilities: Availability[],
  approvedRentals: Rental[],
  handoverDays: number
): { availableDates: Date[]; blockedDates: Date[] } {
  if (availabilities.length === 0) return { availableDates: [], blockedDates: [] };

  // All dates within availability ranges
  const allAvailableDates = availabilities.flatMap(({ start_date, end_date }) =>
    eachDayOfInterval({ start: parseISO(start_date), end: parseISO(end_date) })
  );

  // Dates blocked by approved rentals (including handover buffer)
  const blockedSet = new Set<string>();
  for (const rental of approvedRentals) {
    const bufferedStart = addDays(parseISO(rental.start_date), -handoverDays);
    const bufferedEnd = addDays(parseISO(rental.end_date), handoverDays);
    eachDayOfInterval({ start: bufferedStart, end: bufferedEnd }).forEach((d) =>
      blockedSet.add(d.toISOString().slice(0, 10))
    );
  }

  const availableDates = allAvailableDates.filter(
    (d) => !blockedSet.has(d.toISOString().slice(0, 10))
  );
  const blockedDates = allAvailableDates.filter((d) =>
    blockedSet.has(d.toISOString().slice(0, 10))
  );

  return { availableDates, blockedDates };
}

export function isRangeAvailable(
  start: Date,
  end: Date,
  availableDates: Date[]
): boolean {
  const availableSet = new Set(availableDates.map((d) => d.toISOString().slice(0, 10)));
  return eachDayOfInterval({ start, end }).every((d) =>
    availableSet.has(d.toISOString().slice(0, 10))
  );
}
