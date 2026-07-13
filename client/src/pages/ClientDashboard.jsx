import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardShell from '../components/organisms/DashboardShell';
import { StatCard, JobCardRow } from '../components/molecules/Card';
import Table from '../components/molecules/Table';
import { StatusPill } from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

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

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [allBidsCount, setAllBidsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, payRes] = await Promise.all([
          client.get('/jobs/client/my-jobs'),
          client.get('/payments/history')
        ]);
        const clientJobs = jobsRes.data || [];
        setJobs(clientJobs);
        setPayments(payRes.data || []);

        // Count total bids received across all active/posted jobs
        let totalBids = 0;
        await Promise.all(clientJobs.map(async (job) => {
          try {
            const bidsRes = await client.get(`/jobs/${job._id}/bids`);
            totalBids += (bidsRes.data || []).length;
          } catch (e) {
            // Silence bid errors for single jobs
          }
        }));
        setAllBidsCount(totalBids);
      } catch (err) {
        console.error('Error fetching client dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.key]);

  const activeJobsCount = jobs.filter(j => j.status === 'open').length;
  const hiredCount = jobs.filter(j => j.status === 'in-progress' || j.status === 'completed').length;
  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.totalCharged || 0), 0);

  const paymentColumns = [
    { key: 'jobTitle', label: 'Job / Project', render: (_, row) => row.jobId?.title || 'Project' },
    { key: 'freelancer', label: 'Freelancer', render: (_, row) => row.freelancerId?.name || '—' },
    { key: 'totalCharged', label: 'Amount', render: (v) => `$${v?.toFixed(2)}` },
    { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
  ];

  return (
    <DashboardShell navItems={clientNavItems}>
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Header & CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline text-[#191c1d]">Welcome back, {user?.name || 'Client'}</h1>
            <p className="text-sm text-[#464555] font-body mt-1">Manage your active posts, review applications, and hire student freelancers.</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/jobs/new')}
            iconLeft={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          >
            Post a New Job
          </Button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12 text-[#464555] font-body">Loading dashboard data...</div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Active Jobs Posted"
                value={activeJobsCount}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              />
              <StatCard
                label="Bids Received"
                value={allBidsCount}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
              />
              <StatCard
                label="Hired Freelancers"
                value={hiredCount}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
              <StatCard
                label="Total Spent"
                value={`$${totalSpent.toFixed(2)}`}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
              />
            </div>

            {/* Content Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Posted Jobs Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-headline text-[#191c1d]">My Posted Jobs</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>View All</Button>
                </div>
                {jobs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#e7e8e9] p-8 text-center text-[#464555] font-body text-sm">
                    No active job postings yet — click "Post a New Job" to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.slice(0, 4).map((job) => (
                      <JobCardRow
                        key={job._id}
                        job={job}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Payments Widget */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-headline text-[#191c1d]">Recent Transactions</h2>
                {payments.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#e7e8e9] p-8 text-center text-[#464555] font-body text-sm">
                    No transactions recorded yet.
                  </div>
                ) : (
                  <Table
                    columns={paymentColumns}
                    rows={payments.slice(0, 5)}
                    onRowClick={() => navigate('/payment')}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
