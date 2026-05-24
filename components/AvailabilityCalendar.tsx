"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import { isSameDay } from "date-fns";
import { ko } from "date-fns/locale";

interface Props {
  availableDates: Date[];
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
}

export default function AvailabilityCalendar({ availableDates, selected, onSelect }: Props) {
  const availableSet = new Set(availableDates.map((d) => d.toISOString().slice(0, 10)));

  return (
    <div>
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        locale={ko}
        disabled={[
          { before: new Date() },
          (day: Date) => !availableSet.has(day.toISOString().slice(0, 10)),
        ]}
        modifiers={{ available: availableDates }}
        modifiersClassNames={{
          available: "!text-rose-600 !font-semibold",
        }}
        className="!font-sans"
      />
      <p className="text-xs text-gray-400 mt-1">
        색이 있는 날짜만 선택 가능해요
      </p>
    </div>
  );
}
