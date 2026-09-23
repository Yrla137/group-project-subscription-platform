import { useAuth } from "../hooks/useAuth";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LoginPage = () => {

  // State variables //
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuthContext();
  const { error, isLoading, loginUser } = useAuth();
  const navigate = useNavigate();

  // Handle form submission //
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await loginUser({email, password});

      const loginSuccess = login(data);

      if (loginSuccess) {
        console.log("Login successful");
        navigate("/");
      }

    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <h1 className="login-title">Login</h1>
        
        <form className="login-form" onSubmit={handleSubmit}>

          <div className="login-field">
            <label className="login-label" htmlFor="email">Email</label>

            <input
              id="email"
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>

            <input
              id="password"
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required/>
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
