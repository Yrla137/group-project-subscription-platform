import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import type { RegisterUser } from "../types/AuthTypes";
import { useNavigate, Link } from "react-router-dom";
import logo_pic from "../assets/logo_pic.png";
import "./RegisterPage.css";
import Spinner from "../components/Spinner";

const RegisterPage = () => {

  // State variables //
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    const { error, isLoading, registerUser } = useAuth();
    const navigate = useNavigate();

  // Handle form submission //
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {

        const registerData: RegisterUser = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password
        };

        await registerUser(registerData);

        navigate("/login");

    } catch (error) {
      console.error("Register error:", error);

    }
  };

   return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header-brand">
          <div className="register-logo-circle">
            <Link to="/" className="logo-container">
              <div className="logo-icon"><img src={logo_pic} alt="Lifesync-logo" /></div>
            </Link>
          </div>
          
          <div className="register-logo-text-group">
            <h1 className="register-main-title">LifeSync</h1>
            <span className="register-subtitle">PLANNER</span>
          </div>

          <p className="register-title">Create an account to get started</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>

          <div className="register-field">
            <label className="register-label" htmlFor="first-name">
              First name
            </label>

            <input
              id="first-name"
              className="register-input"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required/>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="last-name">
              Last name
            </label>

            <input
              id="last-name"
              className="register-input"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required/>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              className="register-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              className="register-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required/>
          </div>

          {error && (
            <p className="register-error">
              {error}
            </p>
          )}

          <button
              className={`register-button ${isLoading ? "register-button-loading" : ""}`}
              type="submit"
              disabled={isLoading}>
              {isLoading ? <Spinner /> : "Create account"}
          </button>

        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login" className="register-link">Log in here</Link></p>

          <p><Link to="/" className="register-link">Go Back to start</Link></p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;