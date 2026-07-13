import { clsx } from 'clsx';

// Avatar with image or fallback initials
export function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const initials = name
    ? name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className={clsx('rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#4f46e5] text-white font-semibold font-label border-2 border-white shadow-sm', sizes[size], className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// StarRating — display-only or interactive
export function StarRating({ value = 0, max = 5, interactive = false, onChange, size = 'md' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={clsx(
              sizes[size],
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default',
              filled ? 'text-[#a44100]' : 'text-[#c7c4d8]'
            )}
            aria-label={`${i + 1} star`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      <span className="ml-1 text-sm text-[#464555] font-label">{typeof value === 'number' ? value.toFixed(1) : value}</span>
    </div>
  );
}
