import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import SeminarsPage from "./pages/SeminarsPage";
import ManageSeminarsPage from "./pages/ManageSeminarsPage";
import HabitsPage from "./pages/HabitsPage";
import TiersPage from "./pages/TiersPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

import AdminPage from "./pages/Admin/AdminPage";
import UserListPage from "./pages/Admin/UserListPage";
import UserPaymentsPage from "./pages/Admin/UserPaymentsPage";
import TiersList from "./pages/Admin/TiersList";
import UsersList from "./pages/Admin/UserListPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentsPage from "./pages/PaymentsPage";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="seminars" element={<SeminarsPage />} />
            <Route path="seminars/manage" element={<ManageSeminarsPage />} />
            <Route path="habits" element={<HabitsPage />} />
            
            <Route path="tiers" element={<TiersPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="payments-page" element={<PaymentsPage />} />

            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="profile" element={<ProfilePage />} />

            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/users" element={<UserListPage />} />
            <Route path="admin/user-payments" element={<UserPaymentsPage />} />
            <Route path="admin/tiers" element={<TiersList />} />
            <Route path="admin/users" element={<UsersList />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
