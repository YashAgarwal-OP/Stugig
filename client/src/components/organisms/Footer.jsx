import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#191c1d] text-[#c7c4d8] py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-4 gap-8">
        <div>
          <span className="font-bold font-headline text-white text-lg">Stu<span className="text-[#ffb695]">Gig</span></span>
          <p className="text-xs mt-2 text-[#777587] font-body">The student freelance marketplace. Earn, learn, collaborate.</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold font-label uppercase tracking-wide text-[#777587] mb-3">Marketplace</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
            <li><Link to="/jobs" className="hover:text-white transition-colors">Find Jobs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold font-label uppercase tracking-wide text-[#777587] mb-3">Platform</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold font-label uppercase tracking-wide text-[#777587] mb-3">Legal</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
            <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-8 mt-8 pt-6 border-t border-[#2e3132] text-xs text-[#777587] text-center font-body">
        © {new Date().getFullYear()} StuGig. Built for students, by students.
      </div>
    </footer>
  );
}
