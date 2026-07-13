import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('freelancer');
  const [skillsText, setSkillsText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Split skills by comma, trim spaces, and filter empty strings
    const skills = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const result = await signup(name, email, password, role, skills);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="glassmorphism max-w-lg w-full p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary-500/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-dark-400">
            Join peers and students in the safe freelance market
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
              School Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@student.edu"
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`py-3 rounded-xl font-medium border text-center transition-all ${
                  role === 'freelancer'
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 font-semibold'
                    : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
                }`}
              >
                Work as Freelancer
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-3 rounded-xl font-medium border text-center transition-all ${
                  role === 'client'
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 font-semibold'
                    : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
                }`}
              >
                Hire Peers
              </button>
            </div>
          </div>

          {role === 'freelancer' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
                Your Skills (Comma Separated)
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="React, Node.js, Logo Design, Essay Review"
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors duration-150"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg hover:shadow-primary-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-dark-400 relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors duration-150">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
