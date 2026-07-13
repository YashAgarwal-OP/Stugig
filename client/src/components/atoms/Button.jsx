import { clsx } from 'clsx';

const base = 'inline-flex items-center justify-center gap-2 font-semibold font-label transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg select-none';

const variants = {
  primary:   'bg-[#3525cd] text-white hover:bg-[#2419a0] focus:ring-[#3525cd] shadow-sm hover:shadow-md',
  secondary: 'bg-transparent text-[#3525cd] border border-[#3525cd] hover:bg-[#e2dfff] focus:ring-[#3525cd]',
  ghost:     'bg-transparent text-[#464555] hover:bg-[#edeeef] focus:ring-[#777587]',
  accent:    'bg-[#a44100] text-white hover:bg-[#7e3000] focus:ring-[#a44100] shadow-sm hover:shadow-md',
  danger:    'bg-[#ba1a1a] text-white hover:bg-[#93000a] focus:ring-[#ba1a1a]',
  disabled:  'bg-[#e1e3e4] text-[#777587] cursor-not-allowed pointer-events-none',
};

const sizes = {
  sm:  'px-3 py-1.5 text-sm',
  md:  'px-5 py-2.5 text-sm',
  lg:  'px-7 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}) {
  const v = disabled ? 'disabled' : variant;
  return (
    <button
      disabled={disabled}
      className={clsx(base, variants[v], sizes[size], className)}
      {...props}
    >
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
