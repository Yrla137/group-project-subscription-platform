import { format } from "date-fns";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import type { SeminarCalendarEvent } from "../types/CalendarTypes";
import SeminarCard from "./SeminarCard";
import "./Seminars.css";

type SeminarsProps = {
    selectedDate: Date;
};

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
        <div className="seminar-container">
            
            <h2>Seminars</h2>

            <div className="seminar-list">

                {seminars.map((seminar) => (
                    <SeminarCard
                        key={seminar.id}
                        id={seminar.id}
                        title={seminar.title}
                        img={seminar.img}
                        startsAt={seminar.startsAt}
                        description={seminar.description}
                        // Only a tier lock counts here, not a seminar beyond the planning horizon
                        isTierLocked={seminar.lockReason === "tier"}
                        tierTitle={seminar.tierTitle}
                    />
                ))}
            </div>
        </div>
    );
};

export default Seminars;