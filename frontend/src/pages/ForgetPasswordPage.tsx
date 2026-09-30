import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgetPasswordPage.css";

const ForgetPasswordPage = () => {

    const [message, setMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");

    // Function for message and form handling
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("If the email exists in our system, a reset link has been sent.");
        setEmail("");

        setTimeout(() => {
            setMessage(null);
        }, 5000);
    };

  return (
      <div className="forget-password-page">
          <div className="forget-password-container">
              <h2 className="forget-password-title">
                  Forget Password
              </h2>

              <p className="forget-password-text">
                  If you have forgotten your password, please enter your email address below and we will send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="forget-password-form">
                  <div className="forget-password-field">
                      <label
                          className="forget-password-label"
                          htmlFor="email"
                      >
                          Email:
                      </label>

                      <input
                          id="email"
                          className="forget-password-input"
                          type="email"
                          placeholder="Email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>

                  <button
                      type="submit"
                      className="forget-password-button"
                  >
                      Send Reset Link
                  </button>
              </form>

              {message && (
                  <p className="forget-password-message">
                      {message}
                  </p>
              )}
          </div>


            <Link to="/login" className="forget-password-link">
                Back to Login
            </Link>
      </div>
  )
};

export default ForgetPasswordPage