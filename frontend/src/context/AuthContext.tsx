import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { LoginResponse, AuthPayload } from "../types/AuthTypes";

interface AuthContextType {
    token: string | null;
    user: AuthPayload | null;
    loading: boolean;
    login: (loginData: LoginResponse) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);
// Creates the context object that will hold the authentication state and functions. The initial value is set to null.

export const AuthProvider = ({ children }: AuthProviderProps) => {
    
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthPayload | null>(null);
    const [loading, setLoading] = useState(true);

    // useEffect that checks for saved token
    useEffect(() => {

        try {
            const savedToken = localStorage.getItem("token");

            if (savedToken) {
                const decodedToken = jwtDecode<AuthPayload>(savedToken);

                if (decodedToken.exp * 1000 < Date.now()) {
                    // If the token has expired, remove it from localStorage and reset the state
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                } else {
                setToken(savedToken);
                setUser(decodedToken);
            }
        } 
    } catch (error) {
            console.error("Error decoding token:", error);
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (loginData: LoginResponse) => {

        try {

            const decodedToken = jwtDecode<AuthPayload>(loginData.token);

            if (decodedToken.exp * 1000 < Date.now()) {
                throw new Error("Token has expired");
            }

            // Saves the token value when refreshing browser
            localStorage.setItem("token", loginData.token);

            setToken(loginData.token);

            setUser(decodedToken);

        } catch (error) {
            localStorage.removeItem("token");
            console.error("Error processing token during login:", error);
            setToken(null);
            setUser(null);
        }
    };

    const logout = (): void => {
        setToken(null);
        setUser(null);

        // Removes the token from localStorage
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}