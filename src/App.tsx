import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminTempatPkl from './pages/Admin/TempatPkl';
import AdminAbsensi from './pages/Admin/Absensi';
import AdminJurnal from './pages/Admin/Jurnal';
import AdminReports from './pages/Admin/Reports';
import AdminSettings from './pages/Admin/Settings';

// Guru Pages
import GuruDashboard from './pages/Guru/Dashboard';
import GuruTempatPkl from './pages/Guru/TempatPkl';
import GuruAbsensi from './pages/Guru/Absensi';
import GuruJurnal from './pages/Guru/Jurnal';
import GuruReports from './pages/Guru/Reports';

// Siswa Pages
import SiswaDashboard from './pages/Siswa/Dashboard';
import SiswaAbsensi from './pages/Siswa/Absensi';
import SiswaJurnal from './pages/Siswa/Jurnal';

import ProtectedRoute, { AdminRoute, GuruRoute, SiswaRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';

function App() {
  const { token, getProfile } = useAuthStore();
  
  useEffect(() => {
    if (token) {
      getProfile();
    }
  }, [token, getProfile]);
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
        <Route path="/admin/tempat-pkl" element={
          <AdminRoute>
            <AdminTempatPkl />
          </AdminRoute>
        } />
        <Route path="/admin/absensi" element={
          <AdminRoute>
            <AdminAbsensi />
          </AdminRoute>
        } />
        <Route path="/admin/jurnal" element={
          <AdminRoute>
            <AdminJurnal />
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } />
        
        {/* Guru Routes */}
        <Route path="/guru/dashboard" element={
          <GuruRoute>
            <GuruDashboard />
          </GuruRoute>
        } />
        <Route path="/guru/tempat-pkl" element={
          <GuruRoute>
            <GuruTempatPkl />
          </GuruRoute>
        } />
        <Route path="/guru/absensi" element={
          <GuruRoute>
            <GuruAbsensi />
          </GuruRoute>
        } />
        <Route path="/guru/jurnal" element={
          <GuruRoute>
            <GuruJurnal />
          </GuruRoute>
        } />
        <Route path="/guru/reports" element={
          <GuruRoute>
            <GuruReports />
          </GuruRoute>
        } />
        
        {/* Siswa Routes */}
        <Route path="/siswa/dashboard" element={
          <SiswaRoute>
            <SiswaDashboard />
          </SiswaRoute>
        } />
        <Route path="/siswa/absensi" element={
          <SiswaRoute>
            <SiswaAbsensi />
          </SiswaRoute>
        } />
        <Route path="/siswa/jurnal" element={
          <SiswaRoute>
            <SiswaJurnal />
          </SiswaRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Component to redirect to appropriate dashboard based on user role
function DashboardRedirect() {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'guru':
      return <Navigate to="/guru/dashboard" replace />;
    case 'siswa':
      return <Navigate to="/siswa/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;
