import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../components/organisms/DashboardShell';
import FormField from '../components/molecules/FormField';
import { Input, TextArea, Select } from '../components/atoms/Input';
import TagInput from '../components/molecules/TagInput';
import FileDropzone from '../components/molecules/FileDropzone';
import { JobCardGrid } from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import client from '../api/client';

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

export default function PostJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !category || !budgetMin || !budgetMax || !deadline) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create job paylod
      await client.post('/jobs', {
        title,
        description,
        category,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        deadline,
        skillsRequired: skills,
      });
      navigate('/dashboard/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Error posting job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const previewJob = {
    title: title || 'Job Title Preview',
    category: category || 'Category',
    budgetMin: Number(budgetMin) || 0,
    budgetMax: Number(budgetMax) || 0,
    deadline: deadline || new Date().toISOString(),
    skillsRequired: skills,
    status: 'open',
  };

  return (
    <DashboardShell navItems={clientNavItems}>
      <div className="max-w-[1440px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline text-[#191c1d]">Post a New Job</h1>
          <p className="text-sm text-[#464555] font-body mt-1">Provide project details to hire qualified student freelancers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e7e8e9] p-6 shadow-sm">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Job Title" htmlFor="title" required>
                <Input
                  id="title"
                  placeholder="Need a design for my portfolio site"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Job Description" htmlFor="description" required>
                <TextArea
                  id="description"
                  placeholder="Provide a detailed description of the project requirements, scope, and expected deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Category" htmlFor="category" required>
                  <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Design</option>
                    <option>Development</option>
                    <option>Backend</option>
                    <option>Marketing</option>
                    <option>Writing</option>
                    <option>Video</option>
                    <option>Other</option>
                  </Select>
                </FormField>

                <FormField label="Application Deadline" htmlFor="deadline" required>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Min Budget ($)" htmlFor="budgetMin" required>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="50"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Max Budget ($)" htmlFor="budgetMax" required>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="200"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Skills Required" hint="Press enter or comma to add a skill tag">
                <TagInput value={skills} onChange={setSkills} placeholder="e.g. Figma, React, Python" />
              </FormField>

              <FormField label="Attachments (Optional)" hint="Attach brief documents, wireframes, or styling guides">
                <FileDropzone accept="*/*" multiple onFiles={setFiles} />
              </FormField>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e7e8e9]">
                <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/client')}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </form>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold font-headline text-[#191c1d]">Live Card Preview</h2>
            <div className="sticky top-24">
              <JobCardGrid job={previewJob} />
              <div className="mt-4 p-4 rounded-xl bg-[#e2dfff]/30 border border-[#3525cd]/10 text-xs text-[#464555] font-body leading-relaxed">
                💡 <strong>Dynamic Preview:</strong> This shows how freelancers will see your listing on the find jobs board. Be descriptive in the title for a better AI Matchmaker match.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
