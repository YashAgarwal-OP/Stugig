import { clsx } from 'clsx';

// Generic Card base
export function Card({ children, className, elevated = false, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-[#e7e8e9]',
        elevated ? 'shadow-md' : 'shadow-sm',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// StatCard — used on dashboards
export function StatCard({ label, value, icon, trend, className }) {
  return (
    <Card className={clsx('p-5 flex items-center gap-4', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] shrink-0">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-[#464555] font-label uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold font-headline text-[#191c1d]">{value}</p>
        {trend && <p className="text-xs text-[#006a61] mt-0.5">{trend}</p>}
      </div>
    </Card>
  );
}

// ServiceCard — used on Browse Services
export function ServiceCard({ service, onClick }) {
  const { title, price, deliveryTime, category, imageUrl, freelancerId } = service || {};
  return (
    <Card hover className="overflow-hidden" onClick={onClick}>
      <div className="h-36 bg-[#e2dfff] relative">
        {imageUrl && <img src={imageUrl} alt={title} className="w-full h-full object-cover" />}
        <span className="absolute top-3 right-3 bg-[#a44100] text-white text-xs font-semibold px-2.5 py-1 rounded-full font-label">
          ${price}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#3525cd] font-label uppercase tracking-wide mb-1">{category}</p>
        <h3 className="font-semibold font-headline text-[#191c1d] text-sm line-clamp-2 mb-3">{title}</h3>
        <div className="flex items-center justify-between text-xs text-[#464555]">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {deliveryTime}
          </span>
          {freelancerId?.name && <span className="font-medium truncate ml-2">{freelancerId.name}</span>}
        </div>
      </div>
    </Card>
  );
}

// JobCard — list-row variant
export function JobCardRow({ job, onClick }) {
  const { title, category, budgetMin, budgetMax, deadline, status, skillsRequired = [] } = job || {};
  return (
    <Card hover className="p-4 flex items-center gap-4" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold font-headline text-[#191c1d] text-sm truncate">{title}</h3>
          <span className="shrink-0 bg-[#e2dfff] text-[#3525cd] text-xs px-2 py-0.5 rounded-full font-label">{category}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#464555]">
          <span>${budgetMin}–${budgetMax}</span>
          <span>·</span>
          <span>Due {deadline ? new Date(deadline).toLocaleDateString() : '—'}</span>
        </div>
        {skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {skillsRequired.slice(0, 4).map((s) => (
              <span key={s} className="bg-[#e2dfff] text-[#3525cd] text-xs px-2 py-0.5 rounded-full font-label">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full font-label ${status === 'open' ? 'bg-[#e2dfff] text-[#3525cd]' : 'bg-[#e1e3e4] text-[#464555]'}`}>{status}</span>
      </div>
    </Card>
  );
}

// JobCard — grid variant
export function JobCardGrid({ job, matchScore, onClick }) {
  const { title, category, budgetMin, budgetMax, deadline, skillsRequired = [] } = job || {};
  return (
    <Card hover className="p-5 flex flex-col gap-3" onClick={onClick}>
      {matchScore !== undefined && (
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#8B5CF6]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          <span className="text-xs font-semibold text-[#8B5CF6] font-label">{Math.round(matchScore)}% match</span>
        </div>
      )}
      <div>
        <p className="text-xs text-[#3525cd] font-label uppercase tracking-wide mb-1">{category}</p>
        <h3 className="font-semibold font-headline text-[#191c1d] line-clamp-2">{title}</h3>
      </div>
      <div className="flex items-center justify-between text-sm text-[#464555]">
        <span className="font-semibold text-[#191c1d]">${budgetMin}–${budgetMax}</span>
        <span>{deadline ? new Date(deadline).toLocaleDateString() : '—'}</span>
      </div>
      {skillsRequired.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skillsRequired.slice(0, 3).map((s) => (
            <span key={s} className="bg-[#e2dfff] text-[#3525cd] text-xs px-2 py-0.5 rounded-full font-label">{s}</span>
          ))}
        </div>
      )}
    </Card>
  );
}

// ReviewListItem
export function ReviewListItem({ review }) {
  const { reviewerId, rating, comment, createdAt } = review || {};
  return (
    <div className="border-b border-[#e7e8e9] py-4 last:border-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-xs font-semibold font-label shrink-0">
          {reviewerId?.name?.[0] ?? '?'}
        </div>
        <div>
          <p className="text-sm font-semibold font-label text-[#191c1d]">{reviewerId?.name ?? 'Anonymous'}</p>
          <p className="text-xs text-[#777587]">{createdAt ? new Date(createdAt).toLocaleDateString() : ''}</p>
        </div>
        <div className="ml-auto">
          <span className="text-[#a44100] font-semibold text-sm">{'★'.repeat(Math.round(rating ?? 0))}</span>
        </div>
      </div>
      <p className="text-sm text-[#464555] font-body">{comment}</p>
    </div>
  );
}

// TransactionRow — used in Payment History
export function TransactionRow({ payment }) {
  const { jobId, totalCharged, commissionAmount, status, createdAt } = payment || {};
  const statusColors = { completed: 'text-[#006a61]', pending: 'text-[#a44100]', refunded: 'text-[#ba1a1a]' };
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#e7e8e9] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-label text-[#191c1d] truncate">{jobId?.title ?? 'Job'}</p>
        <p className="text-xs text-[#777587]">{createdAt ? new Date(createdAt).toLocaleDateString() : ''}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-[#191c1d]">${totalCharged?.toFixed(2)}</p>
        <p className="text-xs text-[#777587]">Fee: ${commissionAmount?.toFixed(2)}</p>
      </div>
      <span className={`text-xs font-semibold font-label capitalize ${statusColors[status] ?? 'text-[#464555]'}`}>{status}</span>
    </div>
  );
}
// PortfolioCard — used in FreelancerDashboard and PublicProfile
export function PortfolioCard({ item, onDelete }) {
  const { title, description, imageUrl, projectUrl } = item || {};
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video bg-[#f3f4f5]">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#777587]">No Image</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#191c1d] mb-1 font-headline truncate">{title}</h3>
        <p className="text-sm text-[#464555] font-body line-clamp-3 mb-4 flex-1">{description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e7e8e9]">
          {projectUrl ? (
            <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#3525cd] hover:underline">
              View Project
            </a>
          ) : (
            <span />
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item._id)}
              className="text-sm font-semibold text-[#ba1a1a] hover:opacity-80"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
