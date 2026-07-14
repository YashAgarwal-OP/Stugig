import { Avatar } from '../atoms/Avatar';
import { StarRating } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

// ProfileHeaderBanner — used on Public Profile
export function ProfileHeaderBanner({ user, coverUrl, isOwner = false }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl overflow-hidden border border-[#e7e8e9] shadow-sm bg-white">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-[#3525cd] to-[#4f46e5] relative">
        {coverUrl && <img src={coverUrl} alt="Cover" className="w-full h-full object-cover opacity-50" />}
      </div>
      {/* Info row */}
      <div className="px-6 pb-5 flex items-end gap-4 -mt-8">
        <Avatar src={user?.profilePhotoUrl} name={user?.name} size="xl" className="border-4 border-white shadow-md shrink-0" />
        <div className="pb-1 flex-1 min-w-0">
          <h1 className="font-bold font-headline text-[#191c1d] text-xl">{user?.name}</h1>
          {user?.tagline && <p className="text-sm font-semibold text-[#3525cd] font-body mt-0.5">{user.tagline}</p>}
          {user?.bio && <p className="text-sm text-[#464555] font-body mt-1 line-clamp-2">{user.bio}</p>}
          {user?.rating !== undefined && (
            <div className="mt-1">
              <StarRating value={user.rating} size="sm" />
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 pb-1">
          {isOwner && (
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-1.5 text-xs font-semibold font-label text-[#3525cd] border border-[#3525cd] px-3 py-1.5 rounded-full hover:bg-[#e2dfff] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          )}
          <div className="flex flex-wrap gap-1.5 justify-end">
            {user?.skills?.slice(0, 5).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// TabBar — generic horizontal tab navigation
export function TabBar({ tabs = [], activeTab, onTabChange }) {
  return (
    <div className="flex gap-0 border-b border-[#e7e8e9] bg-white rounded-t-xl overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange?.(tab.key)}
          className={clsx(
            'px-5 py-3 text-sm font-semibold font-label transition-all duration-150 border-b-2 -mb-px',
            activeTab === tab.key
              ? 'text-[#3525cd] border-[#3525cd]'
              : 'text-[#464555] border-transparent hover:text-[#3525cd] hover:border-[#c7c4d8]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
