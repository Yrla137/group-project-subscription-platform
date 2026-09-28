import { Link, useParams } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { useSeminar } from "../hooks/useSeminar";
import "./SeminarDetailPage.css";

// e.g. "Sunday 27 September 2026" and "19:00", or null if the date is invalid
function formatDateParts(seminarDate: string): { day: string; time: string } | null {
    const date = parseISO(seminarDate);
    if (!isValid(date)) return null;
    return {
        day: format(date, "EEEE d MMMM yyyy", { locale: enUS }),
        time: format(date, "HH:mm", { locale: enUS }),
    };
}

const SeminarDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { seminar, status, requiredTier, error } = useSeminar(Number(id));

    const backLink = (
        <Link to="/seminars" className="seminar-detail-back">
            <span className="material-symbols-rounded" aria-hidden="true">
                arrow_back
            </span>
            All seminars
        </Link>
    );

    if (status === "loading") {
        return (
            <div className="seminar-detail">
                {backLink}
                <p className="status-text">Loading seminar…</p>
            </div>
        );
    }

    if (status === "locked") {
        return (
            <div className="seminar-detail">
                {backLink}
                <div className="seminar-detail-locked">
                    <span className="material-symbols-rounded seminar-detail-locked-icon" aria-hidden="true">
                        lock
                    </span>
                    <h2>This seminar is part of {requiredTier ?? "a higher plan"}</h2>
                    <p>Upgrade your subscription to join this seminar and others like it.</p>
                    <Link to="/tiers" className="seminar-join-btn">
                        See plans
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "not-found") {
        return (
            <div className="seminar-detail">
                {backLink}
                <h2>Seminar not found</h2>
                <p className="status-text">It may have been removed. Go back to the list to find another seminar.</p>
            </div>
        );
    }

    if (status === "error" || !seminar) {
        return (
            <div className="seminar-detail">
                {backLink}
                <p className="status-text status-text--error">{error ?? "Couldn't load the seminar."}</p>
            </div>
        );
    }

    const when = formatDateParts(seminar.seminar_date);

    return (
        <div className="seminar-detail">
            {backLink}

            <header className="seminar-detail-header">
                <span className="seminar-detail-tier">{seminar.tier_title}</span>
                <h2>{seminar.seminar_title}</h2>
            </header>

            {when && (
                <div className="seminar-detail-when">
                    <span className="material-symbols-rounded" aria-hidden="true">
                        event
                    </span>
                    <span>
                        {when.day} at {when.time}
                    </span>
                </div>
            )}

            {seminar.seminar_description && (
                <p className="seminar-detail-description">{seminar.seminar_description}</p>
            )}

            <section className="seminar-detail-join">
                <h3>How to join</h3>
                {/* Replace with the meeting link once meeting_url exists in the database */}
                <p>The link to join will be available here before the seminar starts.</p>
            </section>
        </div>
    );
};

export default SeminarDetailPage;