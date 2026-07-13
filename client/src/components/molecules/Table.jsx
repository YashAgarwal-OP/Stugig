import { clsx } from 'clsx';
import { useState } from 'react';

export default function Table({ columns = [], rows = [], className, onRowClick }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const va = a[sortKey] ?? '';
        const vb = b[sortKey] ?? '';
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      })
    : rows;

  return (
    <div className={clsx('w-full overflow-x-auto rounded-2xl border border-[#e7e8e9] shadow-sm bg-white', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e7e8e9] bg-[#f3f4f5]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold font-label text-[#464555] uppercase tracking-wide select-none',
                  col.sortable && 'cursor-pointer hover:text-[#3525cd] transition-colors'
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-[#c7c4d8]">
                      {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-[#777587] font-body">No data.</td></tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={i}
                className={clsx('border-b border-[#e7e8e9] last:border-0 transition-colors', onRowClick && 'cursor-pointer hover:bg-[#f3f4f5]')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[#191c1d] font-body">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
