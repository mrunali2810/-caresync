import React from 'react';
import { Calendar } from 'lucide-react';

const Navbar = ({ title }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 fixed right-0 top-0 left-64 z-20 shadow-sm">
      {/* Dynamic Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
          {title}
        </h2>
      </div>

      {/* Right Menu Controls */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-slate-500 bg-slate-50/60 px-4 py-2 rounded-xl border border-slate-100 text-sm font-medium">
          <Calendar className="w-4.5 h-4.5 text-medical-500" />
          <span>{today}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
