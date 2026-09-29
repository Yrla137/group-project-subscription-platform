import { Link, useParams } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

import { Lock, ArrowLeft, CalendarDays } from "lucide-react";

import { useSeminar } from "../hooks/useSeminar";
import "./SeminarDetailPage.css";
import Spinner from "../components/Spinner";

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
    const FALLBACK_IMG = "/seminar_dummy.jpg"

    const backLink = (
        <Link to="/seminars" className="seminar-detail-back">
            <ArrowLeft size={16} aria-hidden="true" />
            All seminars
        </Link>
    );

    if (status === "loading") {
        return (
            <div className="seminar-detail">
                {backLink}
                <Spinner />
            </div>
        );
    }

    if (status === "locked") {
        return (
            <div className="seminar-detail">
                {backLink}
                <div className="seminar-detail-locked">
                    <Lock size={24} aria-hidden="true" />
                    <h2>This seminar is part of {requiredTier ?? "a higher plan"}</h2>
                    <p>Upgrade your subscription to join this seminar and others like it.</p>
                    <div>
                        <Link to="/tiers" className="primary-btn">
                            See plans
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "not-found") {
        return (
            <div className="seminar-detail">
                {backLink}
                <h2>Seminar not found</h2>
                <p>It may have been removed. Go back to the list to find another seminar.</p>
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

            <div className="seminar-flex">
                <div className="seminar-img">
                    <img
                        src={seminar.seminar_img || FALLBACK_IMG}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                            if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) {
                                e.currentTarget.src = FALLBACK_IMG;
                            }
                        }}
                    />
                    <span className="seminar-detail-tier">{seminar.tier_title}</span>
                </div>

                <div className="seminar-info">

                    <header className="seminar-detail-header">
                        <h2>{seminar.seminar_title}</h2>
                    </header>

                    {when && (
                        <div className="seminar-detail-when">
                            <CalendarDays size={24} aria-hidden="true" />
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
                        <p>The link to join will be available 30 minutes before the seminar starts.</p>
                    </section>
                </div>
            </div>
        </div>
        
    );
};

export default SeminarDetailPage;