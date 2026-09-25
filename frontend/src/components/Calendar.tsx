import { useMemo, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

import { useCalendarEvents } from "../hooks/useCalendarEvents";

import Seminars from "./Seminars";
import CalendarDatepicker from "./CalendarDatepicker";
import type { CalendarHorizon } from "./CalendarDatepicker";
import Tasks from "./Tasks";
import Habits from "./Habits";

// Must match weekStartsOn in CalendarDatepicker (1 = Monday)
const WEEK_STARTS_ON = 1;

const toIsoDate = (date: Date) => format(date, "yyyy-MM-dd");

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch the whole month around the selected date, padded to full weeks.
  // That always covers the visible week, even when it spans two months,
  // and from/to only change (and trigger a refetch) when the month changes.
  const monthStart = startOfMonth(selectedDate);
  const from = toIsoDate(startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON }));
  const to = toIsoDate(endOfWeek(endOfMonth(monthStart), { weekStartsOn: WEEK_STARTS_ON }));

  const { events, meta, isLoading, error, isWithinHorizon } = useCalendarEvents(from, to);

  // Split dates into ones with accessible events and ones with only locked seminars
  const { markedDates, lockedDates } = useMemo(() => {
    const open = new Set<string>();
    const locked = new Set<string>();

    for (const event of events) {
      if (event.type === "seminar" && event.isLocked) locked.add(event.date);
      else open.add(event.date);
    }

    return {
      markedDates: [...open].map((date) => parseISO(date)),
      lockedDates: [...locked].map((date) => parseISO(date)),
    };
  }, [events]);

  const horizon: CalendarHorizon | null = useMemo(
    () => (meta ? { end: parseISO(meta.horizonEnd) } : null),
    [meta]
  );

  const canSeeOwnContent = isWithinHorizon(toIsoDate(selectedDate));

  return (
    <div>
      <CalendarDatepicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDates={markedDates}
        lockedDates={lockedDates}
        horizon={horizon}
      />

      {isLoading && <p>Loading calendar...</p>}
      {error && <p>Something went wrong: {error}</p>}

      {canSeeOwnContent ? (
        <>
          <Tasks selectedDate={selectedDate} />
          <Habits selectedDate={selectedDate} />
        </>
      ) : (
        <p>Upgrade your subscription to plan tasks and habits for this day.</p>
      )}

      {/* Always shown, so locked seminars work as a teaser beyond the horizon */}
      <Seminars date={selectedDate} />
    </div>
  );
};

export default Calendar;