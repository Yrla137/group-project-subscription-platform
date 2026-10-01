import { useEffect, useState } from "react";
import { useTiers } from "../../hooks/useTiers";
import type { Tier, CreateTier, NewTierFormData, UpdateTier } from "../../types/TierType";
import { Settings } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import AddNewTierForm from "../../components/Admin/AddNewTierForm";
import Spinner from "../../components/Spinner";
import "./TiersListPage.css";

const TiersListPage = () => {

    const [selectedTier, setSelectedTier] = useState<number | null>(null);

    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        tier_description: "",
        price: "",
        level_number: "",
        max_todos_per_day: "",
        max_custom_habits: "",
        max_future_days: ""
    });

    const [showNewTierForm, setShowNewTierForm] = useState(false);
    const [addNewTier, setAddNewTier] = useState<NewTierFormData>({
        title: "",
        tier_description: "",
        price: "" ,
        level_number: "",
        max_todos_per_day: "",
        max_custom_habits: "",
        max_future_days: ""
    });

    const {
        error: tiersError,
        isLoading: isTiersLoading,
        tiers,
        fetchTiers,
        createTier,
        updateTier
    } = useTiers();

    const { loading: isAuthLoading } = useAuthContext();

    useEffect(() => {
        const getTiers = async () => {

          if (!isAuthLoading) {
            try {
                await fetchTiers();
            } catch (error) {
                console.error("Error fetching tiers:", error);
            }
          }
        };

        getTiers();

    }, [fetchTiers, isAuthLoading]);

    // Function to reset the tier form //
    const resetNewTierForm = () => {
    setAddNewTier({
        title: "",
        tier_description: "",
        price: "",
        level_number: "",
        max_todos_per_day: "",
        max_custom_habits: "",
        max_future_days: ""
    });
};

    // EDIT TIER FUNCTIONALITY //
    // Function to handle edit tier //
    const handleEditTier = (tier: Tier) => {
        setSelectedTier(tier.id);

        setEditForm({
            title: tier.title,
            tier_description: tier.tier_description,
            price: tier.price.toString(),
            level_number: tier.level_number.toString(),
            max_todos_per_day: tier.max_todos_per_day.toString(),
            max_custom_habits: tier.max_custom_habits.toString(),
            max_future_days: tier.max_future_days.toString()
        });
        setEditing(true);
    };

    // Function to handle changes in the edit form //
    const handleEditTierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    }

    // Function to handle tier update submission //
    const handleUpdateTier = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Preparing the updated tier data for submission to match the UpdateTier type //
        const updatedTierData: UpdateTier = {
            title: editForm.title,
            tier_description: editForm.tier_description,
            price: parseFloat(editForm.price),
            level_number: parseInt(editForm.level_number, 10),
            max_todos_per_day: parseInt(editForm.max_todos_per_day, 10),
            max_custom_habits: parseInt(editForm.max_custom_habits, 10),
            max_future_days: parseInt(editForm.max_future_days, 10)
        };

        try {
          if (selectedTier === null) {
            throw new Error("No tier selected for update");
          }

          await updateTier(selectedTier, updatedTierData);
          setSelectedTier(null);
          setEditing(false);

        } catch (error) {
          console.error("Error updating tier:", error);
        }
    };

    // Function to cancel editing //
    const handleCancelEdit = () => {
        setSelectedTier(null);
        setEditing(false);
    };

    // ADD NEW TIER FUNCTIONALITY //
    // Function to show the new tier form //
    const handleShowTierForm = () => {
        setShowNewTierForm(true);
    };

    // Function for new tier form input changes //
    const handleAddNewTierChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          setAddNewTier({
              ...addNewTier,
              [e.target.name]: e.target.value
          });
    };

    // Function to handle new tier form submission //
    const handleAddNewTier = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
          const newTierData: CreateTier = {
              title: addNewTier.title,
              tier_description: addNewTier.tier_description,
              price: parseFloat(addNewTier.price),
              level_number: parseInt(addNewTier.level_number, 10),
              max_todos_per_day: parseInt(addNewTier.max_todos_per_day, 10),
              max_custom_habits: parseInt(addNewTier.max_custom_habits, 10),
              max_future_days: parseInt(addNewTier.max_future_days, 10)
          };

          await createTier(newTierData);
          setShowNewTierForm(false);
          resetNewTierForm();

        } catch (error) {
          console.error("Error creating new tier:", error);
        }

    };

    // Function to cancel adding a new tier //
    const handleCancelAddNewTier = () => {
        setShowNewTierForm(false);
        resetNewTierForm();
    }

    return (
        <div className="tiers-page">

            <section className="tiers-header">
                <div className="tiers-header-content">
                    <h1 className="tiers-title">
                        Manage Tiers
                    </h1>

                    <p className="tiers-subtitle">
                        Create and manage subscription tiers and their limits.
                    </p>
                </div>
            </section>

            <main className="tiers-content">

                {tiersError && (
                    <div className="tiers-error">
                        <p>{tiersError}</p>
                    </div>
                )}

                {isTiersLoading ? (
                    <div className="tiers-loading">
                        <Spinner />
                    </div>
                ) : (
                    <section className="tiers-section">

                        <div className="tiers-section-header">
                            <div>
                                <h2>Subscription Tiers</h2>

                                <p>
                                    {tiers.length}{" "}
                                    {tiers.length === 1 ? "tier" : "tiers"}{" "}
                                    available
                                </p>
                            </div>

                            <button
                                className="add-tier-button"
                                aria-label="Add New Tier"
                                onClick={handleShowTierForm}>
                                +
                            </button>
                        </div>

                                        <div className="add-tier-form-wrapper">
                    <AddNewTierForm
                        showNewTierForm={showNewTierForm}
                        isLoading={isTiersLoading}
                        handleAddNewTier={handleAddNewTier}
                        handleAddNewTierChange={handleAddNewTierChange}
                        addNewTier={addNewTier}
                        handleCancelAddNewTier={handleCancelAddNewTier}/>
                </div>

                        <div className="tiers-list">

                            {tiers.map((tier) => (
                                <article
                                    className="tier-card"
                                    key={tier.id}>

                                    <div className="tier-card-header">

                                        <div>
                                            <h2>{tier.title}</h2>

                                            <span className="tier-level">
                                                Level {tier.level_number}
                                            </span>
                                        </div>

                                        <button
                                            className="tier-edit-button"
                                            aria-label="Edit tier"
                                            onClick={() => handleEditTier(tier)}>
                                            <Settings
                                                size={25}
                                                strokeWidth={2.2}/>
                                        </button>

                                    </div>

                                    <p className="tier-description">
                                        {tier.tier_description}
                                    </p>

                                    <div className="tier-price">
                                        <span className="tier-price-label">
                                            Price
                                        </span>

                                        <span className="tier-price-value">
                                            {tier.price}
                                        </span>
                                    </div>

                                    <div className="tier-limits">

                                        <div className="tier-limit">
                                            <span>Todos per day</span>
                                            <strong>
                                                {tier.max_todos_per_day}
                                            </strong>
                                        </div>

                                        <div className="tier-limit">
                                            <span>Custom habits</span>
                                            <strong>
                                                {tier.max_custom_habits}
                                            </strong>
                                        </div>

                                        <div className="tier-limit">
                                            <span>Future days</span>
                                            <strong>
                                                {tier.max_future_days}
                                            </strong>
                                        </div>

                                    </div>

                                    {editing && selectedTier === tier.id && (
                                        <form
                                            className="edit-tier-form"
                                            onSubmit={handleUpdateTier}>

                                            <div className="edit-tier-form-header">
                                                <h3>Edit Tier</h3>
                                                <p>
                                                    Update the information and limits
                                                    for this tier.
                                                </p>
                                            </div>

                                            <div className="tier-form-field">
                                                <label htmlFor={`title-${tier.id}`}>
                                                    Title
                                                </label>

                                                <input
                                                    id={`title-${tier.id}`}
                                                    type="text"
                                                    name="title"
                                                    value={editForm.title}
                                                    onChange={handleEditTierChange}
                                                    placeholder="Title"
                                                    required/>
                                            </div>

                                            <div className="tier-form-field">
                                                <label htmlFor={`description-${tier.id}`}>
                                                    Description
                                                </label>

                                                <textarea
                                                    id={`description-${tier.id}`}
                                                    name="tier_description"
                                                    value={editForm.tier_description}
                                                    onChange={handleEditTierChange}
                                                    placeholder="Description"
                                                    required/>
                                            </div>

                                            <div className="tier-form-grid">

                                                <div className="tier-form-field">
                                                    <label htmlFor={`price-${tier.id}`}>
                                                        Price
                                                    </label>

                                                    <input
                                                        id={`price-${tier.id}`}
                                                        type="text"
                                                        name="price"
                                                        value={editForm.price}
                                                        onChange={handleEditTierChange}
                                                        placeholder="Price"
                                                        required/>
                                                </div>

                                                <div className="tier-form-field">
                                                    <label htmlFor={`level-${tier.id}`}>
                                                        Level
                                                    </label>

                                                    <input
                                                        id={`level-${tier.id}`}
                                                        type="number"
                                                        name="level_number"
                                                        value={editForm.level_number}
                                                        onChange={handleEditTierChange}
                                                        placeholder="Level"
                                                        required/>
                                                </div>

                                                <div className="tier-form-field">
                                                    <label htmlFor={`todos-${tier.id}`}>
                                                        Max Todos Per Day
                                                    </label>

                                                    <input
                                                        id={`todos-${tier.id}`}
                                                        type="number"
                                                        name="max_todos_per_day"
                                                        value={editForm.max_todos_per_day}
                                                        onChange={handleEditTierChange}
                                                        placeholder="Max Todos"
                                                        required/>
                                                </div>

                                                <div className="tier-form-field">
                                                    <label htmlFor={`habits-${tier.id}`}>
                                                        Max Custom Habits
                                                    </label>

                                                    <input
                                                        id={`habits-${tier.id}`}
                                                        type="number"
                                                        name="max_custom_habits"
                                                        value={editForm.max_custom_habits}
                                                        onChange={handleEditTierChange}
                                                        placeholder="Max Habits"
                                                        required/>
                                                </div>

                                                <div className="tier-form-field">
                                                    <label htmlFor={`future-${tier.id}`}>
                                                        Max Future Days
                                                    </label>

                                                    <input
                                                        id={`future-${tier.id}`}
                                                        type="number"
                                                        name="max_future_days"
                                                        value={editForm.max_future_days}
                                                        onChange={handleEditTierChange}
                                                        placeholder="Future Days"
                                                        required/>
                                                </div>

                                            </div>

                                            <div className="tier-form-actions">

                                                <button
                                                    type="button"
                                                    className="tier-cancel-button"
                                                    onClick={handleCancelEdit}
                                                    disabled={isTiersLoading}>
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="tier-save-button"
                                                    disabled={isTiersLoading}>
                                                    {isTiersLoading ? (
                                                        <Spinner />
                                                    ) : (
                                                        "Save Changes"
                                                    )}
                                                </button>

                                            </div>

                                        </form>
                                    )}

                                </article>
                            ))}

                        </div>

                    </section>
                )}



                <div className="back-to-admin-link">
                    <Link to="/admin">
                        Back to Admin Panel
                    </Link>
                </div>

            </main>

        </div>
    )
};

export default TiersListPage;