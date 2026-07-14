import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../components/organisms/DashboardShell';
import { Card } from '../components/molecules/Card';
import FormField from '../components/molecules/FormField';
import { Input, TextArea, Select } from '../components/atoms/Input';
import TagInput from '../components/molecules/TagInput';
import FileDropzone from '../components/molecules/FileDropzone';
import { StatusPill } from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

// ── Nav items (same shape used in FreelancerDashboard) ────────────────────────
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
const MyServicesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
);

const freelancerNavItems = [
  { label: 'Dashboard',   to: '/dashboard/freelancer', icon: <DashboardIcon /> },
  { label: 'My Services', to: '/services/manage',      icon: <MyServicesIcon /> },
  { label: 'Browse Services', to: '/services',         icon: <ServicesIcon /> },
  { label: 'Find Jobs',   to: '/jobs',                 icon: <JobsIcon /> },
  { label: 'Messages',    to: '/messages',             icon: <MessagesIcon /> },
  { label: 'Payments',    to: '/payment',              icon: <PaymentsIcon /> },
];

const CATEGORIES = ['Design', 'Development', 'Backend', 'Marketing', 'Writing', 'Video', 'Other'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Design',
  price: '',
  deliveryTime: '',
  tags: [],
  imageFile: null,
};

export default function MyServices() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state — null = closed, 'new' = creating, string id = editing
  const [formMode, setFormMode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch my services ─────────────────────────────────────────────────────
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/services?freelancerId=${user._id || user.id}`);
      setServices(res.data.services || res.data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchServices();
  }, []);

  // ── Open form helpers ─────────────────────────────────────────────────────
  const openNew = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setFormMode('new');
  };

  const openEdit = (svc) => {
    setForm({
      title: svc.title,
      description: svc.description,
      category: svc.category,
      price: String(svc.price),
      deliveryTime: svc.deliveryTime,
      tags: svc.tags || [],
      imageFile: null,
    });
    setFormError('');
    setFormMode(svc._id);
  };

  const closeForm = () => {
    setFormMode(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  // ── Submit (create or update) ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title || !form.description || !form.price || !form.deliveryTime) {
      setFormError('Title, description, price, and delivery time are required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('price', form.price);
      data.append('deliveryTime', form.deliveryTime);
      data.append('tags', JSON.stringify(form.tags));
      if (form.imageFile) data.append('image', form.imageFile);

      if (formMode === 'new') {
        await client.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await client.put(`/services/${formMode}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      closeForm();
      await fetchServices();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle pause/active ───────────────────────────────────────────────────
  const handleToggleStatus = async (svc) => {
    const newStatus = svc.status === 'active' ? 'paused' : 'active';
    try {
      await client.put(`/services/${svc._id}`, { status: newStatus });
      setServices((prev) => prev.map((s) => s._id === svc._id ? { ...s, status: newStatus } : s));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    try {
      await client.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardShell navItems={freelancerNavItems}>
      <div className="max-w-[1440px] mx-auto space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline text-[#191c1d]">My Services</h1>
            <p className="text-sm text-[#464555] font-body mt-1">
              Create and manage the services you offer to clients.
            </p>
          </div>
          {formMode === null && (
            <Button variant="primary" onClick={openNew}
              iconLeft={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Add New Service
            </Button>
          )}
        </div>

        {/* ── Create / Edit Form ── */}
        {formMode !== null && (
          <Card className="p-6">
            <h2 className="text-lg font-bold font-headline text-[#191c1d] mb-5">
              {formMode === 'new' ? 'Create New Service' : 'Edit Service'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 text-[#ba1a1a] text-sm font-body">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Service Title" required>
                  <Input
                    placeholder="e.g. I will design your Figma prototype"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </FormField>

                <FormField label="Category" required>
                  <Select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </FormField>

                <FormField label="Price ($)" required>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </FormField>

                <FormField label="Delivery Time" required hint='e.g. "3 days", "1 week"'>
                  <Input
                    placeholder="e.g. 3 days"
                    value={form.deliveryTime}
                    onChange={(e) => setForm((f) => ({ ...f, deliveryTime: e.target.value }))}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Description" required>
                <TextArea
                  placeholder="Describe what you will deliver, your process, and any requirements from the client..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Tags" hint="Press Enter or comma to add a tag">
                <TagInput
                  value={form.tags}
                  onChange={(tags) => setForm((f) => ({ ...f, tags }))}
                  placeholder="e.g. Figma, UI/UX, Branding"
                />
              </FormField>

              <FormField label="Cover Image (Optional)">
                <FileDropzone
                  accept="image/*"
                  onFiles={(files) => setForm((f) => ({ ...f, imageFile: files[0] || null }))}
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#e7e8e9]">
                <Button type="button" variant="ghost" onClick={closeForm} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : formMode === 'new' ? 'Create Service' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ── Services list ── */}
        {loading ? (
          <div className="text-center py-12 text-[#464555] font-body">Loading your services...</div>
        ) : services.length === 0 && formMode === null ? (
          <div className="bg-white rounded-2xl border border-[#e7e8e9] p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#e2dfff] flex items-center justify-center mx-auto">
              <MyServicesIcon />
            </div>
            <h3 className="text-lg font-bold font-headline text-[#191c1d]">No services yet</h3>
            <p className="text-sm text-[#464555] font-body max-w-sm mx-auto">
              Create your first service listing to start getting hired by clients on StuGig.
            </p>
            <Button variant="primary" onClick={openNew}>Add Your First Service</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((svc) => (
              <Card key={svc._id} className="flex flex-col overflow-hidden">
                {/* Cover image */}
                <div className="h-36 bg-[#e2dfff] relative shrink-0">
                  {svc.imageUrl ? (
                    <img src={svc.imageUrl} alt={svc.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#b0afc0]">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Status badge overlay */}
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full font-label capitalize ${
                    svc.status === 'active'
                      ? 'bg-[#89f5e7] text-[#006a61]'
                      : 'bg-[#edeeef] text-[#777587]'
                  }`}>
                    {svc.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <p className="text-xs text-[#3525cd] font-label uppercase tracking-wide">{svc.category}</p>
                    <h3 className="font-semibold font-headline text-[#191c1d] text-sm line-clamp-2 mt-0.5">{svc.title}</h3>
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#464555]">
                    <span className="font-bold text-[#191c1d]">${svc.price}</span>
                    <span className="text-xs flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {svc.deliveryTime}
                    </span>
                  </div>

                  {svc.reviewCount > 0 && (
                    <p className="text-xs text-[#777587]">
                      ★ {svc.rating?.toFixed(1)} ({svc.reviewCount} review{svc.reviewCount !== 1 ? 's' : ''})
                    </p>
                  )}

                  {/* Tags */}
                  {svc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {svc.tags.slice(0, 4).map((t) => (
                        <span key={t} className="bg-[#f3f4f5] text-[#464555] text-xs px-2 py-0.5 rounded-full border border-[#e7e8e9]">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-[#e7e8e9] flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(svc)}
                      disabled={formMode !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleStatus(svc)}
                    >
                      {svc.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                      onClick={() => handleDelete(svc._id)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
