import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Users, 
  CalendarClock, 
  Hourglass, 
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_appointments: 0,
    today_appointments: 0,
    pending_appointments: 0,
    trends: []
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats (includes last 7 days trends)
        const statsRes = await api.get('/dashboard');
        setStats(statsRes.data);

        // Fetch recent appointments (first page, limit 5, sorted desc)
        const appointmentsRes = await api.get('/appointments?page=1&limit=5&sort=desc');
        setRecentAppointments(appointmentsRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard metrics');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Map status badges
  const getStatusBadge = (status) => {
    const schemas = {
      Pending: 'bg-amber-50 text-amber-600 border-amber-100',
      Confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
      Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      Cancelled: 'bg-rose-50 text-rose-600 border-rose-100'
    };
    const current = schemas[status] || schemas.Pending;
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${current}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main dashboard content panel */}
      <div className="flex-1 pl-64 pt-20 flex flex-col">
        <Navbar title="Dashboard Overview" />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          
          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-medical-800 to-medical-950 rounded-2xl p-6 shadow-md border border-medical-800/10 flex flex-col md:flex-row justify-between items-start md:items-center text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome to Clinic Hub</h1>
              <p className="text-medical-200 text-sm mt-1">Here is a summary of today's schedules and appointment trends.</p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="mt-4 md:mt-0 flex items-center space-x-2 bg-white text-medical-800 font-semibold px-4.5 py-2 rounded-xl text-sm shadow hover:bg-slate-100 transition-all-300"
            >
              <span>Manage Appointments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Statistics grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Bookings" 
              value={stats.total_appointments} 
              icon={<Users className="w-6 h-6" />}
              loading={loading}
              colorSchema="blue"
            />
            <StatCard 
              title="Today's Appointments" 
              value={stats.today_appointments} 
              icon={<CalendarClock className="w-6 h-6" />}
              loading={loading}
              colorSchema="emerald"
            />
            <StatCard 
              title="Pending Requests" 
              value={stats.pending_appointments} 
              icon={<Hourglass className="w-6 h-6" />}
              loading={loading}
              colorSchema="amber"
            />
          </div>

          {/* Graphical representation & Recent List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-medical-600" />
                  <h3 className="text-lg font-bold text-slate-800">Booking Activity Trend</h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md">
                  Last 7 Days
                </span>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                {loading ? (
                  <div className="w-full h-full rounded-xl skeleton"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #f1f5f9', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        name="Appointments"
                        stroke="#0ea5e9" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Bookings List Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-800">Recent Bookings</h3>
                </div>
                <button
                  onClick={() => navigate('/appointments')}
                  className="text-xs text-medical-600 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 py-1">
                      <div className="w-10 h-10 rounded-xl skeleton"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-24 rounded skeleton"></div>
                        <div className="h-3 w-16 rounded skeleton"></div>
                      </div>
                      <div className="w-16 h-6 rounded skeleton"></div>
                    </div>
                  ))
                ) : recentAppointments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <p className="text-sm">No recent bookings found.</p>
                  </div>
                ) : (
                  recentAppointments.map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-100 transition-all-300">
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {appt.patient_name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {appt.doctor_name} &bull; {appt.appointment_date}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(appt.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
        
        {/* Sticky Footer */}
        <footer className="h-14 bg-white border-t border-slate-100 flex items-center justify-center text-xs text-slate-400 mt-auto">
          <span>&copy; 2026 CareSync Systems. All rights reserved. &bull; Secure Clinic Dashboard</span>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
