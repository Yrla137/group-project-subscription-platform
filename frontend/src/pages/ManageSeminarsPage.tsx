import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { useSeminars } from "../hooks/useSeminars";
import type { Seminar, CreateSeminarInput, UpdateSeminar } from "../types/SeminarsTypes";
import "./ManageSeminarsPage.css"

const emptyForm: CreateSeminarInput = {
    seminar_title: "",
    seminar_description: "",
    seminar_date: "",
    tier_id: 1,
};

export default function ManageSeminars() {
    const { seminars, isLoading, error, createSeminar, updateSeminar, deleteSeminar } = useSeminars();

    const [formData, setFormData] = useState<CreateSeminarInput>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "tier_id" ? Number(value) : value,
        }));
    }

    function startEdit(seminar: Seminar) {
        setEditingId(seminar.id);
        setFormData({
            seminar_title: seminar.seminar_title,
            seminar_description: seminar.seminar_description ?? "",
            seminar_date: format(parseISO(seminar.seminar_date), "yyyy-MM-dd'T'HH:mm"),
            tier_id: seminar.tier_id,
        });

        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        titleInputRef.current?.focus();
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData(emptyForm);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const seminarDateUtc = new Date(formData.seminar_date).toISOString();

        if (editingId) {
            const updateData: UpdateSeminar = {
                seminar_title: formData.seminar_title,
                seminar_description: formData.seminar_description || undefined,
                seminar_date: seminarDateUtc,
                tier_id: formData.tier_id,
            };
            await updateSeminar(editingId, updateData);
        } else {
            await createSeminar({ ...formData, seminar_date: seminarDateUtc });
        }

        setIsSubmitting(false);
        cancelEdit();
    }

    async function handleDelete(id: number) {
        const confirmed = window.confirm("Are you sure you want to delete this seminar?");
        if (!confirmed) return;

        setDeletingId(id);
        await deleteSeminar(id);
        setDeletingId(null);
    }

    const isAnyActionInProgress = isSubmitting || deletingId !== null;

    return (
        <div className="manage-seminars">
            <h2>Manage seminars</h2>

            <form ref={formRef} className="seminar-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="seminar_title">Title</label>
                    <input
                        ref={titleInputRef}
                        id="seminar_title"
                        name="seminar_title"
                        type="text"
                        value={formData.seminar_title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="seminar_description">Description</label>
                    <textarea id="seminar_description" name="seminar_description"
                        value={formData.seminar_description} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <label htmlFor="seminar_date">Date and time</label>
                    <input id="seminar_date" name="seminar_date" type="datetime-local"
                        value={formData.seminar_date} onChange={handleChange} required />
                </div>

                <div className="form-field">
                    <label htmlFor="tier_id">Tier</label>
                    <select id="tier_id" name="tier_id" value={formData.tier_id} onChange={handleChange}>
                        <option value={1}>Free</option>
                        <option value={2}>Plus</option>
                        <option value={3}>Pro</option>
                    </select>
                </div>

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

            {isLoading && <p className="status-text">Loading seminars...</p>}
            {error && <p className="status-text status-text--error">{error}</p>}

            <ul className="seminar-list">
                {seminars.map((seminar) => (
                    <li key={seminar.id} className="seminar-card">
                        <div className="seminar-card-title">{seminar.seminar_title}</div>
                        <div className="seminar-card-date">
                            {format(parseISO(seminar.seminar_date), "d MMMM yyyy, HH:mm", { locale: enUS })}
                        </div>
                        {seminar.seminar_description && (
                            <p className="seminar-card-description">{seminar.seminar_description}</p>
                        )}

                        <div className="seminar-card-actions">
                            <button type="button" className="btn btn-edit" onClick={() => startEdit(seminar)}
                                disabled={isAnyActionInProgress}>
                                Edit
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => handleDelete(seminar.id)}
                                disabled={isAnyActionInProgress}>
                                {deletingId === seminar.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}