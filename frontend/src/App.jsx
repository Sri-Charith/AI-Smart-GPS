import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminSignup from './pages/Admin/AdminSignup';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PlaceholderDashboard from './pages/PlaceholderDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, role = 'admin' }) => {
  const token = localStorage.getItem(`${role}Token`);
  if (!token) return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Universal Login (Single Page) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dedicated Admin Signup Only */}
        <Route path="/admin/signup" element={<AdminSignup />} />

        {/* Dashboards */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <PlaceholderDashboard title="Student Dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department/dashboard"
          element={
            <ProtectedRoute role="department">
              <PlaceholderDashboard title="HOD Dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guard/dashboard"
          element={
            <ProtectedRoute role="guard">
              <PlaceholderDashboard title="Security Dashboard" />
            </ProtectedRoute>
          }
        />

        {/* Redirect Root to Portal */}
        <Route path="/" element={<Navigate to="/admin/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
