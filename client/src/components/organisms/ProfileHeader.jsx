import { Avatar } from '../atoms/Avatar';
import { StarRating } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { clsx } from 'clsx';

// ProfileHeaderBanner — used on Public Profile
export function ProfileHeaderBanner({ user, coverUrl }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#e7e8e9] shadow-sm bg-white">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-[#3525cd] to-[#4f46e5] relative">
        {coverUrl && <img src={coverUrl} alt="Cover" className="w-full h-full object-cover opacity-50" />}
      </div>
      {/* Info row */}
      <div className="px-6 pb-5 flex items-end gap-4 -mt-8">
        <Avatar src={user?.avatarUrl} name={user?.name} size="xl" className="border-4 border-white shadow-md shrink-0" />
        <div className="pb-1 flex-1 min-w-0">
          <h1 className="font-bold font-headline text-[#191c1d] text-xl">{user?.name}</h1>
          <p className="text-sm text-[#464555] font-body">{user?.bio}</p>
          {user?.rating !== undefined && (
            <div className="mt-1">
              <StarRating value={user.rating} size="sm" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pb-1">
          {user?.skills?.slice(0, 5).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
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
