import { useState } from "react";
import { isSameDay, parseISO } from "date-fns";

import { useCalendarEvents } from "../hooks/useCalendarEvents";

import Todo from "./Todo";
import CalendarDatepicker from "./CalendarDatepicker";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { events, isLoading, error } = useCalendarEvents();

  const eventsForSelectedDate = events.filter((event) =>
    isSameDay(parseISO(event.date), selectedDate)
  );

  const markedDates = events.map((event) => parseISO(event.date));

  if (isLoading) return <p>Laddar kalender...</p>;
  if (error) return <p>Något gick fel: {error}</p>;

  console.log(events);

  return (
    <div>
      <CalendarDatepicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDates={markedDates}
      />

      <Todo events={eventsForSelectedDate} date={selectedDate} />
    </div>
  );
};

export default Calendar;