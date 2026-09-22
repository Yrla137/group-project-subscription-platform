import { useState } from "react";
import { parseISO, isAfter } from "date-fns";

import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useTasks } from "../hooks/useTasks";

import Seminars from "./Seminars";
import CalendarDatepicker from "./CalendarDatepicker";
import Tasks from "./Tasks";
import Habits from "./Habits";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { events, isLoading, error } = useCalendarEvents();
  const { tasks } = useTasks();

  const maxDate = new Date("2026-09-28");

  const handleSelectDate = (date: Date) => {
    if (maxDate && isAfter(date, maxDate)) {
      setSelectedDate(maxDate);
      return;
    }
    setSelectedDate(date);
  };

  const taskMarkedDates = tasks
    .filter((task) => task.task_date)
    .map((task) => {
      const dateStr = task.task_date.substring(0, 10);
    return parseISO(dateStr);
});

  const markedDates = [...events.map((event) => parseISO(event.date)), ...taskMarkedDates];

  if (isLoading) return <p>Loading calendar...</p>;
  if (error) return <p>Something went wrong: {error}</p>;

  return (
    <div>
      <CalendarDatepicker
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        markedDates={markedDates}
        maxDate={maxDate}
      />
      <Tasks selectedDate={selectedDate} />

      <Habits selectedDate={selectedDate} />
      <Seminars date={selectedDate} />

    </div>
  );
};

export default Calendar;