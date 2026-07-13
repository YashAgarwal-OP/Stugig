import { useState } from 'react';
import { Checkbox } from '../atoms/Checkbox';

// SearchBar
export function SearchBar({ placeholder = 'Search…', value, onChange, onSubmit, className }) {
  return (
    <form onSubmit={onSubmit} className={`relative ${className ?? ''}`}>
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#c7c4d8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#191c1d] placeholder:text-[#777587] focus:outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 transition-all"
      />
    </form>
  );
}

// FilterPanel
export function FilterPanel({ categories = [], filters, onFilterChange }) {
  const update = (key, value) => onFilterChange?.({ ...filters, [key]: value });

  return (
    <aside className="bg-white rounded-2xl border border-[#e7e8e9] shadow-sm p-5 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold font-label text-[#191c1d] mb-3">Category</h3>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <Checkbox
              key={cat}
              label={cat}
              checked={filters?.categories?.includes(cat) ?? false}
              onChange={(e) => {
                const cur = filters?.categories ?? [];
                update('categories', e.target.checked ? [...cur, cat] : cur.filter((c) => c !== cat));
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold font-label text-[#191c1d] mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters?.minPrice ?? ''}
            onChange={(e) => update('minPrice', e.target.value)}
            className="w-full rounded-lg border border-[#c7c4d8] px-3 py-1.5 text-sm focus:outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20"
          />
          <span className="text-[#777587] text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters?.maxPrice ?? ''}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="w-full rounded-lg border border-[#c7c4d8] px-3 py-1.5 text-sm focus:outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold font-label text-[#191c1d] mb-3">Min Rating</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => update('minRating', r === filters?.minRating ? null : r)}
              className={`w-8 h-8 rounded-full text-sm font-semibold font-label transition-all ${filters?.minRating === r ? 'bg-[#a44100] text-white' : 'bg-[#e7e8e9] text-[#464555] hover:bg-[#c7c4d8]'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
