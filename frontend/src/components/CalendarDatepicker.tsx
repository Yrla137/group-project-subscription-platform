import { startOfWeek, endOfWeek, addDays, addWeeks, format, isSameDay } from "date-fns";
import { sv } from "date-fns/locale";
import "./CalendarDatepicker.css";

interface CalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    markedDates?: Date[];
}

export default function CalendarDatepicker({
    selectedDate,
    onSelectDate,
    markedDates = [],
}: CalendarProps) {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // måndag som första dag
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    function hasEntry(date: Date): boolean {
        return markedDates.some((d) => isSameDay(d, date));
    }

    function goToPreviousWeek() {
        onSelectDate(addWeeks(selectedDate, -1));
    }

    function goToNextWeek() {
        onSelectDate(addWeeks(selectedDate, 1));
    }

    function goToToday() {
        onSelectDate(new Date());
    }

    return (
        <div className="week-calendar">
            <div className="week-calendar-header">
                <button
                    type="button"
                    className="week-nav-btn"
                    onClick={goToPreviousWeek}
                    aria-label="Föregående vecka"
                >
                    ‹
                </button>

                <span className="week-range-label">
                    {format(weekStart, "d MMM", { locale: sv })} – {format(weekEnd, "d MMM", { locale: sv })}
                </span>

                <button
                    type="button"
                    className="week-nav-btn"
                    onClick={goToNextWeek}
                    aria-label="Nästa vecka"
                >
                    ›
                </button>

                <button type="button" className="today-btn" onClick={goToToday}>
                    Idag
                </button>
            </div>

            <div className="week-days">
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
        </div>
    );
}