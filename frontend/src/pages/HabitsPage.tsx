import { useState, useEffect } from "react";
import { useHabits } from "../hooks/useHabits";
import { useUserHabits } from "../hooks/useUserHabits";
import "./HabitsPage.css";

const WEEKDAYS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

export default function HabitsPage() {
  const { habits, isLoading: habitsLoading } = useHabits();
  const {
    userHabits,
    isLoading: userHabitsLoading,
    error,
    createUserHabit,
    deleteUserHabit,
  } = useUserHabits(new Date(), false);

  const [selectedHabitId, setSelectedHabitId] = useState<number | "">("");
  const [scheduleType, setScheduleType] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedHabitId) return;

    const habit = habits.find((h) => h.id === selectedHabitId);
    if (habit?.default_duration_minutes) {
      setDuration(String(habit.default_duration_minutes));
    }
  }, [selectedHabitId, habits]);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function resetForm() {
    setSelectedHabitId("");
    setScheduleType("DAILY");
    setSelectedDays([]);
    setDuration("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHabitId) return;

    const recurrence_rule =
      scheduleType === "DAILY" ? "DAILY" : `WEEKLY:${selectedDays.join(",")}`;

    if (scheduleType === "WEEKLY" && selectedDays.length === 0) {
      return; // require at least one day selected
    }

    setIsSubmitting(true);

    await createUserHabit({
      habit_id: selectedHabitId,
      is_recurring: true,
      recurrence_rule,
      duration_minutes: duration ? Number(duration) : undefined,
    });

    setIsSubmitting(false);
    resetForm();
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Are you sure you want to remove this habit?");
    if (!confirmed) return;

    setDeletingId(id);
    await deleteUserHabit(id);
    setDeletingId(null);
  }

  const isAnyActionInProgress = isSubmitting || deletingId !== null;

const HabitsPage = () => {
  return (
    <div className="manage-habits">
      <h2>Manage habits</h2>

      <form className="seminar-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="habit_id">Habit</label>
          <select
            id="habit_id"
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value ? Number(e.target.value) : "")}
            required
          >
            <option value="">Select a habit…</option>
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.habit_title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            id="duration"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 20"
          />
        </div>

        <div className="form-field">
          <label>Schedule</label>
          <div className="schedule-type-toggle">
            <button
              type="button"
              className={`btn ${scheduleType === "DAILY" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setScheduleType("DAILY")}
            >
              Every day
            </button>
            <button
              type="button"
              className={`btn ${scheduleType === "WEEKLY" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setScheduleType("WEEKLY")}
            >
              Specific days
            </button>
          </div>

          {scheduleType === "WEEKLY" && (
            <div className="weekday-picker">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={`weekday-btn ${selectedDays.includes(day.value) ? "weekday-btn--active" : ""}`}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isAnyActionInProgress || habitsLoading || !selectedHabitId}
          >
            {isSubmitting ? "Adding..." : "Add habit"}
          </button>
        </div>
      </form>

      {userHabitsLoading && <p className="status-text">Loading your habits...</p>}
      {error && <p className="status-text status-text--error">{error}</p>}

      <ul className="seminar-list">
        {userHabits.map((uh) => (
          <li key={uh.id} className="seminar-card">
            <div className="seminar-card-title">{uh.habit_title}</div>
            {uh.habit_description && (
              <p className="seminar-card-description">{uh.habit_description}</p>
            )}
            <div className="seminar-card-date">
              {uh.recurrence_rule === "DAILY" ? "Every day" : uh.recurrence_rule?.replace("WEEKLY:", "")}
              {uh.duration_minutes ? ` · ${uh.duration_minutes} min` : ""}
            </div>

            <div className="seminar-card-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDelete(uh.id)}
                disabled={isAnyActionInProgress}
              >
                {deletingId === uh.id ? "Removing..." : "Remove"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}