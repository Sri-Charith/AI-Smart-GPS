import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminSignup from './pages/Admin/AdminSignup';
import AdminDashboard from './pages/Admin/AdminDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import HODDashboard from './pages/HOD/HODDashboard';
import GuardDashboard from './pages/Guard/GuardDashboard';
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
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

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
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department/dashboard"
          element={
            <ProtectedRoute role="department">
              <HODDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guard/dashboard"
          element={
            <ProtectedRoute role="guard">
              <GuardDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
