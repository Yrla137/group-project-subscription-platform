import type { NewTierFormData } from "../../types/TierType";

interface AddNewTierFormProps {
    showNewTierForm: boolean;
    handleAddNewTier: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    handleAddNewTierChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    addNewTier: NewTierFormData;
    handleCancelAddNewTier: () => void;
}

const AddNewTierForm = ({
    showNewTierForm,
    handleAddNewTier,
    handleAddNewTierChange,
    addNewTier,
    handleCancelAddNewTier
}: AddNewTierFormProps) => {

    return (

        <div>

            {showNewTierForm && (

                <div className="add-tier-form-container">
                    <h2>Add New Tier</h2>

                    <form onSubmit={handleAddNewTier} className="add-tier-form">
                        <label>
                            Title:
                            <input
                                type="text"
                                name="title"
                                value={addNewTier.title}
                                onChange={handleAddNewTierChange}
                                required
                            />
                        </label>
                        <label>
                            Description:
                            <textarea
                                name="tier_description"
                                value={addNewTier.tier_description}
                                onChange={handleAddNewTierChange}
                                required
                            />
                        </label>
                        <label>
                            Price:
                            <input
                                type="text"
                                name="price"
                                value={addNewTier.price}
                                onChange={handleAddNewTierChange}
                                required
                            />
                        </label>
                        <label>
                            Level Number:
                            <input
                                type="number"
                                name="level_number"
                                value={addNewTier.level_number}
                                onChange={handleAddNewTierChange}
                                required
                            />
                        </label>
                        <label>
                            Max Todos Per Day:
                            <input
                                type="number"
                                name="max_todos_per_day"
                                value={addNewTier.max_todos_per_day}
                                onChange={handleAddNewTierChange}
                                required
                            />
                        </label>
                        <label>
                            Max Custom Habits:
                            <input
                                type="number"
                                name="max_custom_habits"
                                value={addNewTier.max_custom_habits}
                                onChange={handleAddNewTierChange}
                                required
                            />
                        </label>
                        <label>
                            Max Future Days:
                            <input
                                type="number"
                                name="max_future_days"
                                value={addNewTier.max_future_days}
                                onChange={handleAddNewTierChange}
                                required
                            />
                        </label>

                        <div className="add-tier-form-actions">
                            <button type="submit">Save</button>
                            <button type="button" onClick={handleCancelAddNewTier}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>

    );
};

export default AddNewTierForm;