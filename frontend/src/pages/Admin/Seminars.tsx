import { useState, useRef } from "react";
import { format, parseISO, isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import { Pencil, X } from "lucide-react";
import { useSeminars } from "../../hooks/useSeminars";
import type { Seminar, CreateSeminarInput, UpdateSeminar } from "../../types/SeminarsTypes";
import Spinner from "../../components/Spinner";
import "./Seminars.css";

const emptyForm: CreateSeminarInput = {
    seminar_title: "",
    seminar_description: "",
    seminar_img: "",
    seminar_date: "",
    tier_id: 1,
};

// e.g. "27 September 2026, 19:00", or an empty string if the date is invalid
function formatSeminarDate(seminarDate: string): string {
    const date = parseISO(seminarDate);
    return isValid(date) ? format(date, "d MMMM yyyy, HH:mm", { locale: enUS }) : "";
}

export default function ManageSeminars() {
    const { seminars, isLoading, error, createSeminar, updateSeminar, deleteSeminar } = useSeminars();

    const [formData, setFormData] = useState<CreateSeminarInput>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "tier_id" ? Number(value) : value,
        }));
    }

    function startEdit(seminar: Seminar) {
        setEditingId(seminar.id);
        setFormError(null);
        setFormData({
            seminar_title: seminar.seminar_title,
            seminar_description: seminar.seminar_description ?? "",
            seminar_img: seminar.seminar_img ?? "",
            seminar_date: format(parseISO(seminar.seminar_date), "yyyy-MM-dd'T'HH:mm"),
            tier_id: seminar.tier_id,
        });

        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

        // Wait for React to render the seminar's values before moving focus to the title
        requestAnimationFrame(() => {
            titleInputRef.current?.focus({ preventScroll: true });
            titleInputRef.current?.select();
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData(emptyForm);
        setFormError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const date = new Date(formData.seminar_date);
        if (!formData.seminar_title.trim() || Number.isNaN(date.getTime())) {
            setFormError("Add a title and a date before saving.");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        const seminarDateUtc = date.toISOString();
        // An empty field removes the image, so the card shows the fallback image
        const seminarImg = formData.seminar_img?.trim() || null;

        let saved;
        if (editingId) {
            const updateData: UpdateSeminar = {
                seminar_title: formData.seminar_title.trim(),
                seminar_description: formData.seminar_description || undefined,
                seminar_img: seminarImg,
                seminar_date: seminarDateUtc,
                tier_id: formData.tier_id,
            };
            saved = await updateSeminar(editingId, updateData);
        } else {
            saved = await createSeminar({
                ...formData,
                seminar_title: formData.seminar_title.trim(),
                seminar_img: seminarImg,
                seminar_date: seminarDateUtc,
            });
        }

        setIsSubmitting(false);

        if (saved) {
            cancelEdit();
        } else {
            setFormError("Couldn't save the seminar. Check the fields and try again.");
        }
    }

    async function handleDelete(seminar: Seminar) {
        const confirmed = window.confirm(`Delete "${seminar.seminar_title}"? This can't be undone.`);
        if (!confirmed) return;

        setDeletingId(seminar.id);
        setListError(null);

        const deleted = await deleteSeminar(seminar.id);

        setDeletingId(null);

        if (!deleted) {
            setListError(`Couldn't delete "${seminar.seminar_title}". Try again.`);
            return;
        }

        if (editingId === seminar.id) cancelEdit();
    }

    const isAnyActionInProgress = isSubmitting || deletingId !== null;

    return (
        <div className="admin-seminars-wrapper">
            {/* Left column: the form */}
            <div className="admin-seminars-form-column">
                <h2>{editingId ? "Edit seminar" : "Create a seminar"}</h2>

                <form ref={formRef} className="admin-seminar-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label htmlFor="seminar_title">Title</label>
                        <input
                            ref={titleInputRef}
                            id="seminar_title"
                            name="seminar_title"
                            type="text"
                            value={formData.seminar_title}
                            onChange={handleChange}
                            placeholder="e.g. Work-Life Balance 101"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="seminar_description">Description</label>
                        <textarea
                            id="seminar_description"
                            name="seminar_description"
                            value={formData.seminar_description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="seminar_img">Image URL (optional)</label>
                        <input
                            id="seminar_img"
                            name="seminar_img"
                            type="text"
                            value={formData.seminar_img ?? ""}
                            onChange={handleChange}
                            placeholder="https://images.unsplash.com/…"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="seminar_date">Date and time</label>
                        <input
                            id="seminar_date"
                            name="seminar_date"
                            type="datetime-local"
                            value={formData.seminar_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="tier_id">Tier</label>
                        <select id="tier_id" name="tier_id" value={formData.tier_id} onChange={handleChange}>
                            <option value={1}>Slacker</option>
                            <option value={2}>Planner</option>
                            <option value={3}>Try hard</option>
                        </select>
                    </div>

                    {formError && (
                        <p className="status-text status-text--error" role="alert">
                            {formError}
                        </p>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isAnyActionInProgress}>
                            {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Create seminar"}
                        </button>

                        {editingId && (
                            <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isSubmitting}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Right column: all seminars */}
            <div className="admin-seminars-list-column">
                <h2>Seminars</h2>

                {isLoading && <Spinner />}
                {error && <p className="status-text status-text--error">{error}</p>}
                {listError && (
                    <p className="status-text status-text--error" role="alert">
                        {listError}
                    </p>
                )}

                {!isLoading && !error && seminars.length === 0 && (
                    <p className="status-text">No seminars yet. Create the first one to the left.</p>
                )}

                <ul className="admin-seminar-list">
                    {seminars.map((seminar) => (
                        <li
                            key={seminar.id}
                            className={`admin-seminar-card ${editingId === seminar.id ? "admin-seminar-card--editing" : ""}`}
                            aria-current={editingId === seminar.id ? "true" : undefined}
                        >
                            <div className="admin-seminar-card-text">
                                <div className="admin-seminar-card-title">{seminar.seminar_title}</div>
                                {seminar.tier_title && (
                                    <div className="admin-seminar-card-tier">{seminar.tier_title}</div>
                                )}
                            </div>

                            <div className="admin-seminar-card-date">{formatSeminarDate(seminar.seminar_date)}</div>

                            <div className="admin-seminar-card-actions">
                                <button
                                    type="button"
                                    className="btn btn-edit"
                                    onClick={() => startEdit(seminar)}
                                    disabled={isAnyActionInProgress}
                                    aria-label={`Edit ${seminar.seminar_title}`}
                                >
                                    <Pencil size={16} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(seminar)}
                                    disabled={isAnyActionInProgress}
                                    aria-label={
                                        deletingId === seminar.id
                                            ? `Deleting ${seminar.seminar_title}`
                                            : `Delete ${seminar.seminar_title}`
                                    }
                                >
                                    {deletingId === seminar.id ? "…" : <X size={16} aria-hidden="true" />}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}