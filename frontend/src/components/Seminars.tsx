import { format, isSameDay, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import "./Seminars.css"

import { useSeminars } from "../hooks/useSeminars";

type SeminarsProps = {
    date: Date;
}

const Seminars = ({ date }: SeminarsProps) => {

    const level = 1;

    const { seminars, isLoading, error } = useSeminars();

    const Seminars = seminars.filter((seminar) =>
        isSameDay(parseISO(seminar.seminar_date), date)
    );

    const isOutOfReach = (seminar: (typeof seminars)[number]) =>
        seminar.tier_id !== undefined && seminar.tier_id > level;

    if (isLoading) {
        return <p>Loading seminars…</p>;
    }

    if (error) {
        return <p>Something went wrong: {error}</p>;
    }

    if (Seminars.length === 0) {
        return (
            <>
            </>
        )
    }

    return (
        <div>

            <h3>Seminars</h3>

            <div className="seminar-list">
                {Seminars.map((seminar) => {
                    const outOfReach = isOutOfReach(seminar);

                    return (
                        <div
                            key={seminar.id}
                            className={`seminar-card ${outOfReach ? "seminar-card--locked" : ""}`}
                        >
                            <div className="seminar-card-header">
                                <span className="seminar-title">{seminar.seminar_title}</span>

                                {outOfReach && (
                                    <span className="seminar-lock-badge">
                                        <span className="material-symbols-rounded" aria-hidden="true">
                                            lock
                                        </span>
                                        Tier {seminar.tier_id}
                                    </span>
                                )}
                            </div>

                            {seminar.seminar_description && (
                                <p className="seminar-description">{seminar.seminar_description}</p>
                            )}

                            <span className="seminar-time">
                                {format(parseISO(seminar.seminar_date), "HH:mm", { locale: enUS })}
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

export default Seminars