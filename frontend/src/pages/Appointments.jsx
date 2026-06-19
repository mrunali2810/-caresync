import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  Filter, 
  CalendarDays,
  FileText
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AppointmentModal from '../components/AppointmentModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Search, Sort, Pagination parameters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('desc'); // 'desc' or 'asc'
  const limit = 7; // Max items per page
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch appointments list from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments', {
        params: {
          search,
          sort,
          page,
          limit
        }
      });
      setAppointments(response.data);
      // Access custom header X-Total-Count
      const total = parseInt(response.headers['x-total-count'] || '0');
      setTotalCount(total);
    } catch (error) {
      toast.error('Failed to retrieve appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Run on page parameters update
  useEffect(() => {
    fetchAppointments();
  }, [page, sort]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  // Toggle sort order
  const handleSortToggle = () => {
    setSort(prev => (prev === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  };

  // Handle create or update modal submit
  const handleModalSubmit = async (data) => {
    setActionLoading(true);
    try {
      if (selectedAppointment) {
        // Edit Operation
        await api.put(`/appointments/${selectedAppointment.id}`, data);
        toast.success('Appointment details updated successfully');
      } else {
        // Create Operation
        await api.post('/appointments', data);
        toast.success('New appointment booked successfully');
      }
      setIsModalOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle appointment deletion
  const handleDeleteConfirm = async () => {
    if (!selectedAppointment) return;
    setActionLoading(true);
    try {
      await api.delete(`/appointments/${selectedAppointment.id}`);
      toast.success('Appointment deleted successfully');
      setIsDeleteOpen(false);
      setSelectedAppointment(null);
      
      // If we deleted the last item on the page, go to the previous page
      if (appointments.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Failed to delete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const schemas = {
      Pending: 'bg-amber-50 text-amber-600 border-amber-100',
      Confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
      Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      Cancelled: 'bg-rose-50 text-rose-600 border-rose-100'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${schemas[status] || schemas.Pending}`}>
        {status}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <div className="flex-1 pl-64 pt-20 flex flex-col">
        <Navbar title="Appointment Management" />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          
          {/* Header Controls (Add appointment, search, sort) */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient name..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-medical-500 focus:ring-4 focus:ring-medical-500/10 text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all-300"
              >
                Search
              </button>
            </form>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSortToggle}
                className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all-300"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Date: {sort === 'desc' ? 'Newest' : 'Oldest'}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-1.5 bg-medical-600 hover:bg-medical-700 text-white font-semibold px-5 py-2 rounded-xl text-sm shadow-md shadow-medical-600/25 transition-all-300"
              >
                <Plus className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Appt ID</th>
                    <th className="px-6 py-4">Patient Info</th>
                    <th className="px-6 py-4">Assigned Doctor</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Symptoms</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {loading ? (
                    Array(limit).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-100 rounded"></div></td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="h-4 w-28 bg-slate-100 rounded"></div>
                            <div className="h-3.5 w-36 bg-slate-100 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="h-4 w-20 bg-slate-100 rounded"></div>
                            <div className="h-3.5 w-12 bg-slate-100 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-lg"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-slate-100 rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-semibold">No appointments found</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting search filters or book a new appointment.</p>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/50 transition-all-300">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-slate-500">
                          {appt.appointment_id}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">{appt.patient_name}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{appt.email}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{appt.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {appt.doctor_name}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-700">{appt.appointment_date}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{appt.appointment_time.slice(0, 5)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          {appt.symptoms ? (
                            <p className="text-xs text-slate-500 truncate" title={appt.symptoms}>
                              {appt.symptoms}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-300 italic">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(appt.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedAppointment(appt);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-medical-600 transition-all-300"
                              title="Edit Appointment"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appt);
                                setIsDeleteOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all-300"
                              title="Delete Appointment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {!loading && appointments.length > 0 && (
              <div className="bg-slate-50/75 border-t border-slate-100 px-6 py-4.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Showing Page {page} of {totalPages} &bull; Total {totalCount} Records
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all-300"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  
                  <span className="text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                    {page}
                  </span>
                  
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all-300"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <footer className="h-14 bg-white border-t border-slate-100 flex items-center justify-center text-xs text-slate-400 mt-auto">
          <span>&copy; 2026 CareSync Systems. All rights reserved. &bull; Secure Clinic Dashboard</span>
        </footer>
      </div>

      {/* Appointment Creation / Editing modal dialog */}
      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={handleModalSubmit}
        appointment={selectedAppointment}
        loading={actionLoading}
      />

      {/* Deletion verification dialog */}
      <ConfirmDeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </div>
  );
};

export default Appointments;
