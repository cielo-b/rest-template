import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ParkingSlots from "./pages/admin/ParkingSlots";
import SlotRequests from "./pages/admin/SlotRequests";
import Users from "./pages/admin/Users";
import Vehicles from "./pages/admin/Vehicles";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="requests" element={<SlotRequests />} />
          <Route path="parking-slots" element={<ParkingSlots />} />
          <Route path="users" element={<Users />} />
          <Route path="vehicles" element={<Vehicles />} />
          {/* 
          <Route path="settings" element={<Settings />} />  */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
