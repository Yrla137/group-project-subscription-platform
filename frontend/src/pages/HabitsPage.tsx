import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useHabits } from "../hooks/useHabits";
import { useUserHabits } from "../hooks/useUserHabits";
import type { UserHabitWithDetails } from "../types/UserHabitsTypes";
import type { Habit } from "../types/HabitsTypes";
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
    habitLimit,
    canCreateHabit,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits();

  const {
    userHabits,
    isLoading: userHabitsLoading,
    error,
    createUserHabit,
    updateUserHabit,
    deleteUserHabit,
    // Needed after renaming or deleting a custom habit, since the schedules show its title
    refetch: refetchUserHabits,
  } = useUserHabits(new Date(), false);

  // ---- Custom habit form (create or edit) ----
  const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
  const [editingCustomHabitId, setEditingCustomHabitId] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [isSavingCustomHabit, setIsSavingCustomHabit] = useState(false);
  const [deletingCustomHabitId, setDeletingCustomHabitId] = useState<number | null>(null);
  const [customFormError, setCustomFormError] = useState<string | null>(null);
  const [customListError, setCustomListError] = useState<string | null>(null);

  // ---- Schedule form ----
  const [selectedHabitId, setSelectedHabitId] = useState<number | "">("");
  const [scheduleType, setScheduleType] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const customTitleRef = useRef<HTMLInputElement>(null);

  // The user's own habits; default habits have created_by = null
  const customHabits = habits.filter((habit) => habit.created_by !== null);

  useEffect(() => {
    if (!selectedHabitId || editingId) return; // don't override values while editing

    const habit = habits.find((h) => h.id === selectedHabitId);
    if (habit?.default_duration_minutes) {
      setDuration(String(habit.default_duration_minutes));
    }
  }, [selectedHabitId, habits, editingId]);

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function resetForm() {
    setEditingId(null);
    setSelectedHabitId("");
    setScheduleType("DAILY");
    setSelectedDays([]);
    setDuration("");
  }

  // ---- Custom habits: create, edit, delete ----

  function closeCustomHabitForm() {
    setShowCustomHabitForm(false);
    setEditingCustomHabitId(null);
    setCustomTitle("");
    setCustomDescription("");
    setCustomDuration("");
    setCustomFormError(null);
  }

  function startEditCustomHabit(habit: Habit) {
    setEditingCustomHabitId(habit.id);
    setCustomTitle(habit.habit_title);
    setCustomDescription(habit.habit_description ?? "");
    setCustomDuration(habit.default_duration_minutes ? String(habit.default_duration_minutes) : "");
    setCustomFormError(null);
    setShowCustomHabitForm(true);

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Wait for the form to render before moving focus to the title
    requestAnimationFrame(() => {
      customTitleRef.current?.focus({ preventScroll: true });
      customTitleRef.current?.select();
    });
  }

  async function handleSaveCustomHabit() {
    const trimmedTitle = customTitle.trim();
    if (!trimmedTitle) return;

    setIsSavingCustomHabit(true);
    setCustomFormError(null);

    const parsedDuration = customDuration ? Number(customDuration) : undefined;

    if (editingCustomHabitId) {
      const updated = await updateHabit(editingCustomHabitId, {
        habit_title: trimmedTitle,
        habit_description: customDescription.trim(),
        // null clears the duration; undefined would leave the old value
        default_duration_minutes: customDuration ? Number(customDuration) : null,
      });

      setIsSavingCustomHabit(false);

      if (!updated) {
        setCustomFormError("Couldn't save your changes. Try again.");
        return;
      }

      closeCustomHabitForm();
      refetchUserHabits();
      return;
    }

    const newHabit = await createHabit({
      habit_title: trimmedTitle,
      habit_description: customDescription.trim() || undefined,
      default_duration_minutes: parsedDuration,
    });

    setIsSavingCustomHabit(false);

    if (!newHabit) {
      setCustomFormError("Couldn't create the habit. Try again.");
      return;
    }

    // Select the new habit, so it's ready to be scheduled right away
    setSelectedHabitId(newHabit.id);
    closeCustomHabitForm();
  }

  async function handleDeleteCustomHabit(habit: Habit) {
    const confirmed = window.confirm(
      `Delete "${habit.habit_title}"? It will also be removed from your schedule, including statistics.`
    );
    if (!confirmed) return;

    setDeletingCustomHabitId(habit.id);
    setCustomListError(null);

    const deleted = await deleteHabit(habit.id);

    setDeletingCustomHabitId(null);

    if (!deleted) {
      setCustomListError(`Couldn't delete "${habit.habit_title}". Try again.`);
      return;
    }

    if (editingCustomHabitId === habit.id) closeCustomHabitForm();
    if (selectedHabitId === habit.id) resetForm();

    // The database removed its schedules too, so the schedule list needs to catch up
    refetchUserHabits();
  }

  // ---- Schedules ----

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

    const recurrence_rule = scheduleType === "DAILY" ? "DAILY" : `WEEKLY:${selectedDays.join(",")}`;

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
    const confirmed = window.confirm("Are you sure you want to remove this habit? All of the associated statistics will be lost.");
    if (!confirmed) return;

    setDeletingId(id);
    await deleteUserHabit(id);
    setDeletingId(null);
  }

  const isAnyActionInProgress =
    isSubmitting || deletingId !== null || isSavingCustomHabit || deletingCustomHabitId !== null;

  // Editing an existing custom habit is always allowed, even when the limit for new ones is reached
  const isCustomFormVisible = showCustomHabitForm && (canCreateHabit || editingCustomHabitId !== null);

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
            {isCustomFormVisible ? (
              <div className="custom-habit-form">
                <label htmlFor="custom_title">{editingCustomHabitId ? "Habit title" : "New habit title"}</label>
                <input
                  ref={customTitleRef}
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

                {customFormError && (
                  <p className="status-text status-text--error" role="alert">
                    {customFormError}
                  </p>
                )}

                <div className="custom-habit-form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveCustomHabit}
                    disabled={isSavingCustomHabit || !customTitle.trim()}
                  >
                    {isSavingCustomHabit ? "Saving..." : editingCustomHabitId ? "Save changes" : "Create habit"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeCustomHabitForm}
                    disabled={isSavingCustomHabit}
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
                  {canCreateHabit ? (
                    <Plus size={16} strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <Lock size={16} aria-hidden="true" />
                  )}
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
        {/* ---- Schedules ---- */}
        <section className="edit-habits-section">
          {userHabitsLoading && <Spinner />}
          {error && <p className="status-text status-text--error">{error}</p>}

          {userHabits.length > 0 && <h2>Edit habit schedules</h2>}

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
                    aria-label={`Edit schedule for ${uh.habit_title}`}
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
        </section>

        {/* ---- Custom habits ---- */}
        {customHabits.length > 0 && (
          <section className="edit-habits-section">
            <h2>Edit custom habits</h2>

            {customListError && (
              <p className="status-text status-text--error" role="alert">
                {customListError}
              </p>
            )}

            <ul className="habit-list">
              {customHabits.map((habit) => (
                <li
                  key={habit.id}
                  className={`habit-card ${editingCustomHabitId === habit.id ? "habit-card--editing" : ""}`}
                  aria-current={editingCustomHabitId === habit.id ? "true" : undefined}
                >
                  <div className="habit-card-text">
                    <div className="habit-card-title">{habit.habit_title}</div>
                    {habit.habit_description && (
                      <p className="habit-card-description">{habit.habit_description}</p>
                    )}
                  </div>

                  <div className="habit-card-date">
                    {habit.default_duration_minutes ? `${habit.default_duration_minutes} min` : null}
                  </div>

                  <div className="habit-card-actions">
                    <button
                      type="button"
                      className="btn btn-edit"
                      onClick={() => startEditCustomHabit(habit)}
                      disabled={isAnyActionInProgress}
                      aria-label={`Edit ${habit.habit_title}`}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDeleteCustomHabit(habit)}
                      disabled={isAnyActionInProgress}
                      aria-label={
                        deletingCustomHabitId === habit.id
                          ? `Deleting ${habit.habit_title}`
                          : `Delete ${habit.habit_title}`
                      }
                    >
                      {deletingCustomHabitId === habit.id ? "…" : <X size={16} aria-hidden="true" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}