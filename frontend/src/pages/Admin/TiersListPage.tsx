import { useEffect, useState } from "react";
import { useTiers } from "../../hooks/useTiers";
import type { Tier, CreateTier, NewTierFormData, UpdateTier } from "../../types/TierType";
import { Settings } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import AddNewTierForm from "../../components/Admin/AddNewTierForm";

const TiersList = () => {

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
        <div>
            <h1>Manage Tiers</h1>

            {tiersError && <p>Error: {tiersError}</p>}

            {isTiersLoading ? (
                <p>Loading tiers...</p>
            ) : (
                <div>
                    {tiers.map((tier) => (
                        <div key={tier.id}>
                            <h2>{tier.title}</h2>

                            <p>{tier.tier_description}</p>

                            <p>Price: {tier.price}</p>
                            <p>Level: {tier.level_number}</p>
                            <p>Max todos per day: {tier.max_todos_per_day}</p>
                            <p>Max custom habits: {tier.max_custom_habits}</p>
                            <p>Max future days: {tier.max_future_days}</p>

                            <button
                                aria-label="Edit tier"
                                onClick={() => handleEditTier(tier)}>
                              <Settings/>
                            </button>
                            {editing && selectedTier === tier.id && (
                                <form onSubmit={handleUpdateTier}>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editForm.title}
                                        onChange={handleEditTierChange}
                                        placeholder="Title"
                                        required
                                    />
                                    <textarea
                                        name="tier_description"
                                        value={editForm.tier_description}
                                        onChange={handleEditTierChange}
                                        placeholder="Description"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="price"
                                        value={editForm.price}
                                        onChange={handleEditTierChange}
                                        placeholder="Price"
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="level_number"
                                        value={editForm.level_number}
                                        onChange={handleEditTierChange}
                                        placeholder="Level Number"
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="max_todos_per_day"
                                        value={editForm.max_todos_per_day}
                                        onChange={handleEditTierChange}
                                        placeholder="Max Todos Per Day"
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="max_custom_habits"
                                        value={editForm.max_custom_habits}
                                        onChange={handleEditTierChange}
                                        placeholder="Max Custom Habits"
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="max_future_days"
                                        value={editForm.max_future_days}
                                        onChange={handleEditTierChange}
                                        placeholder="Max Future Days"
                                        required
                                    />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={handleCancelEdit}>Cancel</button>
                                </form>
                            )}
                        </div>
                    ))}

                    <button aria-label="Add New Tier" onClick={handleShowTierForm}>
                        +
                    </button>
                </div>
            )}

            <AddNewTierForm
                showNewTierForm={showNewTierForm}
                handleAddNewTier={handleAddNewTier}
                handleAddNewTierChange={handleAddNewTierChange}
                addNewTier={addNewTier}
                handleCancelAddNewTier={handleCancelAddNewTier}
            />

            <div className="back-to-admin-link">
              <Link to="/admin">Back to Admin Profile</Link>
            </div>
        </div>
    );
}

export default TiersList;
