import { useMemo } from "react";
import { isValid, parseISO, startOfDay } from "date-fns";
import { useSeminars } from "../hooks/useSeminars";
import SeminarCard from "../components/SeminarCard";
import "./SeminarsPage.css";
import Spinner from "../components/Spinner";

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

      <p className="header-desc">Find inspiring seminars to guide you.</p>

      {isLoading && upcoming.length === 0 && <Spinner />}
      {error && <p className="status-text status-text--error">Couldn't load seminars: {error}</p>}

      {!isLoading && !error && upcoming.length === 0 && (
        <p className="status-text">No upcoming seminars yet. New ones show up here when they're scheduled.</p>
      )}

      <div className="seminar-list">
        {upcoming.map((seminar) => (
          <SeminarCard
            key={seminar.id}
            id={seminar.id}
            title={seminar.seminar_title}
            img={seminar.seminar_img}
            startsAt={seminar.seminar_date}
            description={seminar.seminar_description}
            isTierLocked={seminar.is_locked}
            tierTitle={seminar.tier_title}
          />
        ))}
      </div>
    </div>
  );
};

export default SeminarsPage;