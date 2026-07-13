import { useRef, useState } from 'react';

export default function FileDropzone({ accept, multiple = false, onFiles, label = 'Drop files here or click to browse', className }) {
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState([]);
  const inputRef = useRef(null);

  const handle = (files) => {
    const arr = Array.from(files);
    setFileNames(arr.map((f) => f.name));
    onFiles?.(arr);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${dragging ? 'border-[#3525cd] bg-[#e2dfff]/40' : 'border-[#c7c4d8] bg-[#f3f4f5] hover:border-[#3525cd]'} ${className ?? ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
    >
      <svg className="w-8 h-8 text-[#3525cd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <p className="text-sm text-[#464555] font-body text-center">{label}</p>
      {fileNames.length > 0 && (
        <ul className="mt-1 text-xs text-[#3525cd] font-label list-disc list-inside">
          {fileNames.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handle(e.target.files)} />
    </div>
  );
}
