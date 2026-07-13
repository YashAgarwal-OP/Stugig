import { useState } from 'react';
import Button from '../components/atoms/Button';
import { Input, TextArea, Select } from '../components/atoms/Input';
import PasswordInput from '../components/atoms/PasswordInput';
import { Badge, StatusPill } from '../components/atoms/Badge';
import { Avatar, StarRating } from '../components/atoms/Avatar';
import { Checkbox, RadioCard } from '../components/atoms/Checkbox';
import { Card, StatCard, ServiceCard, JobCardRow, JobCardGrid, ReviewListItem, TransactionRow } from '../components/molecules/Card';
import FormField from '../components/molecules/FormField';
import { SearchBar, FilterPanel } from '../components/molecules/SearchBar';
import FileDropzone from '../components/molecules/FileDropzone';
import TagInput from '../components/molecules/TagInput';
import AIFeatureCard from '../components/molecules/AIFeatureCard';
import Modal from '../components/molecules/Modal';
import Table from '../components/molecules/Table';
import { TabBar } from '../components/organisms/ProfileHeader';
import { ConversationListItem, MessageBubble, TypingIndicator, ChatInputBar } from '../components/organisms/Chat';

const Section = ({ title, children }) => (
  <section className="mb-16">
    <h2 className="text-xl font-bold font-headline text-[#191c1d] mb-6 pb-2 border-b-2 border-[#e2dfff]">{title}</h2>
    <div className="flex flex-wrap gap-4 items-start">{children}</div>
  </section>
);

