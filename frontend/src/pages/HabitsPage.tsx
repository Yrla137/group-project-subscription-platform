import { useState, useEffect, useRef } from "react";
import { useHabits } from "../hooks/useHabits";
import { useUserHabits } from "../hooks/useUserHabits";
import type { UserHabitWithDetails } from "../types/UserHabitsTypes";
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
  const { habits, isLoading: habitsLoading, createHabit } = useHabits();

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
    <div className="manage-habits">
      <h2>Manage habits</h2>

      <form ref={formRef} className="seminar-form" onSubmit={handleSubmit}>
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
          {!showCustomHabitForm ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCustomHabitForm(true)}
              disabled={!!editingId}
            >
              + Add custom habit
            </button>
          ) : (
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
          )}
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
            {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Add habit"}
          </button>

          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={isSubmitting}>
              Cancel
            </button>
          )}
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
                className="btn btn-edit"
                onClick={() => startEdit(uh)}
                disabled={isAnyActionInProgress}
              >
                Edit
              </button>
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