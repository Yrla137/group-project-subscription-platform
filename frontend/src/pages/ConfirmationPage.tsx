import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import "./ConfirmationPage.css";
import { CircleCheck } from "lucide-react";

const ConfirmationPage = () => {

    const location = useLocation();
    const { paymentData, tierDetails } = location.state || {};

    return (
        <div className="confirmation-page">
            <div className="confirmation-container">

                <div className="confirmation-header">

                   <div className="confirmation-icon-container">
                        <span className="sparkle sparkle-one">✦</span>
                        <span className="sparkle sparkle-two">✧</span>
                        <span className="sparkle sparkle-three">✦</span>
                        <span className="sparkle sparkle-four">✧</span>
                        <span className="sparkle sparkle-five">✦</span>
                        <span className="sparkle sparkle-six">✧</span>

                        <CircleCheck className="payment-confirmation-icon" />
                    </div>

                    <h2 className="confirmation-title">
                        Payment Confirmation
                    </h2>

                    <p className="confirmation-message">
                        Your payment has been successfully processed.
                    </p>

                    <p className="confirmation-level-message">
                        You are now a level higher!
                    </p>
                </div>

                {paymentData ? (
                    <div className="payment-details">

                        <p className="payment-detail">
                            <span className="payment-detail-label">Amount:</span>
                            {paymentData.amount}
                        </p>

                        <p className="payment-detail">
                            <span className="payment-detail-label">Payment Date:</span>
                            {new Date(paymentData.payment_date).toLocaleString()}
                        </p>

                        {tierDetails && (
                            <div className="tier-details">

                                <h3 className="tier-details-title">
                                    Tier Details
                                </h3>

                                <p className="tier-detail">
                                    <span className="tier-detail-label">Title:</span>
                                    {tierDetails.title}
                                </p>

                                <p className="tier-detail">
                                    <span className="tier-detail-label">Level:</span>
                                    {tierDetails.level_number}
                                </p>

                                <p className="tier-detail">
                                    <span className="tier-detail-label">Description:</span>
                                    {tierDetails.tier_description}
                                </p>

                            </div>
                        )}

                    </div>
                ) : (
                    <p className="confirmation-no-data">
                        No payment data available.
                    </p>
                )}

                <div className="confirmation-navigation">
                    <Link
                        to="/"
                        className="back-to-dashboard-link"
                    >
                        Back to dashboard
                    </Link>
                </div>

            </div>
        </div>
    )
};

export default ConfirmationPage;