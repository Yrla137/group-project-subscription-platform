import { Link } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import { Lock } from "lucide-react";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import type { SeminarCalendarEvent } from "../types/CalendarTypes";
import "./Seminars.css";

type SeminarsProps = {
    selectedDate: Date;
};

const FALLBACK_IMG = "/seminar_dummy.jpg";

// e.g. "Sun 27 Sep 2026, 19:00", or null if the timestamp is missing or invalid
function formatDateTime(startsAt: string | undefined): string | null {
    if (!startsAt) return null;
    const date = parseISO(startsAt);
    return isValid(date) ? format(date, "EEE d MMM yyyy, HH:mm", { locale: enUS }) : null;
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

    console.log(seminars);

    return (
        <div>
            <h2>Seminars</h2>

            <div className="seminar-list">
                {seminars.map((seminar) => {

                    const dateTime = formatDateTime(seminar.startsAt);
                    const isTierLocked = seminar.lockReason === "tier";

                    return (
                        <div
                            key={seminar.id}
                            className={`seminar-card ${seminar.isLocked ? "seminar-card--locked" : ""}`}
                        >
                            <div className="seminar-card-img">
                                <Link
                                    to={isTierLocked ? "/tiers" : `/seminars/${seminar.id}`}
                                    aria-label={
                                        isTierLocked
                                            ? `${seminar.title}, requires ${seminar.tierTitle ?? "a higher tier"}. See plans`
                                            : `Open ${seminar.title}`
                                    }
                                >
                                    <img
                                        src={seminar.img || FALLBACK_IMG}
                                        alt=""
                                        loading="lazy"
                                        onError={(e) => {
                                            // Swap to the fallback if the image URL is broken, but only once to avoid a loop
                                            if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) {
                                                e.currentTarget.src = FALLBACK_IMG;
                                            }
                                        }}
                                    />
                                    {isTierLocked && (
                                        <span className="seminar-lock-badge-blur">
                                            <span className="seminar-lock-badge"><Lock size={20} strokeWidth={3} aria-hidden="true" /></span>
                                        </span>
                                    )}
                                </Link>
                            </div>
                            <div className="seminar-card-info">

                                <h3>{seminar.title}</h3>

                                {dateTime && <span className="seminar-time">{dateTime}</span>}

                                {seminar.description && <p className="seminar-description">{seminar.description}</p>}

                            </div>
                            <div className="seminar-card-btn">
                                <Link
                                    to={isTierLocked ? "/tiers" : `/seminars/${seminar.id}`}
                                    className="primary-btn"
                                >
                                    {isTierLocked ? `Upgrade to ${seminar.tierTitle ?? "a higher tier"}` : "Read more"}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Seminars;