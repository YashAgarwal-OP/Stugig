import { clsx } from 'clsx';

const base = 'w-full rounded-lg border px-4 py-2.5 text-sm text-[#191c1d] placeholder:text-[#777587] transition-all duration-150 font-body focus:outline-none';
const normal = 'border-[#c7c4d8] bg-white focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20';
const errorStyle = 'border-[#ba1a1a] bg-[#ffdad6]/30 focus:ring-2 focus:ring-[#ba1a1a]/20';

export function Input({ error, className, ...props }) {
  return (
    <input
      className={clsx(base, error ? errorStyle : normal, className)}
      {...props}
    />
  );
}

export function TextArea({ error, className, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={clsx(base, error ? errorStyle : normal, 'resize-y', className)}
      {...props}
    />
  );
}

export function Select({ error, className, children, ...props }) {
  return (
    <select
      className={clsx(base, error ? errorStyle : normal, 'cursor-pointer', className)}
      {...props}
    >
      {children}
    </select>
  );
}
