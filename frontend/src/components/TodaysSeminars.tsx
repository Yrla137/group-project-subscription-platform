import { format, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "./TodaysSeminars.css"

import { useCalendarEvents } from "../hooks/useCalendarEvents";

type TodaysSeminarsProps = {
    date: Date;
}

const TodaysSeminars = ({ date }: TodaysSeminarsProps) => {

    const level = 1;

    const { events, isLoading, error } = useCalendarEvents();

    const seminars = events.filter(
        (event) => event.type === "seminar" && isSameDay(new Date(event.date), date)
    );

    const isOutOfReach = (event: (typeof events)[number]) =>
        event.type === "seminar" && event.tierLevel !== undefined && event.tierLevel > level;

    if (isLoading) {
        return <p>Loading seminars…</p>;
    }

    if (error) {
        return <p>Something went wrong: {error}</p>;
    }

    if (seminars.length === 0) {
        return (
            <>
            </>
        )
    }

    return (
        <div>

            <h3>Seminars</h3>

            <div className="seminar-list">
                {seminars.map((seminar) => {
                    const outOfReach = isOutOfReach(seminar);

                    return (
                        <div
                            key={seminar.id}
                            className={`seminar-card ${outOfReach ? "seminar-card--locked" : ""}`}
                        >
                            <div className="seminar-card-header">
                                <span className="seminar-title">{seminar.title}</span>

                                {outOfReach && (
                                    <span className="seminar-lock-badge">
                                        <span className="material-symbols-rounded" aria-hidden="true">
                                            lock
                                        </span>
                                        Tier {seminar.tierLevel}
                                    </span>
                                )}
                            </div>

                            {seminar.description && (
                                <p className="seminar-description">{seminar.description}</p>
                            )}

                            <span className="seminar-time">
                                {format(new Date(seminar.date), "HH:mm", { locale: enUS })}
                            </span>

                            {outOfReach && (
                                <button type="button" className="seminar-upgrade-btn">
                                    Upgrade subscription
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TodaysSeminars