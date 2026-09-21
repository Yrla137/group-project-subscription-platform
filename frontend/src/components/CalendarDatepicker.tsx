import { startOfWeek, endOfWeek, addDays, addWeeks, format, isSameDay, isAfter } from "date-fns";
import { enUS } from "date-fns/locale";
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
    // TODO: replace with user.tier_level once auth is in place
    const level = 1;

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as first day
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const today = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
    });

    const showTierNotice = level < 3 && maxDate !== null;

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
                    aria-label="Previous week"
                >
                    ‹
                </button>

                <span className="week-range-label">
                    {format(weekStart, "d MMM", { locale: enUS })} - {format(weekEnd, "d MMM", { locale: enUS })}

                    <button type="button" className="today-btn" onClick={goToToday}>
                        Today: {today}
                    </button>

                </span>

                <button
                    type="button"
                    className="week-nav-btn"
                    onClick={goToNextWeek}
                    aria-label="Next week"
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
                            <span className="week-day-label">{format(day, "EEE", { locale: enUS })}</span>
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

            {showTierNotice && (
                <div className="tier-notice">
                    <span className="material-symbols-rounded" aria-hidden="true">
                        info
                    </span>
                    <span>
                        Locked after {format(maxDate as Date, "d MMM", { locale: enUS })}. Upgrade your subscription for a longer horizon.
                    </span>
                </div>
            )}
        </div>
    );
}