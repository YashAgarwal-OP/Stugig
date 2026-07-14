import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../components/organisms/DashboardShell';
import { Card } from '../components/molecules/Card';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import { Avatar } from '../components/atoms/Avatar';
import TagInput from '../components/molecules/TagInput';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

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

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const navItems = user?.role === 'client' ? clientNavItems : freelancerNavItems;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    tagline: user?.tagline || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    yearsOfExperience: user?.yearsOfExperience || '',
    skills: user?.skills || [],
    languages: user?.languages || [],
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhotoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      if (profilePhoto) {
        data.append('profilePhoto', profilePhoto);
      }
      
      data.append('name', formData.name);
      data.append('tagline', formData.tagline);
      data.append('phone', formData.phone);
      data.append('location', formData.location);
      data.append('bio', formData.bio);
      
      if (user?.role === 'freelancer') {
        data.append('yearsOfExperience', formData.yearsOfExperience);
        data.append('skills', JSON.stringify(formData.skills));
        data.append('languages', JSON.stringify(formData.languages));
      }

      const res = await client.put('/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Sync the updated user data into auth context + localStorage
      updateUser(res.data);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell navItems={navItems}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline text-[#191c1d]">Edit Profile</h1>
          <p className="text-sm text-[#464555] font-body mt-1">Update your personal information and profile photo.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 rounded-lg text-[#ba1a1a] text-sm font-body">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-[#006a61]/10 border border-[#006a61]/30 rounded-lg text-[#006a61] text-sm font-body">
                {success}
              </div>
            )}

            {/* Profile Photo Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-[#e7e8e9]">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar 
                  src={photoPreview} 
                  name={formData.name} 
                  size="xl" 
                  className="border-4 border-white shadow-sm transition-opacity group-hover:opacity-80" 
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[#191c1d] font-headline mb-1">Profile Photo</h3>
                <p className="text-xs text-[#777587] font-body mb-3">Upload a clear photo to help others recognize you.</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Choose Image
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-[#c7c4d8] rounded-lg bg-white text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                />
              </FormField>

              <FormField label="Headline / Tagline">
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g. Senior React Developer"
                  className="w-full p-2.5 border border-[#c7c4d8] rounded-lg bg-white text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                />
              </FormField>

              <FormField label="Location">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. New York, USA"
                  className="w-full p-2.5 border border-[#c7c4d8] rounded-lg bg-white text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                />
              </FormField>

              <FormField label="Phone Number">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 border border-[#c7c4d8] rounded-lg bg-white text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                />
              </FormField>
            </div>

            <FormField label="Bio / About">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-2.5 border border-[#c7c4d8] rounded-lg bg-white text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none resize-y"
                placeholder="Tell us a little about yourself..."
              />
            </FormField>

            {/* Freelancer Specific Info */}
            {user?.role === 'freelancer' && (
              <div className="space-y-6 pt-6 border-t border-[#e7e8e9]">
                <h3 className="font-semibold text-[#191c1d] font-headline">Professional Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Years of Experience">
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      className="w-full p-2.5 border border-[#c7c4d8] rounded-lg bg-white text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                    />
                  </FormField>
                  <div className="col-span-1 md:col-span-2">
                     <FormField label="Languages Spoken">
                        <TagInput
                          value={formData.languages}
                          onChange={(newTags) => setFormData(prev => ({ ...prev, languages: newTags }))}
                          placeholder="e.g. English, Spanish (press Enter)"
                        />
                      </FormField>
                  </div>
                   <div className="col-span-1 md:col-span-2">
                     <FormField label="Skills">
                        <TagInput
                          value={formData.skills}
                          onChange={(newTags) => setFormData(prev => ({ ...prev, skills: newTags }))}
                          placeholder="e.g. React, UI Design (press Enter)"
                        />
                      </FormField>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-[#e7e8e9] gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
            
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
