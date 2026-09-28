import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useSeminars } from "../hooks/useSeminars";
import "./SeminarsPage.css";

// e.g. "Sun 27 Sep, 19:00", or null if the date is missing or invalid
function formatStart(seminarDate: string): string | null {
  const date = parseISO(seminarDate);
  return isValid(date) ? format(date, "EEE d MMM, HH:mm", { locale: enUS }) : null;
}

const SeminarsPage = () => {
  // The backend decides which seminars are locked for this user (is_locked)
  const { seminars, isLoading, error } = useSeminars();

  // Only upcoming seminars; today's are kept for the whole day
  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return seminars.filter((seminar) => {
      const date = parseISO(seminar.seminar_date);
      return isValid(date) && date >= today;
    });
  }, [seminars]);

  return (
    <div className="seminars-page">
      
      <h1>Seminars</h1>

      {isLoading && upcoming.length === 0 && <p className="status-text">Loading seminars…</p>}
      {error && <p className="status-text status-text--error">Couldn't load seminars: {error}</p>}

      {!isLoading && !error && upcoming.length === 0 && (
        <p className="status-text">No upcoming seminars yet. New ones show up here when they're scheduled.</p>
      )}

      <div className="seminar-list">
        {upcoming.map((seminar) => {
          const start = formatStart(seminar.seminar_date);

          return (
            <div
              key={seminar.id}
              className={`seminar-card ${seminar.is_locked ? "seminar-card--locked" : ""}`}
            >
              <div className="seminar-card-header">
                <span className="seminar-title">{seminar.seminar_title}</span>

                {seminar.is_locked && (
                  <span className="seminar-lock-badge">
                    <span className="material-symbols-rounded" aria-hidden="true">
                      lock
                    </span>
                    {seminar.tier_title}
                  </span>
                )}
              </div>

              {seminar.seminar_description && (
                <p className="seminar-description">{seminar.seminar_description}</p>
              )}

              {start && <span className="seminar-time">{start}</span>}

              {/* Same button for everyone; locked seminars lead to the plans page */}
              <Link
                to={seminar.is_locked ? "/tiers" : `/seminars/${seminar.id}`}
                className="seminar-join-btn"
                aria-label={
                  seminar.is_locked
                    ? `Join ${seminar.seminar_title}, requires ${seminar.tier_title}`
                    : `Join ${seminar.seminar_title}`
                }
              >
                Join seminar
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeminarsPage;