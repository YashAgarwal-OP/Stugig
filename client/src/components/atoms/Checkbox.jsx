import { clsx } from 'clsx';

// Standard Checkbox
export function Checkbox({ label, error, className, ...props }) {
  return (
    <label className={clsx('flex items-center gap-2.5 cursor-pointer select-none', className)}>
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-[#c7c4d8] text-[#3525cd] focus:ring-[#3525cd] accent-[#3525cd] cursor-pointer"
        {...props}
      />
      {label && <span className="text-sm text-[#191c1d] font-body">{label}</span>}
    </label>
  );
}

// RadioCard — used for role selection on Sign Up
export function RadioCard({ value, name, checked, onChange, label, description, icon, className }) {
  return (
    <label className={clsx(
      'flex flex-col items-center gap-2 p-5 rounded-xl border-2 cursor-pointer select-none transition-all duration-200 text-center',
      checked
        ? 'border-[#3525cd] bg-[#e2dfff]'
        : 'border-[#c7c4d8] bg-white hover:border-[#4f46e5] hover:bg-[#f3f4f5]',
      className
    )}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {icon && <span className="text-3xl">{icon}</span>}
      <span className="font-semibold font-headline text-[#191c1d]">{label}</span>
      {description && <span className="text-xs text-[#464555] font-body">{description}</span>}
    </label>
  );
}
