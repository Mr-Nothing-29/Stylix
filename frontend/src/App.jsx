import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Customize from './pages/Customize';
import Tailors from './pages/Tailors';
import TailorProfile from './pages/TailorProfile';
import MyDesigns from './pages/MyDesigns';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Payment from './pages/Payment';
import LeaveReview from './pages/LeaveReview';
import TailorDashboard from './pages/TailorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Welcome from './pages/Welcome';
import Recommendations from './pages/Recommendations';
import Measurements from './pages/Measurements';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/tailors" element={<Tailors />} />
          <Route path="/tailors/:id" element={<TailorProfile />} />
          <Route path="/designs" element={<MyDesigns />} />
          <Route path="/orders/new/:designId" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/pay" element={<Payment />} />
          <Route path="/orders/:id/review" element={<LeaveReview />} />
          <Route path="/tailor-dashboard" element={<TailorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
