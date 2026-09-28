import { useRef, useState } from "react";
import { useAdminHabits } from "../../hooks/useAdminHabits";
import type { Habit } from "../../types/HabitsTypes";

export default function AdminHabitsPage() {
    const { habits, isLoading, error, createHabit, updateHabit, deleteHabit } = useAdminHabits();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);

    const isBusy = isSaving || deletingId !== null;

    function resetForm() {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setDuration("");
        setFormError(null);
    }

    function startEdit(habit: Habit) {
        setEditingId(habit.id);
        setTitle(habit.habit_title);
        setDescription(habit.habit_description ?? "");
        setDuration(habit.default_duration_minutes ? String(habit.default_duration_minutes) : "");
        setFormError(null);
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setFormError("Add a title before saving.");
            return;
        }

        const parsedDuration = duration ? Number(duration) : undefined;
        if (parsedDuration !== undefined && (!Number.isInteger(parsedDuration) || parsedDuration < 1)) {
            setFormError("Duration must be a whole number of minutes, 1 or more.");
            return;
        }

        setIsSaving(true);
        setFormError(null);

        // The hook returns null when the request fails
        const saved = editingId
            ? await updateHabit(editingId, {
                habit_title: trimmedTitle,
                // An empty string clears the description (the backend keeps the old value for null)
                habit_description: description.trim(),
                default_duration_minutes: parsedDuration,
            })
            : await createHabit({
                habit_title: trimmedTitle,
                habit_description: description.trim() || undefined,
                default_duration_minutes: parsedDuration,
            });

        setIsSaving(false);

        if (saved) {
            resetForm();
        } else {
            setFormError("Couldn't save the habit. Check the fields and try again.");
        }
    }

    async function handleDelete(habit: Habit) {
        const confirmed = window.confirm(
            `Remove "${habit.habit_title}" from the default habits? Users won't be able to pick it anymore.`
        );
        if (!confirmed) return;

        setDeletingId(habit.id);
        setListError(null);

        // The hook returns false when the request fails
        const deleted = await deleteHabit(habit.id);

        setDeletingId(null);

        if (!deleted) {
            setListError(
                `Couldn't remove "${habit.habit_title}". It may be in use by users; try again or keep it.`
            );
            return;
        }

        if (editingId === habit.id) resetForm();
    }

    return (
        <div className="manage-habits">
            <h2>Default habits</h2>
            <p className="status-text">These habits are available for every user to add to their schedule.</p>

            <form ref={formRef} className="seminar-form" onSubmit={handleSubmit} noValidate>
                <h3>{editingId ? "Edit habit" : "Add a default habit"}</h3>

                <div className="form-field">
                    <label htmlFor="admin_habit_title">Title</label>
                    <input
                        id="admin_habit_title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Morning walk"
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="admin_habit_description">Description (optional)</label>
                    <textarea
                        id="admin_habit_description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="admin_habit_duration">Default duration in minutes (optional)</label>
                    <input
                        id="admin_habit_duration"
                        type="number"
                        min={1}
                        step={1}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 20"
                    />
                </div>

                {formError && (
                    <p className="status-text status-text--error" role="alert">
                        {formError}
                    </p>
                )}

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={isBusy}>
                        {isSaving ? "Saving..." : editingId ? "Save changes" : "Add habit"}
                    </button>

                    {editingId && (
                        <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={isSaving}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {isLoading && <p className="status-text">Loading default habits...</p>}
            {error && <p className="status-text status-text--error">{error}</p>}
            {listError && (
                <p className="status-text status-text--error" role="alert">
                    {listError}
                </p>
            )}

            {!isLoading && !error && habits.length === 0 && (
                <p className="status-text">No default habits yet. Add the first one above so users can pick it.</p>
            )}

            <ul className="seminar-list">
                {habits.map((habit) => (
                    <li
                        key={habit.id}
                        className={`seminar-card ${editingId === habit.id ? "seminar-card--editing" : ""}`}
                    >
                        <div className="seminar-card-title">{habit.habit_title}</div>

                        {habit.habit_description && (
                            <p className="seminar-card-description">{habit.habit_description}</p>
                        )}

                        {habit.default_duration_minutes && (
                            <div className="seminar-card-date">{habit.default_duration_minutes} min</div>
                        )}

                        <div className="seminar-card-actions">
                            <button
                                type="button"
                                className="btn btn-edit"
                                onClick={() => startEdit(habit)}
                                disabled={isBusy}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => handleDelete(habit)}
                                disabled={isBusy}
                            >
                                {deletingId === habit.id ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}