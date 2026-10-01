import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePayments } from '../hooks/usePayments';
import type { Tier } from '../types/TierType';
import { useTiers } from '../hooks/useTiers';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import "./CheckoutPage.css";

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
          navigate('/confirmation', { state: { paymentData, tierDetails: selectedTierDetails } });
      }

    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  return (
    <div className="checkout-page">

      <div className="checkout-header">
        <h1 className="checkout-title">
          Checkout
        </h1>

        <p className="checkout-subtitle">
          Review your membership and enter your payment information.
        </p>
      </div>

      {tierError && (
        <p className="checkout-error">
          Error: {tierError}
        </p>
      )}

      {paymentError && (
        <p className="checkout-error">
          Error: {paymentError}
        </p>
      )}

      {isTierLoading ? (
        <div className="checkout-loading">
          <Spinner />
        </div>
      ) : (
        selectedTierDetails && (
          <section className="checkout-tier-card">

            <div className="checkout-tier-header">
              <div>
                <span className="checkout-section-label">
                    Selected Membership
                </span>

                <h2>
                  {selectedTierDetails.title}
                </h2>
              </div>

              <div className="checkout-tier-price">
                ${selectedTierDetails.price}
              </div>
            </div>

            <div className="checkout-tier-details">
              <div className="checkout-tier-detail">
                <span>Level:</span>
                <strong>
                  {selectedTierDetails.level_number}
                </strong>
              </div>

              <div className="checkout-tier-description">
                <span>Description:</span>
                <p>
                  {selectedTierDetails.tier_description}
                </p>
              </div>
            </div>

          </section>
        )
      )}

      <section className="payment-form-container">

        <div className="payment-form-header">
          <span className="checkout-section-label">
            Secure Payment
          </span>

          <h2>
            Payment Information
          </h2>

          <p>
            Enter your card details to complete your purchase.
          </p>
        </div>

        <form
          className="payment-form"
          onSubmit={handleCreatePayment}>

          <div className="payment-form-field payment-card-number">
            <label htmlFor="card-number">
              Card Number
            </label>

            <input
              id="card-number"
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              required/>
          </div>

          <div className="payment-form-row">

            <div className="payment-form-field">
              <label htmlFor="expiration-date">
                Expiration Date
              </label>

              <input
                id="expiration-date"
                type="text"
                name="expirationDate"
                placeholder="MM/YY"
                required/>
            </div>

            <div className="payment-form-field">
              <label htmlFor="cvv">
                CVV
              </label>

              <input
                id="cvv"
                type="text"
                name="cvv"
                placeholder="123"
                required/>
            </div>

          </div>

          <button
            className="submit-payment-form-button"
            type="submit"
            disabled={isPaymentLoading || selectedTier === null}>
            {isPaymentLoading ? <Spinner /> : "Pay Now"}
          </button>

        </form>

      </section>

      <div className="tiers-navigation">
        <Link to="/tiers" className="tiers-nav-link">
          ← Back to Tiers
        </Link>
      </div>

    </div>
  )
};

export default CheckoutPage;