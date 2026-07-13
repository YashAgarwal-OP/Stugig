import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../atoms/Avatar';
import Button from '../atoms/Button';

export default function PublicNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const dashboardPath =
    user?.role === 'client'
      ? '/dashboard/client'
      : user?.role === 'admin'
      ? '/admin'
      : '/dashboard/freelancer';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-[#e7e8e9] flex items-center px-8 gap-6">
      <Link to="/" className="font-bold font-headline text-[#3525cd] text-xl tracking-tight shrink-0">
        Stu<span className="text-[#a44100]">Gig</span>
      </Link>
      <div className="flex items-center gap-6 flex-1">
        <Link to="/services" className="text-sm text-[#464555] hover:text-[#3525cd] font-label transition-colors">Browse Services</Link>
        <Link to="/jobs" className="text-sm text-[#464555] hover:text-[#3525cd] font-label transition-colors">Find Jobs</Link>
      </div>
      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <>
            <button
              onClick={() => navigate(dashboardPath)}
              className="text-sm font-semibold font-label text-[#3525cd] hover:underline transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="text-sm text-[#464555] hover:text-[#3525cd] font-label transition-colors"
            >
              Messages
            </button>
            <Avatar name={user.name} size="sm" />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log In</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>
          </>
        )}
      </div>
    </nav>
  );
}
