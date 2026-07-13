// AIFeatureCard — gradient-border sparkle-icon wrapper
// Used for both Job Matchmaker and Smart Bidding Assistant blocks
export default function AIFeatureCard({ title, description, icon, action, children, className }) {
  return (
    <div className={`relative rounded-2xl p-[2px] bg-gradient-to-br from-[#8B5CF6] via-[#3525cd] to-[#006a61] shadow-lg ${className ?? ''}`}>
      <div className="bg-white rounded-2xl p-5 h-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3525cd] flex items-center justify-center text-white shrink-0">
            {icon ?? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold font-headline text-[#191c1d] text-sm">{title}</h3>
              <svg className="w-3.5 h-3.5 text-[#8B5CF6]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            {description && <p className="text-xs text-[#464555] font-body mt-0.5">{description}</p>}
          </div>
        </div>
        {children}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
