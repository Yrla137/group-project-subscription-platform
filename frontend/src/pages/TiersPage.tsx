import { useState, useEffect } from 'react'
import { useTiers } from '../hooks/useTiers';
import { useUsers } from '../hooks/useUsers';
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from '../context/AuthContext';
import type { UserWithTier } from "../types/UserType";
import "./TiersPage.css";

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
    <div className="tiers-page-wrapper">
      <div className="tiers-header-section">
        <h3>Membership Tiers</h3>
        <p>Upgrade your plan to unlock more features and elevate your workflow.</p>
        <p>Higher tiers unlock advanced planning tools and exclusive live sessions. Check out the upcoming seminars <Link to="/seminars" className="tiers-link">here</Link>.</p>
      </div>

      {tierError && <p className="tiers-error">Error: {tierError}</p>}
      {userDataError && <p className="tiers-error">Error: {userDataError}</p>}

      <div className="tiers-container">
        {isUserDataLoading || isTierLoading ? (
          <div className="tiers-loading">Loading membership options...</div>
        ) : (
          tiers.map((tier) => (
            <div 
              key={tier.id} 
              className={`tier-card ${loggedInUser?.current_tier_id === tier.id ? 'current-tier' : ''}`}>
                
                <div className="tier-card-header">
                  <h2>{tier.title}</h2>
                  <span className="tier-level-badge">Level {tier.level_number}</span>
                </div>

              <p className="tier-description">{tier.tier_description}</p>

              <ul className="tier-features-list">
                  <li>✔️ Max {tier.max_todos_per_day ?? tier.max_todos_per_day} tasks a dag</li>
                  <li>✔️ Plan {tier.max_future_days} days in the calendar</li>
                  <li>✔️ Create {tier.max_custom_habits} customized habits</li>
                </ul>

              <div className="tier-price-box">
                <p className="tier-price">Price: ${tier.price}</p>
                </div>
              
              <div className="tier-action-container">
                {loggedInUser === null ? (
                  <p className="tier-status-text">Unable to determine current tier.</p>
                ) : loggedInUser.current_tier_id === tier.id ? (
                  <p className="current-tier-label">Current Tier</p>
                ) : (
                  <button className="primary-btn tier-select-button" 
                  onClick={() => handleSelectTier(tier.id)}>
                  Uppgrade to Tier</button>
                )}
              </div>
            </div>
        ))
        )}
      </div>
    </div>
  );
}

export default TiersPage;
