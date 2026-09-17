import { useState } from "react";
import { isSameDay, parseISO, isAfter } from "date-fns";

import { useCalendarEvents } from "../hooks/useCalendarEvents";

import Todo from "./Todo";
import CalendarDatepicker from "./CalendarDatepicker";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { events, isLoading, error } = useCalendarEvents();

  const maxDate = new Date("2026-09-24");

  const handleSelectDate = (date: Date) => {
    if (maxDate && isAfter(date, maxDate)) {
      setSelectedDate(maxDate);
      return;
    }
    setSelectedDate(date);
  };

  const eventsForSelectedDate = events.filter((event) =>
    isSameDay(parseISO(event.date), selectedDate)
  );

  const markedDates = events.map((event) => parseISO(event.date));

  if (isLoading) return <p>Laddar kalender...</p>;
  if (error) return <p>Något gick fel: {error}</p>;

  return (
    <div>
      <CalendarDatepicker
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        markedDates={markedDates}
        maxDate={maxDate}
      />

      <Todo events={eventsForSelectedDate} date={selectedDate} />
    </div>
  );
};

export default Calendar;