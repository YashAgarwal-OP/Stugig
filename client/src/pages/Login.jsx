import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/molecules/FormField';
import { Input } from '../components/atoms/Input';
import PasswordInput from '../components/atoms/PasswordInput';
import Button from '../components/atoms/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'client') {
        navigate('/dashboard/client');
      } else if (data.role === 'freelancer') {
        navigate('/dashboard/freelancer');
      } else if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(53, 37, 205, 0.08) 1.5px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl border border-[#e7e8e9] p-8 md:p-10 shadow-lg flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="font-bold font-headline text-2xl text-[#3525cd] tracking-tight">StuGig</span>
          {/* AI Sparkle Icon representation */}
          <svg className="w-5 h-5 text-[#8B5CF6]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>

        {/* Header */}
        <div className="text-center w-full mb-8">
          <h1 className="font-bold font-headline text-xl text-[#191c1d] mb-1">Welcome Back</h1>
          <p className="text-sm text-[#464555] font-body">Log in to continue building your career.</p>
        </div>

        {error && (
          <div className="w-full mb-6 p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Email */}
          <FormField label="Email Address" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold font-label text-sm text-[#191c1d]" htmlFor="password">
                Password
              </label>
              <span className="text-xs font-semibold text-[#3525cd] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="w-full my-6 relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#e7e8e9]" />
          <span className="flex-shrink mx-4 text-[#777587] text-xs font-body">or log in with</span>
          <div className="flex-grow border-t border-[#e7e8e9]" />
        </div>

        {/* Social Login */}
        <div className="w-full flex gap-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2 border border-[#c7c4d8]"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"></path>
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2 border border-[#c7c4d8]"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
            </svg>
            GitHub
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <span className="text-sm text-[#464555] font-body">Don't have an account? </span>
          <Link to="/signup" className="font-semibold text-sm text-[#3525cd] hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
