import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { startOfWeek, endOfWeek, addDays, addWeeks, format, isSameDay, isAfter } from "date-fns";
import { enUS } from "date-fns/locale";
import { Info } from "lucide-react";
import "./CalendarDatepicker.css";

export interface CalendarHorizon {
    // Last day the user can see their own tasks and habits
    end: Date;
}

// Which kinds of events a day has; one dot is drawn per kind
export interface DayEventTypes {
    task: boolean;
    habit: boolean;
    seminar: boolean;
}

interface CalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    // Event types per day, keyed by "yyyy-MM-dd"
    eventsByDate?: Record<string, DayEventTypes>;
    // The range where the user can see their own tasks and habits. null while loading.
    horizon?: CalendarHorizon | null;
}

// Screen reader text for a day, e.g. "Monday 28 September: tasks, habits"
function describeDay(day: Date, types: DayEventTypes | undefined, locked: boolean): string {
    const parts: string[] = [];
    if (types?.task) parts.push("tasks");
    if (types?.habit) parts.push("habits");
    if (types?.seminar) parts.push("seminar");

    let label = format(day, "EEEE d MMMM", { locale: enUS });
    if (parts.length > 0) label += `: ${parts.join(", ")}`;
    if (locked) label += ", locked";
    return label;
}

export default function CalendarDatepicker({
    selectedDate,
    onSelectDate,
    eventsByDate = {},
    horizon = null,
}: CalendarProps) {
    const [showUpgradeNotice, setShowUpgradeNotice] = useState(false);

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as first day
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    // "Oct", or "Sep/Oct" when the week spans two months
    const startMonth = format(weekStart, "MMM", { locale: enUS });
    const endMonth = format(weekEnd, "MMM", { locale: enUS });
    const monthLabel = startMonth === endMonth ? startMonth : `${startMonth}/${endMonth}`;

    // Full month names for screen readers, e.g. "September to October"
    const monthLabelLong =
        startMonth === endMonth
            ? format(weekStart, "MMMM", { locale: enUS })
            : `${format(weekStart, "MMMM", { locale: enUS })} to ${format(weekEnd, "MMMM", { locale: enUS })}`;
            
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Hide the notice again as soon as the user picks another date or week
    useEffect(() => {
        setShowUpgradeNotice(false);
    }, [selectedDate]);

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
                
                <span className="week-range-label">
                    <span aria-label={monthLabelLong}>{monthLabel}</span>

                    <button type="button" className="today-btn" onClick={goToToday}>
                        Today
                    </button>
                </span>

            </div>

            <div className="week-days">

                <button
                    type="button"
                    className="week-nav-btn"
                    onClick={goToPreviousWeek}
                    aria-label="Previous week"
                >
                    ‹
                </button>
                {days.map((day) => {
                    // Locked days can't be selected, but clicking them shows the upgrade notice
                    const locked = isOutsideHorizon(day);
                    const isActive = isSameDay(day, selectedDate);
                    const types = eventsByDate[format(day, "yyyy-MM-dd")];

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            className={`week-day ${isActive ? "week-day--active" : ""} ${locked ? "week-day--disabled" : ""}`}
                            onClick={() => handleDayClick(day)}
                            aria-disabled={locked}
                            aria-pressed={isActive}
                            aria-label={describeDay(day, types, locked)}
                        >
                            <span className="week-day-label">{format(day, "EEE", { locale: enUS })}</span>
                            <span className="week-day-number">{format(day, "d")}</span>

                            {/* One dot per kind of event; the row keeps its height when empty */}
                            <span className="week-day-dots" aria-hidden="true">
                                {types?.task && <span className="week-day-dot week-day-dot--task" />}
                                {types?.habit && <span className="week-day-dot week-day-dot--habit" />}
                                {types?.seminar && <span className="week-day-dot week-day-dot--seminar" />}
                            </span>
                        </button>
                    );
                })}
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

            {showUpgradeNotice && horizon && (
                <div className="tier-notice" role="status">
                    <Info size="16" />
                    <span>
                        Your current membership lets you plan until {format(horizon.end, "d MMM", { locale: enUS })}. <Link to="/tier">Upgrade</Link> for a longer horizon.
                    </span>
                </div>
            )}
        </div>
    );
}