import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import SeminarsPage from "./pages/SeminarsPage";
import ManageSeminarsPage from "./pages/ManageSeminarsPage";
import HabitsPage from "./pages/HabitsPage";
import MembershipPage from "./pages/MembershipPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminPage from "./pages/Admin/AdminPage";
import PaymentsHistoryList from "./pages/Admin/PaymentsHistoryList";
import TiersList from "./pages/Admin/TiersList";
import UsersList from "./pages/Admin/UsersList";
import CheckoutPage from "./pages/CheckoutPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="seminars" element={<SeminarsPage />} />
          <Route path="seminars/manage" element={<ManageSeminarsPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="membership" element={<MembershipPage />} />

          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/payments-history" element={<PaymentsHistoryList />} />
          <Route path="admin/tiers" element={<TiersList />} />
          <Route path="admin/users" element={<UsersList />} />

          <Route path="checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;