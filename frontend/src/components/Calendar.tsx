import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { sv } from "date-fns/locale";
import "./Calendar.css";

interface CalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    markedDates?: Date[];
}

export default function Calendar({
    selectedDate,
    onSelectDate,
    markedDates = [],
}: CalendarProps) {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // måndag som första dag
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    function hasEntry(date: Date): boolean {
        return markedDates.some((d) => isSameDay(d, date));
    }

    return (
        <div className="week-calendar">
            {days.map((day) => (
                <button
                    key={day.toISOString()}
                    type="button"
                    className={`week-day ${isSameDay(day, selectedDate) ? "week-day--active" : ""}`}
                    onClick={() => onSelectDate(day)}
                >
                    <span className="week-day-label">{format(day, "EEE", { locale: sv })}</span>
                    <span className="week-day-number">{format(day, "d")}</span>
                    {hasEntry(day) && <span className="week-day-dot" aria-hidden="true" />}
                </button>
            ))}
        </div>
    );
}