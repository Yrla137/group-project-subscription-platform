import { useState, useEffect } from 'react'
import { useTiers } from '../hooks/useTiers';
import { useUsers } from '../hooks/useUsers';
import { useNavigate } from "react-router-dom";
import { useAuthContext } from '../context/AuthContext';
import type { UserWithTier } from "../types/UserType";

const TiersPage = () => {

  const { tiers, error, isLoading, fetchTiers } = useTiers();

  const { loading: authLoading } = useAuthContext();

  const [loggedInUser, setLoggedInUser] = useState<UserWithTier | null>(null);
  const { fetchUserProfile } = useUsers();

  const navigate = useNavigate();

  // Fetch all tiers when the component mounts
  useEffect(() => {
    const getTiersInfo = async () => {

      try {

        if (authLoading === false) {
          await fetchTiers();
          const userData = await fetchUserProfile();

        setLoggedInUser(userData);
        }
        
      } catch (error) {
        console.error("Error fetching tiers:", error);
      }
    };

    getTiersInfo();
  }, [fetchTiers, fetchUserProfile, authLoading]);

  // Function to navigate to checkout page with selected tier ID
  const handleSelectTier = (tierId: number) => {
    navigate(`/checkout`, { state: { tierId } });
  };

  return (
    <div>
      <h1>Membership Tiers</h1>

      {isLoading && <p>Loading tiers...</p>}
      {error && <p>Error: {error}</p>}

      <div className="tiers-container">
        {tiers.map((tier) => (
          <div key={tier.id} className={`tier-container ${loggedInUser?.current_tier_id === tier.id ? 'current-tier' : ''}`}>
            <h2>{tier.title}</h2>
            <p>{tier.tier_description}</p>
            <p>Level: {tier.level_number}</p>
            <p>Price: ${tier.price}</p>
            {loggedInUser?.current_tier_id === tier.id ? (
              <p className="current-tier-label">Current Tier</p>
            ) : (
              <button onClick={() => handleSelectTier(tier.id)}>Select Tier</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TiersPage;
