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
import TiersListPage from "./pages/Admin/TiersListPage";

import CheckoutPage from "./pages/CheckoutPage";
import PaymentsPage from "./pages/PaymentsPage";

import ProtectedRoute from "./components/Routes/ProtectedRoute";
import AdminRoute from "./components/Routes/AdminRoute";


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
            <Route path="checkout" element={ <ProtectedRoute><CheckoutPage/></ProtectedRoute> } />
            <Route path="payments-page" element={ <ProtectedRoute><PaymentsPage/></ProtectedRoute> } />

            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="profile" element={ <ProtectedRoute><ProfilePage/></ProtectedRoute> } />

            <Route path="admin" element={ <AdminRoute><AdminPage/></AdminRoute> } />
            <Route path="admin/users" element={ <AdminRoute><UserListPage/></AdminRoute> } />
            <Route path="admin/user-payments/:userId" element={ <AdminRoute><UserPaymentsPage /></AdminRoute> } />
            <Route path="admin/tiers" element={ <AdminRoute><TiersListPage /></AdminRoute> } />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
