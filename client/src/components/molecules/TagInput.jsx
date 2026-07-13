import { useState, useRef } from 'react';

export default function TagInput({ value = [], onChange, placeholder = 'Add a skill and press Enter…', maxTags = 20 }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const add = (tag) => {
    const cleaned = tag.trim();
    if (cleaned && !value.includes(cleaned) && value.length < maxTags) {
      onChange?.([...value, cleaned]);
    }
    setInputVal('');
  };

  const remove = (tag) => onChange?.(value.filter((t) => t !== tag));

  const handleKey = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      add(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && value.length) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-2 items-center w-full rounded-lg border border-[#c7c4d8] bg-white px-3 py-2 min-h-[44px] focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20 transition-all cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 bg-[#e2dfff] text-[#3525cd] text-xs font-semibold font-label rounded-full px-2.5 py-0.5">
          {tag}
          <button type="button" onClick={(e) => { e.stopPropagation(); remove(tag); }} className="hover:text-[#ba1a1a] transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => inputVal && add(inputVal)}
        placeholder={value.length ? '' : placeholder}
        className="flex-1 min-w-24 text-sm bg-transparent outline-none text-[#191c1d] placeholder:text-[#777587] font-body"
      />
    </div>
  );
}
