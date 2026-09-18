import { startOfWeek, endOfWeek, addDays, addWeeks, format, isSameDay, isAfter } from "date-fns";
import { sv } from "date-fns/locale";
import "./CalendarDatepicker.css";

interface CalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    markedDates?: Date[];
    maxDate?: Date | null;
}

export default function CalendarDatepicker({
    selectedDate,
    onSelectDate,
    markedDates = [],
    maxDate = null,
}: CalendarProps) {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // måndag som första dag
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const today = new Date().toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "long",
    });

    function hasEntry(date: Date): boolean {
        return markedDates.some((d) => isSameDay(d, date));
    }

    function isBeyondTierLimit(date: Date): boolean {
        if (!maxDate) return false;
        return isAfter(date, maxDate);
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
                    {format(weekStart, "d MMM", { locale: sv })} - {format(weekEnd, "d MMM", { locale: sv })}

                    <button type="button" className="today-btn" onClick={goToToday}>
                        Idag: { today }
                    </button>
                
                </span>

                <button
                    type="button"
                    className="week-nav-btn"
                    onClick={goToNextWeek}
                    aria-label="Nästa vecka"
                >
                    ›
                </button>
            </div>

            <div className="week-days">
                {days.map((day) => {
                    const disabled = isBeyondTierLimit(day);

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            className={`week-day ${isSameDay(day, selectedDate) ? "week-day--active" : ""} ${disabled ? "week-day--disabled" : ""}`}
                            onClick={() => !disabled && onSelectDate(day)}
                            disabled={disabled}
                            aria-disabled={disabled}
                        >
                            <span className="week-day-label">{format(day, "EEE", { locale: sv })}</span>
                            <span className="week-day-number">{format(day, "d")}</span>
                            {hasEntry(day) ? (
                                <span className="week-day-dot" aria-hidden="true" />
                            ) : (
                                <span className="week-day-nodot" aria-hidden="true" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}