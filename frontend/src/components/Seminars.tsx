import type { SeminarCalendarEvent } from "../types/CalendarTypes";
import SeminarCard from "./SeminarCard";
import "./Seminars.css"

type SeminarsProps = {
    // Already filtered to the selected day by Calendar
    seminars: SeminarCalendarEvent[];
    error: string | null;
};

const Seminars = ({ seminars, error }: SeminarsProps) => {
    if (error) {
        return (
            <div>
                <h2>Seminars</h2>
                <p className="status-text status-text--error">Couldn't load seminars. Try reloading the page.</p>
            </div>
        );
    }

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