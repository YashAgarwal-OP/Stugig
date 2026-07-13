// Placeholder page used for routes not yet built
export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#e2dfff] flex items-center justify-center">
        <svg className="w-8 h-8 text-[#3525cd]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
      </div>
      <h1 className="text-2xl font-bold font-headline text-[#191c1d]">{title}</h1>
      <p className="text-[#464555] font-body text-sm">This page will be built in an upcoming prompt.</p>
    </div>
  );
}
