import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import DashboardPage from "./pages/DashboardPage";
import SeminarsPage from "./pages/SeminarsPage";
import SeminarDetailPage from "./pages/SeminarDetailPage";
import HabitsPage from "./pages/HabitsPage";
import TiersPage from "./pages/TiersPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";

import AdminPage from "./pages/Admin/AdminPage";
import UserListPage from "./pages/Admin/UserListPage";
import UserPaymentsPage from "./pages/Admin/UserPaymentsPage";
import TiersListPage from "./pages/Admin/TiersListPage";
import AdminHabitsPage from "./pages/Admin/DefaultHabits";
import ManageSeminars from "./pages/Admin/Seminars";

import CheckoutPage from "./pages/CheckoutPage";
import PaymentsPage from "./pages/PaymentsPage";
import ConfirmationPage from "./pages/ConfirmationPage";

import ProtectedRoute from "./components/Routes/ProtectedRoute";
import AdminRoute from "./components/Routes/AdminRoute";
import StatsPage from "./pages/StatsPage";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="seminars" element={<ProtectedRoute><SeminarsPage /></ProtectedRoute>} />
            <Route path="seminars/:id" element={<ProtectedRoute><SeminarDetailPage /></ProtectedRoute>} />
            <Route path="habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
            <Route path="stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />

            <Route path="tiers" element={<TiersPage />} />
            <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="payments-page" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />


            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="forget-password" element={<ForgetPasswordPage />} />

            <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="admin/users" element={<AdminRoute><UserListPage /></AdminRoute>} />
            <Route path="admin/user-payments/:userId" element={<AdminRoute><UserPaymentsPage /></AdminRoute>} />
            <Route path="admin/tiers" element={<AdminRoute><TiersListPage /></AdminRoute>} />
            <Route path="admin/seminars" element={<AdminRoute><ManageSeminars /></AdminRoute>} />
            <Route path="admin/habits" element={<AdminRoute><AdminHabitsPage /></AdminRoute>} />

          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
