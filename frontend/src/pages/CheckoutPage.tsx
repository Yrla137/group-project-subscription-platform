import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePayments } from '../hooks/usePayments';
import type { Tier } from '../types/TierType';
import { useTiers } from '../hooks/useTiers';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const CheckoutPage = () => {

  const location = useLocation();

  const navigate = useNavigate();

  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedTierDetails, setSelectedTierDetails] = useState<Tier | null>(null);

  const { loading: authLoading } = useAuthContext();
  const { tierId } = location.state || {};
  const { createPayment, error: paymentError, isLoading: isPaymentLoading } = usePayments();
  const { error: tierError, isLoading: isTierLoading, fetchTierById } = useTiers();

  // Fetch tier details when the component mounts or when tierId changes
  useEffect(() => {

    const getTierDetails = async () => {

      if (!authLoading) 
        {
          if (tierId != null) {
            setSelectedTier(tierId);

            try {

              const tierDetails = await fetchTierById(tierId);
              setSelectedTierDetails(tierDetails)

            } catch (error) {
              console.error("Error fetching tier details:", error);
            }
          } else {
            navigate('/tiers');
          }
        }
    };

    getTierDetails();
  }, [tierId, fetchTierById, navigate, authLoading]);

  // Function to handle payment creation
  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (selectedTier !== null) {

        const paymentData = await createPayment({ tier_id: selectedTier });

          // Redirect to the payment confirmation page or display a success message
          navigate('/payments-page', { state: { paymentData } });
      }

    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  return (

    <div>

      <h1>Checkout Page</h1>

      {tierError && <p>Error: {tierError}</p>}
      {paymentError && <p>Error: {paymentError}</p>}

      {isPaymentLoading && <p>Loading payment information...</p>}

        {isTierLoading ? (
          <p>Loading tier details...</p>
        ) : (
          selectedTierDetails && (
            <div className="tier-details-container">
              <h2>Selected Tier Details</h2>
              <p>Title: {selectedTierDetails.title}</p>
              <p>Level: {selectedTierDetails.level_number}</p>
              <p>Description: {selectedTierDetails.tier_description}</p>
              <p>Price: ${selectedTierDetails.price}</p>
            </div>
          )
        )}

        <div className="paymment-form-container">
          <h3>Payment Information</h3>

          <form className="payment-form" onSubmit={handleCreatePayment}>

            <label>
              Card Number:
              <input type="text" name="cardNumber" placeholder="1234 5678 9012 3456" required />
            </label>
            <label>
              Expiration Date:
              <input type="text" name="expirationDate" placeholder="MM/YY" required />
            </label>
            <label>
              CVV:
              <input type="text" name="cvv" placeholder="123" required />
            </label>

            <button className="submit-payment-form-button" type="submit" disabled={isPaymentLoading || selectedTier === null}>
              {isPaymentLoading ? 'Processing payment details...' : 'Pay Now'}
            </button>

          </form>
        </div>

      <div className="tiers-navigation">
        <Link to="/tiers" className="tiers-nav-link">
          Back to Tiers
        </Link>
      </div>
      
    </div>
  );
}

export default CheckoutPage;