import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, X } from "lucide-react";
import { useAdminHabits } from "../../hooks/useAdminHabits";
import type { Habit } from "../../types/HabitsTypes";
import Spinner from "../../components/Spinner";
// Same styles as the user's habits page; adjust the path if HabitsPage.css lives elsewhere
import "../HabitsPage.css";
import './AdminPage.css';

export default function DefaultHabits() {
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
    const titleInputRef = useRef<HTMLInputElement>(null);

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

        // Wait for React to render the habit's values before moving focus to the title
        requestAnimationFrame(() => {
            titleInputRef.current?.focus({ preventScroll: true });
            titleInputRef.current?.select();
        });

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
                // null clears the duration; undefined would leave the old value
                default_duration_minutes: parsedDuration ?? null,
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
            `Remove "${habit.habit_title}" from the default habits? This habit will be deleted from every user's personal calendar.`
        );
        if (!confirmed) return;

        setDeletingId(habit.id);
        setListError(null);

        // The hook returns false when the request fails
        const deleted = await deleteHabit(habit.id);

        setDeletingId(null);

        if (!deleted) {
            setListError(`Couldn't remove "${habit.habit_title}". It may be in use by users. Try again or keep it.`);
            return;
        }

        if (editingId === habit.id) resetForm();
    }

    return (
        <div className="admin-page">
            <section className="admin-header">
                <div className="admin-header-content">
                    <h1 className="admin-title">Manage Default Habits</h1>
                    <p className="admin-subtitle">
                        Manage the pre-set habits available to users.
                    </p>
                </div>
            </section>
            <div className="manage-habits-page">

                <div className="manage-habits-wrapper">
                    {/* Left column: the form */}
                    <div className="manage-habits">
                        <h2>{editingId ? "Edit default habit" : "Add a default habit"}</h2>

                        <form ref={formRef} className="habit-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-field">
                                <label htmlFor="admin_habit_title">Title</label>
                                <input
                                    ref={titleInputRef}
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
                                <label htmlFor="admin_habit_duration">Default duration (minutes, optional)</label>
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
                    </div>

                    {/* Right column: the default habits */}
                    <div className="edit-habits">
                        <h2>Default habits</h2>

                        {isLoading && <Spinner />}
                        {error && <p className="status-text status-text--error">{error}</p>}
                        {listError && (
                            <p className="status-text status-text--error" role="alert">
                                {listError}
                            </p>
                        )}

                        {!isLoading && !error && habits.length === 0 && (
                            <p className="status-text">No default habits yet. Add the first one so users can pick it.</p>
                        )}

                        <ul className="habit-list">
                            {habits.map((habit) => (
                                <li
                                    key={habit.id}
                                    className={`habit-card ${editingId === habit.id ? "habit-card--editing" : ""}`}
                                >
                                    <div className="habit-card-text">
                                        <div className="habit-card-title">{habit.habit_title}</div>
                                    </div>

                                    <div className="habit-card-date">
                                        {habit.default_duration_minutes ? `${habit.default_duration_minutes} min` : null}
                                    </div>

                                    <div className="habit-card-actions">
                                        <button
                                            type="button"
                                            className="btn btn-edit"
                                            onClick={() => startEdit(habit)}
                                            disabled={isBusy}
                                            aria-label={`Edit ${habit.habit_title}`}
                                        >
                                            <Pencil size={16} aria-hidden="true" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(habit)}
                                            disabled={isBusy}
                                            aria-label={
                                                deletingId === habit.id
                                                    ? `Removing ${habit.habit_title}`
                                                    : `Remove ${habit.habit_title}`
                                            }
                                        >
                                            {deletingId === habit.id ? "…" : <X size={16} aria-hidden="true" />}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="back-to-admin-link">
                    <Link to="/admin">
                        Back to Admin Panel
                    </Link>
                </div>
            </div>
            
        </div>
    );
}