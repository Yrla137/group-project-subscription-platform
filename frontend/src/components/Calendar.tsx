import { useState } from "react";
import { parseISO, isAfter } from "date-fns";

import { useCalendarEvents } from "../hooks/useCalendarEvents";

import TodaysSeminars from "./TodaysSeminars";
import CalendarDatepicker from "./CalendarDatepicker";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { events, isLoading, error } = useCalendarEvents();

  const maxDate = new Date("2026-09-28");

  const handleSelectDate = (date: Date) => {
    if (maxDate && isAfter(date, maxDate)) {
      setSelectedDate(maxDate);
      return;
    }
    setSelectedDate(date);
  };

  const markedDates = events.map((event) => parseISO(event.date));

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

      <TodaysSeminars date={selectedDate} />

    </div>
  );
};

export default Calendar;