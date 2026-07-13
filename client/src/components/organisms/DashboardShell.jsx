import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../atoms/Avatar';
import { clsx } from 'clsx';

// DashboardShell accepts navItems as props so Freelancer/Client/Admin all reuse this
// navItem shape: { label, to, icon }
export default function DashboardShell({ navItems = [], children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f5]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[#e7e8e9] flex flex-col z-30 shadow-sm">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#e7e8e9] shrink-0">
          <span className="font-bold font-headline text-[#3525cd] text-xl tracking-tight">
            Stu<span className="text-[#a44100]">Gig</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-label font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#e2dfff] text-[#3525cd]'
                    : 'text-[#464555] hover:bg-[#f3f4f5] hover:text-[#3525cd]'
                )
              }
            >
              {item.icon && <span className="w-5 h-5 shrink-0">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="border-t border-[#e7e8e9] p-4 flex items-center gap-3">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold font-label text-[#191c1d] truncate">{user?.name}</p>
            <p className="text-xs text-[#777587] capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-[#777587] hover:text-[#ba1a1a] transition-colors" aria-label="Log out">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur border-b border-[#e7e8e9] flex items-center px-6 gap-4">
          <div className="flex-1" />
          <Avatar name={user?.name} size="sm" />
        </header>
        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
