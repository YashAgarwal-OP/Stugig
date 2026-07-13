import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import DashboardShell from '../components/organisms/DashboardShell';
import { Card } from '../components/molecules/Card';
import Table from '../components/molecules/Table';
import { StatusPill } from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

// Load Stripe from env var — set VITE_STRIPE_PUBLISHABLE_KEY in client/.env
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error(
    '[Payment] VITE_STRIPE_PUBLISHABLE_KEY is not set. ' +
    'Add it to client/.env and restart the dev server.'
  );
}
const stripePromise = loadStripe(stripeKey);

// Simple SVG Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
);
const PostJobIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ServicesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const JobsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const MessagesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const PaymentsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);

const clientNavItems = [
  { label: 'Dashboard', to: '/dashboard/client', icon: <DashboardIcon /> },
  { label: 'Post a Job', to: '/jobs/new', icon: <PostJobIcon /> },
  { label: 'Browse Services', to: '/services', icon: <ServicesIcon /> },
  { label: 'Messages', to: '/messages', icon: <MessagesIcon /> },
  { label: 'Payments', to: '/payment', icon: <PaymentsIcon /> },
];

const freelancerNavItems = [
  { label: 'Dashboard', to: '/dashboard/freelancer', icon: <DashboardIcon /> },
  { label: 'Browse Services', to: '/services', icon: <ServicesIcon /> },
  { label: 'Find Jobs', to: '/jobs', icon: <JobsIcon /> },
  { label: 'Messages', to: '/messages', icon: <MessagesIcon /> },
  { label: 'Payments', to: '/payment', icon: <PaymentsIcon /> },
];

// Inner Card Form for Stripe Payments
function CheckoutForm({ jobId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [commissionInfo, setCommissionInfo] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const res = await client.post('/payments/create-intent', { jobId });
        setClientSecret(res.data.clientSecret);
        setCommissionInfo(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error initializing checkout');
      }
    };
    if (jobId) fetchIntent();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements || !clientSecret) return;

    setPaying(true);
    try {
      const cardEl = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardEl }
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          onSuccess?.();
        }
      }
    } catch (err) {
      setError('An error occurred during payment processing.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto space-y-6">
      <h2 className="text-lg font-bold font-headline text-[#191c1d]">Checkout Payment</h2>
      {error && <p className="text-xs text-[#ba1a1a] font-body">{error}</p>}

      {commissionInfo && (
        <div className="space-y-2 border-b border-[#e7e8e9] pb-4 text-sm font-body text-[#464555]">
          <div className="flex justify-between">
            <span>Project Cost (Freelancer Quote):</span>
            <span className="font-semibold text-[#191c1d]">${commissionInfo.amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Commission (15%):</span>
            <span className="font-semibold text-[#191c1d]">${commissionInfo.commissionAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base border-t border-[#e7e8e9] pt-2 text-[#191c1d] font-bold font-headline">
            <span>Total Charged:</span>
            <span>${commissionInfo.totalCharged?.toFixed(2)}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 border border-[#c7c4d8] rounded-lg bg-white">
          <CardElement options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#191c1d',
                fontFamily: 'Inter, sans-serif',
                '::placeholder': { color: '#777587' }
              }
            }
          }} />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={paying || !stripe}>
          {paying ? 'Processing Payment...' : 'Pay with Sandbox Stripe'}
        </Button>
      </form>
    </Card>
  );
}

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const navItems = user?.role === 'client' ? clientNavItems : freelancerNavItems;

  const fetchHistory = async () => {
    try {
      const res = await client.get('/payments/history');
      setHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching payments history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePaymentSuccess = () => {
    setSuccess(true);
    fetchHistory();
    setTimeout(() => {
      // Clear query params & reset state
      navigate('/payment');
      setSuccess(false);
    }, 2500);
  };

  const columns = [
    { key: 'createdAt', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'jobTitle', label: 'Job / Project', render: (_, row) => row.jobId?.title || 'Project' },
    { key: 'otherParty', label: 'User', render: (_, row) => user.role === 'client' ? row.freelancerId?.name : row.clientId?.name },
    { key: 'amount', label: 'Net Quote', render: (v) => `$${v?.toFixed(2)}` },
    { key: 'totalCharged', label: 'Total Paid', render: (v) => `$${v?.toFixed(2)}` },
    { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
  ];

  return (
    <DashboardShell navItems={navItems}>
      <div className="max-w-[1440px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline text-[#191c1d]">Payments & Invoices</h1>
          <p className="text-sm text-[#464555] font-body mt-1">Review financial transactions, platform fee allocations, and settle jobs.</p>
        </div>

        {/* Payment Intent Section (If jobId provided) */}
        {jobId && user.role === 'client' && (
          <div className="mb-8">
            {success ? (
              <Card className="p-6 border-[#006a61] bg-[#89f5e7]/10 text-center max-w-md mx-auto">
                <svg className="w-12 h-12 text-[#006a61] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="font-bold text-lg text-[#006a61] font-headline">Payment Successful!</h3>
                <p className="text-xs text-[#464555] font-body mt-2">Your payment has been processed and job updated to active.</p>
              </Card>
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm jobId={jobId} onSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </div>
        )}

        {/* Payment History Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-headline text-[#191c1d]">Transaction History</h2>
          {loading ? (
            <div className="text-center py-12 text-[#464555] font-body">Loading transactions...</div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e7e8e9] p-8 text-center text-[#464555] font-body text-sm">
              No transactions recorded yet.
            </div>
          ) : (
            <Table
              columns={columns}
              rows={history}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
