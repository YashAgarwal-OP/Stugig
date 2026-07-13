import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardShell from '../components/organisms/DashboardShell';
import { StatCard, JobCardGrid } from '../components/molecules/Card';
import AIFeatureCard from '../components/molecules/AIFeatureCard';
import Table from '../components/molecules/Table';
import { StatusPill } from '../components/atoms/Badge';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

// Simple SVG Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
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

const freelancerNavItems = [
  { label: 'Dashboard', to: '/dashboard/freelancer', icon: <DashboardIcon /> },
  { label: 'Browse Services', to: '/services', icon: <ServicesIcon /> },
  { label: 'Find Jobs', to: '/jobs', icon: <JobsIcon /> },
  { label: 'Messages', to: '/messages', icon: <MessagesIcon /> },
  { label: 'Payments', to: '/payment', icon: <PaymentsIcon /> },
];

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [matches, setMatches] = useState([]);
  const [bids, setBids] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, bidsRes, payRes] = await Promise.all([
          client.get('/matchmaker/jobs'),
          client.get('/bids/my-bids'),
          client.get('/payments/history')
        ]);
        setMatches(matchRes.data || []);
        setBids(bidsRes.data || []);
        setPayments(payRes.data || []);
      } catch (err) {
        console.error('Error fetching freelancer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.key]);

  // Compute stat totals
  const activeBidsCount = bids.filter(b => b.status === 'pending').length;
  const ongoingJobsCount = bids.filter(b => b.status === 'accepted' && b.jobId?.status === 'in-progress').length;
  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const columns = [
    { key: 'jobTitle', label: 'Job Title', sortable: true, render: (_, row) => (
      <div>
        <div className="font-semibold text-sm text-[#191c1d]">{row.jobId?.title || 'Job'}</div>
        <div className="text-xs text-[#777587] mt-0.5">${row.quoteAmount} Bid</div>
      </div>
    )},
    { key: 'client', label: 'Client', render: (_, row) => row.jobId?.clientId?.name || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
    { key: 'deliveryTime', label: 'Delivery', render: (v) => v || '—' },
  ];

  return (
    <DashboardShell navItems={freelancerNavItems}>
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold font-headline text-[#191c1d]">Welcome back, {user?.name || 'Student'}</h1>
          <p className="text-sm text-[#464555] font-body mt-1">Here is a quick look at your scholastic freelance projects today.</p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12 text-[#464555] font-body">Loading dashboard data...</div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Active Bids"
                value={activeBidsCount}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <StatCard
                label="Jobs In Progress"
                value={ongoingJobsCount}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Total Earnings"
                value={`$${totalEarnings}`}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14a2 2 0 110-4h4" /></svg>}
              />
              <StatCard
                label="Average Rating"
                value={user?.rating ? user.rating.toFixed(1) : '—'}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.58 1.822l-3.97 2.885a1 1 0 00-.364 1.118l1.52 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.885a1 1 0 00-1.175 0l-3.97 2.885c-.783.57-1.838-.197-1.539-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.58-1.81h4.908a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
              />
            </div>

            {/* Smart Matches AI Panel */}
            <AIFeatureCard
              title="Smart Matches"
              description="AI-recommended jobs curated dynamically matching your skill profile"
            >
              {matches.length === 0 ? (
                <div className="text-center py-6 text-[#464555] text-sm font-body">
                  No active matches found. Check back later or add more skills to your profile.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {matches.slice(0, 3).map(({ job, matchScore }) => (
                    <JobCardGrid
                      key={job._id}
                      job={job}
                      matchScore={matchScore}
                      onClick={() => navigate(`/jobs/${job._id}`)}
                    />
                  ))}
                </div>
              )}
            </AIFeatureCard>

            {/* Active Bids Table */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-headline text-[#191c1d]">Active Bids & Applications</h2>
              {bids.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#e7e8e9] p-8 text-center text-[#464555] font-body text-sm">
                  No active bids yet — browse jobs to get started.
                </div>
              ) : (
                <Table
                  columns={columns}
                  rows={bids}
                  onRowClick={(row) => navigate(`/jobs/${row.jobId?._id}`)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
