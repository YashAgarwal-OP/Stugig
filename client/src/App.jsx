import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PlaceholderPage from './pages/PlaceholderPage';
import StyleGuide from './pages/StyleGuide';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import BrowseServices from './pages/BrowseServices';
import ServiceDetail from './pages/ServiceDetail';
import MyServices from './pages/MyServices';
import PostJob from './pages/PostJob';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Payment from './pages/Payment';
import PublicProfile from './pages/PublicProfile';
import AdminPanel from './pages/AdminPanel';

// DEV-ONLY: Auth injection helper for local testing.
// Statically imported here; only REGISTERED as a route when import.meta.env.DEV
// is true. Vite replaces that constant at build time — in production the branch
// is dead code and the minifier strips both the route and the component reference.
import DevSetAuth from './pages/DevSetAuth';

// Route guards
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<BrowseServices />} />
          <Route path="/services/manage" element={
            <RequireAuth><RequireRole role="freelancer"><MyServices /></RequireRole></RequireAuth>
          } />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />

          {/* Style Guide */}
          <Route path="/style-guide" element={<StyleGuide />} />

          {/* Freelancer dashboard */}
          <Route path="/dashboard/freelancer" element={
            <RequireAuth><RequireRole role="freelancer"><FreelancerDashboard /></RequireRole></RequireAuth>
          } />

          {/* Client dashboard */}
          <Route path="/dashboard/client" element={
            <RequireAuth><RequireRole role="client"><ClientDashboard /></RequireRole></RequireAuth>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <RequireAuth><RequireRole role="admin"><AdminPanel /></RequireRole></RequireAuth>
          } />

          {/* Shared auth routes */}
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/payment" element={<RequireAuth><Payment /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/jobs/new" element={<RequireAuth><RequireRole role="client"><PostJob /></RequireRole></RequireAuth>} />

          {/* DEV ONLY — auth injection helper, stripped from production builds */}
          {import.meta.env.DEV && DevSetAuth && (
            <Route path="/dev/set-auth" element={<DevSetAuth />} />
          )}

          {/* 404 */}
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
