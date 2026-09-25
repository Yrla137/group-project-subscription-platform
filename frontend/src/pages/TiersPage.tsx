import { useState, useEffect } from 'react'
import { useTiers } from '../hooks/useTiers';
import { useUsers } from '../hooks/useUsers';
import { useNavigate } from "react-router-dom";
import { useAuthContext } from '../context/AuthContext';
import type { UserWithTier } from "../types/UserType";

const TiersPage = () => {

  const [loggedInUser, setLoggedInUser] = useState<UserWithTier | null>(null);

  const { tiers, error: tierError, isLoading: isTierLoading, fetchTiers } = useTiers();
  const { error: userDataError, isLoading: isUserDataLoading, fetchUserProfile } = useUsers();

  const { loading: authLoading } = useAuthContext();

  const navigate = useNavigate();

  // Fetch all tiers when the component mounts
  useEffect(() => {
    const getTiersInfo = async () => {

      try {

        if (!authLoading) {

          const [, userResult] = await Promise.allSettled([
            fetchTiers(),
            fetchUserProfile()
          ]);
          // Promise.allSettled returns the result even if one of the promises fails while Promise.all would reject immediately if any of the promises fail.
          // Checks after the promises are settled to see if the userResult is fulfilled before setting the loggedInUser state.
          if (userResult.status === "fulfilled") {
            setLoggedInUser(userResult.value);
          }
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

      {tierError && <p>Error: {tierError}</p>}

      {userDataError && <p>Error: {userDataError}</p>}

      <div className="tiers-container">
        {isUserDataLoading || isTierLoading ? (
          <p>Loading...</p>
        ) : (
          tiers.map((tier) => (
            <div key={tier.id} className={`tier-container ${loggedInUser?.current_tier_id === tier.id ? 'current-tier' : ''}`}>
              <h2>{tier.title}</h2>
              <p>{tier.tier_description}</p>
              <p>Level: {tier.level_number}</p>
              <p>Price: ${tier.price}</p>
              {loggedInUser === null ? (
                <p>Unable to determine current tier.</p>
              ) : loggedInUser.current_tier_id === tier.id ? (
                <p className="current-tier-label">Current Tier</p>
              ) : (
                <button onClick={() => handleSelectTier(tier.id)}>Select Tier</button>
              )}
            </div>
        ))
        )}
      </div>
    </div>
  );
}

export default TiersPage;
