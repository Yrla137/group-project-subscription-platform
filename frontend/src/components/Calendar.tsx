import { useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useTasks } from "../hooks/useTasks";
import { useUserHabits } from "../hooks/useUserHabits";
import type { SeminarCalendarEvent } from "../types/CalendarTypes";

import Seminars from "./Seminars";
import CalendarDatepicker from "./CalendarDatepicker";
import type { CalendarHorizon, DayEventTypes } from "./CalendarDatepicker";
import Tasks from "./Tasks";
import Habits from "./Habits";
import Spinner from "./Spinner";

import "./Calendar.css";

// Must match weekStartsOn in CalendarDatepicker (1 = Monday)
const WEEK_STARTS_ON = 1;

const toIsoDate = (date: Date) => format(date, "yyyy-MM-dd");

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedIso = toIsoDate(selectedDate);

  // Fetch the whole month around the selected date, padded to full weeks.
  // That always covers the visible week, even when it spans two months,
  // and from/to only change (and trigger a refetch) when the month changes.
  const monthStart = startOfMonth(selectedDate);
  const from = toIsoDate(startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON }));
  const to = toIsoDate(endOfWeek(endOfMonth(monthStart), { weekStartsOn: WEEK_STARTS_ON }));

  // All data for the page is fetched here, so the loading state can be handled in one place
  const calendar = useCalendarEvents(from, to);
  const tasks = useTasks();
  const habits = useUserHabits(selectedDate);


  const isAnyLoading = calendar.isLoading || tasks.isLoading || habits.isTodaysLoading;

  // Only the very first load shows the spinner. Later loads (switching day or month,
  // refetching after a change) keep the current content on screen until new data arrives.
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!isAnyLoading) setHasLoadedOnce(true);
  }, [isAnyLoading]);

  // Which kinds of events each day has, keyed by "yyyy-MM-dd"
  const eventsByDate = useMemo(() => {
    const map: Record<string, DayEventTypes> = {};

    for (const event of calendar.events) {
      if (!event.date) continue; // skip malformed events instead of crashing

      const day = (map[event.date] ??= { task: false, habit: false, seminar: false, seminarLocked: false });

      if (event.type === "task") day.task = true;
      else if (event.type === "habit") day.habit = true;
      else if (event.isLocked) day.seminarLocked = true;
      else day.seminar = true;
    }

    return map;
  }, [calendar.events]);

  // The calendar already fetched every seminar in the month, so no extra request is needed
  const seminarsForSelectedDate = useMemo(
    () =>
      calendar.events.filter(
        (event): event is SeminarCalendarEvent => event.type === "seminar" && event.date === selectedIso
      ),
    [calendar.events, selectedIso]
  );

  const horizon: CalendarHorizon | null = useMemo(
    () => (calendar.meta ? { end: parseISO(calendar.meta.horizonEnd) } : null),
    [calendar.meta]
  );

  // A new task changes both the task list and the dots in the calendar
  function handleTaskCreated() {
    tasks.refetch();
    calendar.refetch();
  }

  if (!hasLoadedOnce) {
    return (
      <Spinner />
    );
  }

  const canSeeOwnContent = calendar.isWithinHorizon(selectedIso);

  return (
    <div>
      <CalendarDatepicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        eventsByDate={eventsByDate}
        horizon={horizon}
      />

      {canSeeOwnContent ? (
        <div className="calendar-content-grid">
          <Tasks
            selectedDate={selectedDate}
            tasks={tasks.tasks}
            error={tasks.error}
            onUpdateTask={tasks.updateTask}
            onTaskCreated={handleTaskCreated}
            horizon={horizon}
          />
          <Habits
            selectedDate={selectedDate}
            habits={habits.todaysHabits}
            error={habits.error}
            onToggleCompletion={habits.toggleCompletion}
          />
        </div>
      ) : (
        <p>Upgrade your subscription to plan tasks and habits for this day.</p>
      )}

      <Seminars seminars={seminarsForSelectedDate} error={calendar.error} />
    </div>
  );
};

export default Calendar;