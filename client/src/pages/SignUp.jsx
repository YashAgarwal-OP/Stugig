import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/molecules/FormField';
import { Input } from '../components/atoms/Input';
import PasswordInput from '../components/atoms/PasswordInput';
import { Checkbox, RadioCard } from '../components/atoms/Checkbox';
import Button from '../components/atoms/Button';

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'client' ? 'client' : 'freelancer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!terms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const data = await signup(name, email, password, role);
      if (data.role === 'client') {
        navigate('/dashboard/client');
      } else {
        navigate('/dashboard/freelancer');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error creating account. Please try again.');
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

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl border border-[#e7e8e9] p-8 md:p-10 shadow-lg">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-bold font-headline text-2xl text-[#3525cd] tracking-tight">StuGig</span>
          </Link>
          <h1 className="font-bold font-headline text-xl text-[#191c1d] mb-1">Create an Account</h1>
          <p className="text-sm text-[#464555] font-body">Join the scholastic gig economy.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold font-label text-[#191c1d]">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <RadioCard
                name="role"
                value="freelancer"
                label="Find Work"
                description="I'm a Student"
                icon="🎓"
                checked={role === 'freelancer'}
                onChange={() => setRole('freelancer')}
              />
              <RadioCard
                name="role"
                value="client"
                label="Hire Students"
                description="I'm a Client"
                icon="💼"
                checked={role === 'client'}
                onChange={() => setRole('client')}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <FormField label="Full Name" htmlFor="name" required>
              <Input
                id="name"
                type="text"
                placeholder="Alex Rivers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="University Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                placeholder="alex.rivers@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Password" htmlFor="password" required>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Confirm Password" htmlFor="confirmPassword" required>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="mt-4">
            <Checkbox
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              label={
                <span>
                  I agree to the{' '}
                  <span className="text-[#3525cd] hover:underline cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-[#3525cd] hover:underline cursor-pointer">Privacy Policy</span>.
                </span>
              }
            />
          </div>

          {/* Create Account Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#e7e8e9]" />
          <span className="flex-shrink mx-4 text-[#777587] text-xs font-body">or sign up with</span>
          <div className="flex-grow border-t border-[#e7e8e9]" />
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 border border-[#c7c4d8]"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"></path>
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 border border-[#c7c4d8]"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
            </svg>
            GitHub
          </Button>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#464555] font-body">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#3525cd] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
