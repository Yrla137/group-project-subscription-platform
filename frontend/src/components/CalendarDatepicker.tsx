import { useEffect, useState } from "react";
import { startOfWeek, endOfWeek, addDays, addWeeks, format, isSameDay, isAfter } from "date-fns";
import { enUS } from "date-fns/locale";
import "./CalendarDatepicker.css";

export interface CalendarHorizon {
    // Last day the user can see their own tasks and habits
    end: Date;
}

interface CalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    // Dates with events the user has access to
    markedDates?: Date[];
    // Dates that only have locked seminars (teasers)
    lockedDates?: Date[];
    // The range where the user can see their own tasks and habits. null while loading.
    horizon?: CalendarHorizon | null;
}

export default function CalendarDatepicker({
    selectedDate,
    onSelectDate,
    markedDates = [],
    lockedDates = [],
    horizon = null,
}: CalendarProps) {
    const [showUpgradeNotice, setShowUpgradeNotice] = useState(false);

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as first day
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const today = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
    });

    // Hide the notice again as soon as the user picks another date or week
    useEffect(() => {
        setShowUpgradeNotice(false);
    }, [selectedDate]);

    function hasEntry(date: Date): boolean {
        return markedDates.some((d) => isSameDay(d, date));
    }

    function hasLockedEntry(date: Date): boolean {
        return lockedDates.some((d) => isSameDay(d, date));
    }

    function isOutsideHorizon(date: Date): boolean {
        if (!horizon) return false;
        return isAfter(date, horizon.end);
    }

    // True when the visible week already contains the last allowed day
    const isLastAllowedWeek = horizon !== null && !isAfter(horizon.end, weekEnd);

    function goToPreviousWeek() {
        onSelectDate(addWeeks(selectedDate, -1));
    }

    function goToNextWeek() {
        if (isLastAllowedWeek) {
            setShowUpgradeNotice(true);
            return;
        }
        const target = addWeeks(selectedDate, 1);
        onSelectDate(horizon && isAfter(target, horizon.end) ? horizon.end : target);
    }

    function goToToday() {
        onSelectDate(new Date());
    }

    function handleDayClick(day: Date) {
        if (isOutsideHorizon(day)) {
            setShowUpgradeNotice(true);
            return;
        }
        onSelectDate(day);
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

                {/* Not using the disabled attribute, so a click can still show the upgrade notice */}
                <button
                    type="button"
                    className={`week-nav-btn ${isLastAllowedWeek ? "week-nav-btn--disabled" : ""}`}
                    onClick={goToNextWeek}
                    aria-disabled={isLastAllowedWeek}
                    aria-label="Next week"
                >
                    ›
                </button>
            </div>

            <div className="week-days">
                {days.map((day) => {
                    // Locked days can't be selected, but clicking them shows the upgrade notice
                    const locked = isOutsideHorizon(day);
                    const isActive = isSameDay(day, selectedDate);

                    let dotClass = "week-day-nodot";
                    if (hasEntry(day)) dotClass = "week-day-dot";
                    else if (hasLockedEntry(day)) dotClass = "week-day-dot week-day-dot--locked";

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            className={`week-day ${isActive ? "week-day--active" : ""} ${locked ? "week-day--disabled" : ""}`}
                            onClick={() => handleDayClick(day)}
                            aria-disabled={locked}
                        >
                            <span className="week-day-label">{format(day, "EEE", { locale: enUS })}</span>
                            <span className="week-day-number">{format(day, "d")}</span>
                            <span className={dotClass} aria-hidden="true" />
                        </button>
                    );
                })}
            </div>

            {showUpgradeNotice && horizon && (
                <div className="tier-notice" role="status">
                    <span className="material-symbols-rounded" aria-hidden="true">
                        info
                    </span>
                    <span>
                        Your plan lets you plan until {format(horizon.end, "d MMM", { locale: enUS })}. Upgrade your
                        subscription for a longer horizon.
                    </span>
                </div>
            )}
        </div>
    );
}