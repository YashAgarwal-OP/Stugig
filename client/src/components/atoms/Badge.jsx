import { clsx } from 'clsx';

// Badge / skill tag
export function Badge({ children, variant = 'primary', className }) {
  const variants = {
    primary:   'bg-[#e2dfff] text-[#3525cd]',
    secondary: 'bg-[#89f5e7] text-[#006a61]',
    accent:    'bg-[#ffdbcc] text-[#7e3000]',
    neutral:   'bg-[#e1e3e4] text-[#464555]',
  };
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-label', variants[variant], className)}>
      {children}
    </span>
  );
}

// Status pill with semantic colors
const statusMap = {
  open:          'bg-[#e2dfff] text-[#3525cd]',
  pending:       'bg-[#ffdbcc] text-[#7e3000]',
  'in-progress': 'bg-[#89f5e7] text-[#006a61]',
  completed:     'bg-[#86f2e4] text-[#005049]',
  paid:          'bg-[#86f2e4] text-[#005049]',
  refunded:      'bg-[#ffdad6] text-[#93000a]',
  rejected:      'bg-[#ffdad6] text-[#93000a]',
  accepted:      'bg-[#89f5e7] text-[#006a61]',
  disputed:      'bg-[#ffdbcc] text-[#7e3000]',
  active:        'bg-[#86f2e4] text-[#005049]',
  paused:        'bg-[#e1e3e4] text-[#464555]',
  suspended:     'bg-[#ffdad6] text-[#93000a]',
  closed:        'bg-[#e1e3e4] text-[#464555]',
};

export function StatusPill({ status, className }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  return (
    <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold font-label whitespace-nowrap', statusMap[status] ?? 'bg-[#e1e3e4] text-[#464555]', className)}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
