import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useHabits } from "../hooks/useHabits";
import { useUserHabits } from "../hooks/useUserHabits";
import type { UserHabitWithDetails } from "../types/UserHabitsTypes";
import "./HabitsPage.css";
import Spinner from "../components/Spinner";
import { Pencil, X, Lock, Plus } from "lucide-react";

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
  const {
    habits,
    isLoading: habitsLoading,
    error: habitsError,
    habitLimit,
    canCreateHabit,
    createHabit,
  } = useHabits();

  const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [isCreatingHabit, setIsCreatingHabit] = useState(false);

  const {
    userHabits,
    isLoading: userHabitsLoading,
    error,
    createUserHabit,
    updateUserHabit,
    deleteUserHabit,
  } = useUserHabits(new Date(), false);

  const [selectedHabitId, setSelectedHabitId] = useState<number | "">("");
  const [scheduleType, setScheduleType] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!selectedHabitId || editingId) return; // don't override values while editing

    const habit = habits.find((h) => h.id === selectedHabitId);
    if (habit?.default_duration_minutes) {
      setDuration(String(habit.default_duration_minutes));
    }
  }, [selectedHabitId, habits, editingId]);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function resetForm() {
    setEditingId(null);
    setSelectedHabitId("");
    setScheduleType("DAILY");
    setSelectedDays([]);
    setDuration("");
  }

  async function handleCreateCustomHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsCreatingHabit(true);

    const newHabit = await createHabit({
      habit_title: customTitle.trim(),
      habit_description: customDescription.trim() || undefined,
      default_duration_minutes: customDuration ? Number(customDuration) : undefined,
    });

    if (newHabit) {
      setSelectedHabitId(newHabit.id);
      setCustomTitle("");
      setCustomDescription("");
      setCustomDuration("");
      setShowCustomHabitForm(false);
    }

    setIsCreatingHabit(false);
  }

  function startEdit(uh: UserHabitWithDetails) {
    setEditingId(uh.id);
    setSelectedHabitId(uh.habit_id);
    setDuration(uh.duration_minutes ? String(uh.duration_minutes) : "");

    if (uh.recurrence_rule === "DAILY") {
      setScheduleType("DAILY");
      setSelectedDays([]);
    } else if (uh.recurrence_rule?.startsWith("WEEKLY:")) {
      setScheduleType("WEEKLY");
      setSelectedDays(uh.recurrence_rule.replace("WEEKLY:", "").split(","));
    }

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    if (editingId) {
      await updateUserHabit(editingId, {
        recurrence_rule,
        duration_minutes: duration ? Number(duration) : undefined,
      });
    } else {
      await createUserHabit({
        habit_id: selectedHabitId,
        is_recurring: true,
        recurrence_rule,
        duration_minutes: duration ? Number(duration) : undefined,
      });
    }

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

  return (
    <div className="manage-habits-wrapper">
      <div className="manage-habits">
        <h2>Manage habits</h2>

        <form ref={formRef} className="habit-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="habit_id">Habit</label>
            <select
              id="habit_id"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value ? Number(e.target.value) : "")}
              required
              disabled={!!editingId}
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
            {showCustomHabitForm && canCreateHabit ? (
              <div className="custom-habit-form">
                <label htmlFor="custom_title">New habit title</label>
                <input
                  id="custom_title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Cold shower"
                />

                <label htmlFor="custom_description">Description (optional)</label>
                <textarea
                  id="custom_description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />

                <label htmlFor="custom_duration">Default duration (minutes, optional)</label>
                <input
                  id="custom_duration"
                  type="number"
                  min={1}
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                />

                {habitsError && <p className="status-text status-text--error">{habitsError}</p>}

                <div className="custom-habit-form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateCustomHabit}
                    disabled={isCreatingHabit || !customTitle.trim()}
                  >
                    {isCreatingHabit ? "Creating..." : "Create habit"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCustomHabitForm(false)}
                    disabled={isCreatingHabit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCustomHabitForm(true)}
                  disabled={!!editingId || !canCreateHabit}
                  aria-describedby={habitLimit ? "habit-limit-notice" : undefined}
                >
                  {canCreateHabit ? <Plus size={16} strokeWidth={3} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
                  Add custom habit
                </button>

                {habitLimit && (
                  <p
                    id="habit-limit-notice"
                    className={`habit-limit-text ${!canCreateHabit ? "habit-limit-text--reached" : ""}`}
                  >
                    {canCreateHabit ? (
                      `${habitLimit.customHabitCount} of ${habitLimit.maxCustomHabits} custom habits used`
                    ) : habitLimit.maxCustomHabits === 0 ? (
                      <>
                        Your plan doesn't include custom habits.{" "}
                        <Link to="/tiers" className="habit-limit-link">
                          Upgrade your subscription
                        </Link>{" "}
                        to create your own.
                      </>
                    ) : (
                      <>
                        Your plan allows {habitLimit.maxCustomHabits} custom habits.{" "}
                        <Link to="/tiers" className="habit-limit-link">
                          Upgrade your subscription
                        </Link>{" "}
                        to create more.
                      </>
                    )}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="duration">Duration (minutes, optional)</label>
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
            <div className="schedule-row">
              <button
                type="button"
                role="switch"
                aria-checked={scheduleType === "DAILY"}
                className="schedule-switch"
                onClick={() => setScheduleType((type) => (type === "DAILY" ? "WEEKLY" : "DAILY"))}
              >
                Every day
                <span className="schedule-switch-track" aria-hidden="true">
                  <span className="schedule-switch-thumb" />
                </span>

              </button>

              {scheduleType === "WEEKLY" && (
                <div className="weekday-picker" role="group" aria-label="Days">
                  Schedule:
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={`weekday-btn ${selectedDays.includes(day.value) ? "weekday-btn--active" : ""}`}
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={selectedDays.includes(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isAnyActionInProgress || habitsLoading || !selectedHabitId}
            >
              {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Add habit"}
            </button>

            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={isSubmitting}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="edit-habits">

        {userHabitsLoading && <Spinner />}
        {error && <p className="status-text status-text--error">{error}</p>}

        {userHabits.length > 0 && <h2>Edit habits</h2>}

        <ul className="habit-list">
          {userHabits.map((uh) => (

            <li
              key={uh.id}
              className={`habit-card ${editingId === uh.id ? "habit-card--editing" : ""}`}
              aria-current={editingId === uh.id ? "true" : undefined}
            >
              <div>
                <div className="habit-card-title">{uh.habit_title}</div>
              </div>
              <div className="habit-card-date">
                {uh.recurrence_rule === "DAILY" ? "Every day" : uh.recurrence_rule?.replace("WEEKLY:", "")}
                {uh.duration_minutes ? ` · ${uh.duration_minutes} min` : ""}
              </div>

              <div className="habit-card-actions">
                <button
                  type="button"
                  className="btn btn-edit"
                  onClick={() => startEdit(uh)}
                  disabled={isAnyActionInProgress}
                  aria-label={`Edit ${uh.habit_title}`}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(uh.id)}
                  disabled={isAnyActionInProgress}
                  aria-label={deletingId === uh.id ? `Removing ${uh.habit_title}` : `Remove ${uh.habit_title}`}
                >
                  {deletingId === uh.id ? "…" : <X size={16} aria-hidden="true" />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}