export default function StyleGuide() {
  const [tags, setTags] = useState(['React', 'Node.js']);
  const [role, setRole] = useState('freelancer');
  const [modalOpen, setModalOpen] = useState(false);
  const [starVal, setStarVal] = useState(3);
  const [activeTab, setActiveTab] = useState('services');
  const [filters, setFilters] = useState({ categories: [] });

  const mockJob = { title: 'Build a REST API for my e-commerce site', category: 'Backend', budgetMin: 100, budgetMax: 300, deadline: new Date().toISOString(), status: 'open', skillsRequired: ['Node.js', 'Express', 'MongoDB'] };
  const mockService = { title: 'I will design a modern Figma UI kit', price: 49, deliveryTime: '3 days', category: 'Design', freelancerId: { name: 'Alex Kim' } };
  const mockReview = { reviewerId: { name: 'Priya Singh' }, rating: 5, text: 'Absolutely brilliant work! Delivered early and exceeded expectations.', createdAt: new Date().toISOString() };
  const mockPayment = { jobId: { title: 'Logo Design' }, totalCharged: 115, commissionAmount: 15, status: 'completed', createdAt: new Date().toISOString() };
  const mockThread = { jobTitle: 'API Project', otherUser: { name: 'Jordan Lee' }, lastMessage: 'Can you share the repo?', unread: 2 };
  const mockMsg = { text: "Hey! I've reviewed your brief. Looks great.", createdAt: new Date().toISOString(), sender: { name: 'Alex' } };

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', render: (v) => <StatusPill status={v} /> },
  ];
  const tableRows = [
    { name: 'Alex Kim', role: 'freelancer', status: 'open' },
    { name: 'Priya Singh', role: 'client', status: 'completed' },
    { name: 'Jordan Lee', role: 'freelancer', status: 'in-progress' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f5] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#e2dfff] text-[#3525cd] text-xs font-semibold px-3 py-1 rounded-full font-label">StuGig Design System</span>
          </div>
          <h1 className="text-4xl font-bold font-headline text-[#191c1d]">Component Style Guide</h1>
          <p className="text-[#464555] mt-2 font-body">All UI components — atoms → molecules → organisms. Every variant at a glance.</p>
        </header>

        {/* ── COLOR PALETTE ── */}
        <Section title="Color Palette (Stitch Tokens)">
          {[
            ['Primary', '#3525cd'], ['Primary Container', '#4f46e5'], ['Primary Light', '#e2dfff'],
            ['Secondary', '#006a61'], ['Secondary Container', '#86f2e4'],
            ['Accent', '#a44100'], ['Accent Container', '#ffdbcc'],
            ['Surface', '#f8f9fa'], ['On Surface', '#191c1d'], ['Muted', '#464555'],
            ['Outline', '#777587'], ['Error', '#ba1a1a'],
          ].map(([name, hex]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-xl shadow-sm border border-[#e7e8e9]" style={{ background: hex }} />
              <span className="text-[10px] font-label text-[#464555] text-center">{name}</span>
              <span className="text-[9px] text-[#777587] font-mono">{hex}</span>
            </div>
          ))}
        </Section>

        {/* ── BUTTONS ── */}
        <Section title="Atoms / Button">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="accent">Accent CTA</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button variant="primary" size="sm" iconLeft={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>Icon Left</Button>
          <Button variant="primary" size="lg">Large</Button>
        </Section>

        {/* ── INPUTS ── */}
        <Section title="Atoms / Inputs">
          <div className="w-64 flex flex-col gap-3">
            <FormField label="Email" htmlFor="sg-email" required><Input id="sg-email" placeholder="you@uni.edu" /></FormField>
            <FormField label="Password" htmlFor="sg-pw"><PasswordInput id="sg-pw" placeholder="••••••••" /></FormField>
            <FormField label="Bio" htmlFor="sg-bio"><TextArea id="sg-bio" placeholder="Tell us about yourself…" /></FormField>
            <FormField label="Category" htmlFor="sg-cat">
              <Select id="sg-cat"><option>Design</option><option>Backend</option><option>Marketing</option></Select>
            </FormField>
            <FormField label="Email (error)" htmlFor="sg-err" error="Invalid email address"><Input id="sg-err" value="notvalid" onChange={() => {}} error /></FormField>
          </div>
        </Section>

        {/* ── BADGES ── */}
        <Section title="Atoms / Badge & StatusPill">
          <Badge variant="primary">Python</Badge>
          <Badge variant="secondary">React</Badge>
          <Badge variant="accent">Design</Badge>
          <Badge variant="neutral">Misc</Badge>
          <div className="w-full border-t border-[#e7e8e9] my-1" />
          {['open', 'pending', 'in-progress', 'completed', 'paid', 'refunded', 'rejected', 'accepted', 'disputed'].map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </Section>

        {/* ── AVATAR ── */}
        <Section title="Atoms / Avatar & StarRating">
          {['xs', 'sm', 'md', 'lg', 'xl'].map((s) => <Avatar key={s} name="Alex Kim" size={s} />)}
          <Avatar src="https://i.pravatar.cc/80" name="Priya" size="md" />
          <div className="w-full border-t border-[#e7e8e9] my-1" />
          <StarRating value={4.5} size="md" />
          <StarRating value={starVal} interactive onChange={setStarVal} size="md" />
        </Section>

        {/* ── CHECKBOX / RADIOCARD ── */}
        <Section title="Atoms / Checkbox & RadioCard">
          <Checkbox label="I agree to Terms" />
          <Checkbox label="Checked" defaultChecked />
          <RadioCard name="sg-role" value="freelancer" label="Freelancer" description="Offer services & bid on jobs" icon="🎓" checked={role === 'freelancer'} onChange={() => setRole('freelancer')} />
          <RadioCard name="sg-role" value="client" label="Client" description="Post jobs & hire freelancers" icon="💼" checked={role === 'client'} onChange={() => setRole('client')} />
        </Section>

        {/* ── TAG INPUT ── */}
        <Section title="Molecules / TagInput">
          <div className="w-80"><TagInput value={tags} onChange={setTags} /></div>
        </Section>

        {/* ── SEARCH / FILTER ── */}
        <Section title="Molecules / SearchBar & FilterPanel">
          <div className="w-72"><SearchBar placeholder="Search jobs…" /></div>
          <div className="w-60">
            <FilterPanel categories={['Design', 'Backend', 'Marketing', 'Writing']} filters={filters} onFilterChange={setFilters} />
          </div>
        </Section>

        {/* ── CARDS ── */}
        <Section title="Molecules / Cards">
          <StatCard label="Active Jobs" value="12" trend="↑ 3 this week" />
          <StatCard label="Earnings" value="$1,240" />
          <div className="w-60"><ServiceCard service={mockService} /></div>
          <div className="w-80"><JobCardRow job={mockJob} /></div>
          <div className="w-64"><JobCardGrid job={mockJob} matchScore={87} /></div>
        </Section>

        {/* ── REVIEW & TRANSACTION ── */}
        <Section title="Molecules / ReviewListItem & TransactionRow">
          <div className="w-80"><Card className="p-4"><ReviewListItem review={mockReview} /></Card></div>
          <div className="w-80"><Card className="p-4"><TransactionRow payment={mockPayment} /></Card></div>
        </Section>

        {/* ── FILE DROPZONE ── */}
        <Section title="Molecules / FileDropzone">
          <div className="w-80"><FileDropzone label="Drop your portfolio files here or click to browse" accept="image/*,application/pdf" multiple /></div>
        </Section>

        {/* ── AI FEATURE CARD ── */}
        <Section title="Molecules / AIFeatureCard">
          <div className="w-72">
            <AIFeatureCard title="Job Matchmaker" description="AI-ranked jobs based on your skills and history">
              <p className="text-xs text-[#464555] font-body">Score: <strong className="text-[#3525cd]">87%</strong> match for "Build a REST API"</p>
            </AIFeatureCard>
          </div>
          <div className="w-72">
            <AIFeatureCard title="Smart Bidding Assistant" description="Suggested price range and cover message">
              <p className="text-xs text-[#464555] font-body">Suggested range: <strong className="text-[#006a61]">$90–$120</strong></p>
            </AIFeatureCard>
          </div>
        </Section>

        {/* ── MODAL ── */}
        <Section title="Molecules / Modal">
          <Button onClick={() => setModalOpen(true)}>Open Review Modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Leave a Review">
            <p className="text-sm text-[#464555] font-body mb-4">How was your experience working with this freelancer?</p>
            <StarRating value={starVal} interactive onChange={setStarVal} size="lg" />
            <FormField label="Your Review" className="mt-4">
              <TextArea placeholder="Describe your experience…" />
            </FormField>
            <div className="mt-5 flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary">Submit Review</Button>
            </div>
          </Modal>
        </Section>

        {/* ── TABLE ── */}
        <Section title="Molecules / Table">
          <div className="w-full">
            <Table columns={tableColumns} rows={tableRows} />
          </div>
        </Section>

        {/* ── TAB BAR ── */}
        <Section title="Organisms / TabBar">
          <div className="w-full">
            <TabBar tabs={[{key:'services',label:'Services'},{key:'reviews',label:'Reviews'},{key:'portfolio',label:'Portfolio'}]} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </Section>

        {/* ── CHAT ── */}
        <Section title="Organisms / Chat Components">
          <div className="w-64 border border-[#e7e8e9] rounded-xl overflow-hidden bg-white">
            <ConversationListItem thread={mockThread} active />
            <ConversationListItem thread={{ ...mockThread, otherUser: { name: 'Priya Singh' }, unread: 0 }} />
          </div>
          <div className="w-72 bg-white rounded-xl border border-[#e7e8e9] flex flex-col overflow-hidden">
            <div className="flex flex-col gap-3 p-4">
              <MessageBubble message={mockMsg} isOwn={false} />
              <MessageBubble message={{ ...mockMsg, text: 'Thanks! Will send the wireframes shortly.' }} isOwn />
            </div>
            <TypingIndicator name="Alex" />
            <ChatInputBar onSend={(t) => console.log('send:', t)} />
          </div>
        </Section>

        <div className="mt-16 text-center text-xs text-[#777587] font-body pb-8">
          StuGig Component Library — built from Stitch design tokens. All variants documented in COMPONENTS.md.
        </div>
      </div>
    </div>
  );
}
