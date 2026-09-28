import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";

const ConfirmationPage = () => {

    const location = useLocation();
    const { paymentData, tierDetails } = location.state || {};

  return (
    <div>
        <CircleCheck className="payment-confirmation-icon" />

        <h2>Payment Confirmation</h2>
        <p>Your payment has been successfully processed.</p>
        <br />
        <p>You are now a level higher!</p>

        {paymentData ? (
            <div>
                <p>Amount: {paymentData.amount}</p>
                <p>Payment Date: {new Date(paymentData.payment_date).toLocaleString()}</p>
                {tierDetails && (
                    <div>
                        <h3>Tier Details</h3>
                        <p>Title: {tierDetails.title}</p>
                        <p>Level: {tierDetails.level_number}</p>
                        <p>Description: {tierDetails.tier_description}</p>
                    </div>
                )}
            </div>
        ) : (
            <p>No payment data available.</p>
        )}

        <Link to="/" className="back-to-tiers-link">Back to dashboard</Link>

    </div>
  )
}

export default ConfirmationPage