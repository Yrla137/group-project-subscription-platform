import { Link } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import { Lock, Crown } from "lucide-react";
import "./SeminarCard.css";

const FALLBACK_IMG = "/seminar_dummy.jpg";

export type SeminarCardProps = {
    id: string | number;
    title: string;
    img: string | null | undefined;
    // ISO timestamp, e.g. "2026-09-27T17:00:00.000Z"
    startsAt: string | null | undefined;
    description: string | null | undefined;
    // True when the seminar requires a higher tier than the user has
    isTierLocked: boolean;
    tierTitle: string | null | undefined;
};

// e.g. "Sun 27 Sep 2026, 19:00", or null if the timestamp is missing or invalid
function formatDateTime(startsAt: string | null | undefined): string | null {
    if (!startsAt) return null;
    const date = parseISO(startsAt);
    return isValid(date) ? format(date, "EEE d MMM yyyy, HH:mm", { locale: enUS }) : null;
}

const SeminarCard = ({ id, title, img, startsAt, description, isTierLocked, tierTitle }: SeminarCardProps) => {
    const dateTime = formatDateTime(startsAt);
    const target = isTierLocked ? "/tiers" : `/seminars/${id}`;
    const requiredTier = tierTitle ?? "a higher tier";

    return (
        <div className={`seminar-card seminar-card-dashboard ${isTierLocked ? "seminar-card--locked" : ""}`}>
            <div className="seminar-card-img">
                <Link
                    to={target}
                    aria-label={isTierLocked ? `${title}, requires ${requiredTier}. See plans` : `Open ${title}`}
                >
                    <img
                        src={img || FALLBACK_IMG}
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
                            <span className="seminar-lock-badge">
                                <Lock size={20} strokeWidth={3} aria-hidden="true" />
                            </span>
                        </span>
                    )}
                </Link>
            </div>

            <div className="seminar-card-info">
                <h3>{title}</h3>

                {dateTime && <span className="seminar-time">{dateTime}</span>}

                <div>{description && <p className="seminar-description">{description}</p>}</div>

                <div className="seminar-card-btn">
                    <Link to={target} className="primary-btn">
                        {isTierLocked ? (
                            <>
                                Get {requiredTier}
                                <Crown size={16} aria-hidden="true" />
                            </>
                        ) : (
                            "Read more"
                        )}
                    </Link>
                </div>

            </div>

            
        </div>
    );
};

export default SeminarCard;