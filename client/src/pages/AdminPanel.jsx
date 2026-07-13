import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardShell from '../components/organisms/DashboardShell';
import { StatCard, Card } from '../components/molecules/Card';
import Table from '../components/molecules/Table';
import ChartLine from '../components/molecules/ChartLine';
import { StatusPill } from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import { SearchBar } from '../components/molecules/SearchBar';
import client from '../api/client';

// Simple SVG Icons
const OverviewIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const adminNavItems = [
  { label: 'Overview', to: '/admin?section=overview', icon: <OverviewIcon /> },
  { label: 'User Management', to: '/admin?section=users', icon: <UsersIcon /> },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';

  // Overview Data State
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalTransacted: 0, totalRevenue: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [activity, setActivity] = useState([]);

  // Users Data State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch Overview Stats
  const fetchOverviewData = async () => {
    try {
      const [statsRes, revenueRes, activityRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/revenue'),
        client.get('/admin/activity'),
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      console.error('Error fetching admin overview data:', err);
    }
  };

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      const res = await client.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (section === 'overview') {
        await fetchOverviewData();
      } else {
        await fetchUsers();
      }
      setLoading(false);
    };
    loadData();
  }, [section]);

  // Actions
  const handleSuspend = async (userId) => {
    try {
      await client.put(`/admin/users/${userId}/suspend`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to suspend/unsuspend user:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user account? This action is irreversible.')) {
      return;
    }
    try {
      await client.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const userColumns = [
    { key: 'name', label: 'User Name', render: (v) => <span className="font-semibold text-[#191c1d]">{v}</span> },
    { key: 'email', label: 'Email Address' },
    { key: 'role', label: 'Role', render: (v) => <span className="capitalize font-label text-xs font-semibold">{v}</span> },
    { key: 'createdAt', label: 'Joined Date', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (v) => <StatusPill status={v || 'active'} /> },
    {
      key: '_id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSuspend(id)}
          >
            {row.status === 'suspended' ? 'Activate' : 'Suspend'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell navItems={adminNavItems}>
      <div className="max-w-[1440px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline text-[#191c1d]">
            {section === 'overview' ? 'Platform Control Overview' : 'User Accounts Management'}
          </h1>
          <p className="text-sm text-[#464555] font-body mt-1">
            {section === 'overview'
              ? 'Real-time metrics, platform commission tracking, and system health operations.'
              : 'Moderate student freelancers and client organizations, suspend access or delete accounts.'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#464555] font-body">Loading administration panel...</div>
        ) : section === 'overview' ? (
          <>
            {/* Admin Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Total Users Registered"
                value={stats.totalUsers}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
              <StatCard
                label="Active Gig Postings"
                value={stats.totalJobs}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              />
              <StatCard
                label="Total Payments Settle"
                value={`$${stats.totalTransacted.toFixed(2)}`}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v-1m-7 1h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
              />
              <StatCard
                label="Platform Commission (15%)"
                value={`$${stats.totalRevenue.toFixed(2)}`}
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>}
              />
            </div>

            {/* Charts & Activity Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue line chart */}
              <Card className="lg:col-span-2 p-6 space-y-4">
                <h2 className="text-xl font-bold font-headline text-[#191c1d]">Platform Revenue Trend ($)</h2>
                <div className="pt-4">
                  <ChartLine
                    data={revenueData}
                    xKey="name"
                    yKey="revenue"
                    height={220}
                  />
                </div>
              </Card>

              {/* Activity log */}
              <Card className="lg:col-span-1 p-6 space-y-4 flex flex-col">
                <h2 className="text-xl font-bold font-headline text-[#191c1d]">Recent Activity Feed</h2>
                <div className="flex-grow overflow-y-auto space-y-4 max-h-[250px] pr-2">
                  {activity.length === 0 ? (
                    <p className="text-xs text-[#777587] font-body">No recent events logged.</p>
                  ) : (
                    activity.map((act, i) => (
                      <div key={i} className="flex gap-3 text-xs leading-relaxed border-b border-[#e7e8e9] pb-3 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                        <div>
                          <p className="text-[#464555] font-body">{act.description}</p>
                          <span className="text-[10px] text-[#777587]">{new Date(act.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        ) : (
          /* User Management Screen */
          <div className="space-y-6">
            <div className="max-w-md">
              <SearchBar
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onSubmit={(e) => e.preventDefault()}
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e7e8e9] p-8 text-center text-[#464555] font-body text-sm">
                No users matched your search criteria.
              </div>
            ) : (
              <Table
                columns={userColumns}
                rows={filteredUsers}
              />
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
