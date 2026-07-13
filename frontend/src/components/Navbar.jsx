import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glassmorphism sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1 font-sans">
          <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">Stu</span>
          <span>Gig</span>
        </Link>
        <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
          Student Marketplace
        </span>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-dark-400 capitalize">{user.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-100 border border-dark-700 hover:border-dark-600 transition-all duration-200"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-white transition-colors duration-150">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg shadow-md hover:shadow-primary-500/25 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
