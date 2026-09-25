import { format, parseISO, isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import type { SeminarCalendarEvent } from "../types/CalendarTypes";
import "./Seminars.css";

type SeminarsProps = {
    selectedDate: Date;
};

// Returns "HH:mm" or null if the timestamp is missing or invalid, so a bad value can never crash the page
function formatTime(startsAt: string | undefined): string | null {
    if (!startsAt) return null;
    const date = parseISO(startsAt);
    return isValid(date) ? format(date, "HH:mm", { locale: enUS }) : null;
}

const Seminars = ({ selectedDate }: SeminarsProps) => {
    const isoDate = format(selectedDate, "yyyy-MM-dd");

    // Same endpoint as the calendar, so locking and tier info come from the backend
    const { events, isLoading, error } = useCalendarEvents(isoDate, isoDate);

    // Filter on date too, so the previous day's seminars don't flash while loading
    const seminars = events.filter(
        (event): event is SeminarCalendarEvent => event.type === "seminar" && event.date === isoDate
    );

    if (isLoading && seminars.length === 0) return <p>Loading seminars…</p>;
    if (error) return <p>Something went wrong: {error}</p>;
    if (seminars.length === 0) return null;

    return (
        <div>
            <h3>Seminars</h3>

            <div className="seminar-list">
                {seminars.map((seminar) => {
                    const time = formatTime(seminar.startsAt);

                    return (
                        <div
                            key={seminar.id}
                            className={`seminar-card ${seminar.isLocked ? "seminar-card--locked" : ""}`}
                        >
                            <div className="seminar-card-header">
                                <span className="seminar-title">{seminar.title}</span>

                                {seminar.isLocked && (
                                    <span className="seminar-lock-badge">
                                        <span className="material-symbols-rounded" aria-hidden="true">
                                            lock
                                        </span>
                                        {seminar.tierTitle ?? "Higher tier"}
                                    </span>
                                )}
                            </div>

                            {/* Only sent by the backend when the user has access */}
                            {seminar.description && <p className="seminar-description">{seminar.description}</p>}

                            {time && <span className="seminar-time">{time}</span>}

                            {seminar.isLocked && (
                                <button type="button" className="seminar-upgrade-btn">
                                    Upgrade to {seminar.tierTitle ?? "a higher tier"}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Seminars;