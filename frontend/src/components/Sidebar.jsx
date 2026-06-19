import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileCode2, 
  LogOut, 
  Activity, 
  UserCheck 
} from 'lucide-react';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin', email: 'admin@gmail.com' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: <CalendarDays className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 shadow-xl border-r border-slate-800 z-30">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-gradient-to-r from-medical-900 to-slate-900">
        <div className="bg-medical-500 p-2 rounded-lg text-white shadow-lg shadow-medical-500/30">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            CareSync
          </h1>
          <span className="text-[10px] text-medical-400 font-semibold tracking-widest uppercase">
            Medical Hub
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-medical-600 text-white shadow-md shadow-medical-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* External Link for Swagger API Docs */}
        <a
          href="/swagger"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          <FileCode2 className="w-5 h-5 text-indigo-400" />
          <div className="flex items-center space-x-1">
            <span>Swagger APIs</span>
          </div>
        </a>
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/40 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-medical-400 shadow-inner">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-200">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-200 font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
