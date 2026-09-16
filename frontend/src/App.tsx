import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import SeminarsPage from "./pages/SeminarsPage";
import HabitsPage from "./pages/HabitsPage";
import MembershipPage from "./pages/MembershipPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="seminars" element={<SeminarsPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="membership" element={<MembershipPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;