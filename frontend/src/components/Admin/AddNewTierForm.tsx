import type { NewTierFormData } from "../../types/TierType";
import Spinner from "../Spinner";
import "./AddNewTierForm.css";
interface AddNewTierFormProps {
    showNewTierForm: boolean;
    isLoading: boolean;
    handleAddNewTier: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    handleAddNewTierChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    addNewTier: NewTierFormData;
    handleCancelAddNewTier: () => void;
}

const AddNewTierForm = ({
    showNewTierForm,
    isLoading,
    handleAddNewTier,
    handleAddNewTierChange,
    addNewTier,
    handleCancelAddNewTier
}: AddNewTierFormProps) => {

    return (

        <div>

            {showNewTierForm && (

                <div className="add-tier-form-container">

                    <div className="add-tier-form-header">
                        <h2>Add New Tier</h2>
                        <p>
                            Create a new membership tier and set its limits.
                        </p>
                    </div>

                    <form
                        onSubmit={handleAddNewTier}
                        className="add-tier-form">

                        <div className="tier-form-field">
                            <label htmlFor="add-tier-title">
                                Title
                            </label>
                            <input
                                id="add-tier-title"
                                type="text"
                                name="title"
                                value={addNewTier.title}
                                onChange={handleAddNewTierChange}
                                placeholder="Title"
                                required/>
                        </div>

                        <div className="tier-form-field">
                            <label htmlFor="add-tier-description">
                                Description
                            </label>
                            <textarea
                                id="add-tier-description"
                                name="tier_description"
                                value={addNewTier.tier_description}
                                onChange={handleAddNewTierChange}
                                placeholder="Description"
                                required/>
                        </div>

                        <div className="tier-form-grid">

                            <div className="tier-form-field">
                                <label htmlFor="add-tier-price">
                                    Price
                                </label>
                                <input
                                    id="add-tier-price"
                                    type="text"
                                    name="price"
                                    value={addNewTier.price}
                                    onChange={handleAddNewTierChange}
                                    placeholder="Price"
                                    required/>
                            </div>

                            <div className="tier-form-field">
                                <label htmlFor="add-tier-level">
                                    Level
                                </label>
                                <input
                                    id="add-tier-level"
                                    type="number"
                                    name="level_number"
                                    value={addNewTier.level_number}
                                    onChange={handleAddNewTierChange}
                                    placeholder="Level"
                                    required/>
                            </div>

                            <div className="tier-form-field">
                                <label htmlFor="add-tier-todos">
                                    Max Todos Per Day
                                </label>
                                <input
                                    id="add-tier-todos"
                                    type="number"
                                    name="max_todos_per_day"
                                    value={addNewTier.max_todos_per_day}
                                    onChange={handleAddNewTierChange}
                                    placeholder="Max Todos"
                                    required/>
                            </div>

                            <div className="tier-form-field">
                                <label htmlFor="add-tier-habits">
                                    Max Custom Habits
                                </label>
                                <input
                                    id="add-tier-habits"
                                    type="number"
                                    name="max_custom_habits"
                                    value={addNewTier.max_custom_habits}
                                    onChange={handleAddNewTierChange}
                                    placeholder="Max Habits"
                                    required/>
                            </div>

                            <div className="tier-form-field">
                                <label htmlFor="add-tier-future">
                                    Max Future Days
                                </label>
                                <input
                                    id="add-tier-future"
                                    type="number"
                                    name="max_future_days"
                                    value={addNewTier.max_future_days}
                                    onChange={handleAddNewTierChange}
                                    placeholder="Future Days"
                                    required/>
                            </div>

                        </div>

                        <div className="add-tier-form-actions">

                            <button
                                type="button"
                                className="tier-cancel-button"
                                onClick={handleCancelAddNewTier}
                                disabled={isLoading}>
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="tier-save-button"
                                disabled={isLoading}>
                                {isLoading ? (
                                    <Spinner />
                                ) : (
                                    "Create Tier"
                                )}
                            </button>

                        </div>

                    </form>

                </div>
            )}

        </div>
    )

};

export default AddNewTierForm;