import { useState } from 'react';
import { clsx } from 'clsx';

export default function PasswordInput({ error, className, ...props }) {
  const [show, setShow] = useState(false);
  const base = 'w-full rounded-lg border px-4 py-2.5 pr-11 text-sm text-[#191c1d] placeholder:text-[#777587] transition-all duration-150 font-body focus:outline-none';
  const normal = 'border-[#c7c4d8] bg-white focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20';
  const errorStyle = 'border-[#ba1a1a] bg-[#ffdad6]/30 focus:ring-2 focus:ring-[#ba1a1a]/20';

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className={clsx(base, error ? errorStyle : normal, className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777587] hover:text-[#3525cd] transition-colors"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        )}
      </button>
    </div>
  );
}
