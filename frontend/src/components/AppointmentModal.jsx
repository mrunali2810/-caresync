import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Clock, User, Mail, Phone, FileText, ChevronDown } from 'lucide-react';

const AppointmentModal = ({ isOpen, onClose, onSubmit, appointment, loading }) => {
  const isEdit = !!appointment;
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Reset/populate form when appointment changes
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        reset({
          patient_name: appointment.patient_name || '',
          email: appointment.email || '',
          phone: appointment.phone || '',
          doctor_name: appointment.doctor_name || '',
          appointment_date: appointment.appointment_date || '',
          appointment_time: appointment.appointment_time ? appointment.appointment_time.slice(0, 5) : '', // Format HH:MM
          symptoms: appointment.symptoms || '',
          status: appointment.status || 'Pending'
        });
      } else {
        reset({
          patient_name: '',
          email: '',
          phone: '',
          doctor_name: '',
          appointment_date: '',
          appointment_time: '',
          symptoms: '',
          status: 'Pending'
        });
      }
    }
  }, [appointment, isOpen, reset]);

  if (!isOpen) return null;

  const doctorOptions = [
    'Dr. Sharma (Cardiology)',
    'Dr. Patil (Pediatrics)',
    'Dr. Verma (Neurology)',
    'Dr. Iyer (General Medicine)',
    'Dr. Das (Orthopedics)'
  ];

  const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const handleFormSubmit = (data) => {
    // If the full doctor option string is selected, clean it up to just the doctor name
    const cleanedDoctorName = data.doctor_name.split(' (')[0];
    onSubmit({ ...data, doctor_name: cleanedDoctorName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-medical-50/50 to-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isEdit ? 'Edit Appointment Details' : 'Book New Appointment'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isEdit ? 'Update appointment time, doctor, or status' : 'Enter patient information and scheduling choice'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Patient Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="Mrunali Patil"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  errors.patient_name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-medical-500/20 focus:border-medical-500'
                } focus:outline-none focus:ring-4 text-sm`}
                {...register('patient_name', { required: 'Patient name is required' })}
              />
            </div>
            {errors.patient_name && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.patient_name.message}</span>
            )}
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  placeholder="mrunali@gmail.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-medical-500/20 focus:border-medical-500'
                  } focus:outline-none focus:ring-4 text-sm`}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-rose-500 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-medical-500/20 focus:border-medical-500'
                  } focus:outline-none focus:ring-4 text-sm`}
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'Phone number must be exactly 10 digits'
                    }
                  })}
                />
              </div>
              {errors.phone && (
                <span className="text-[11px] text-rose-500 mt-1 block">{errors.phone.message}</span>
              )}
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Assigned Doctor
            </label>
            <div className="relative">
              <select
                className={`w-full px-4 py-2.5 rounded-xl border appearance-none ${
                  errors.doctor_name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-medical-500/20 focus:border-medical-500'
                } focus:outline-none focus:ring-4 text-sm`}
                {...register('doctor_name', { required: 'Please select a doctor' })}
              >
                <option value="">Select a Doctor</option>
                {doctorOptions.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 pointer-events-none">
                <ChevronDown className="w-4.5 h-4.5" />
              </span>
            </div>
            {errors.doctor_name && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.doctor_name.message}</span>
            )}
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Preferred Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Calendar className="w-4.5 h-4.5" />
                </span>
                <input
                  type="date"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.appointment_date ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-medical-500/20 focus:border-medical-500'
                  } focus:outline-none focus:ring-4 text-sm`}
                  {...register('appointment_date', { required: 'Preferred date is required' })}
                />
              </div>
              {errors.appointment_date && (
                <span className="text-[11px] text-rose-500 mt-1 block">{errors.appointment_date.message}</span>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Preferred Time
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Clock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="time"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.appointment_time ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-medical-500/20 focus:border-medical-500'
                  } focus:outline-none focus:ring-4 text-sm`}
                  {...register('appointment_time', { required: 'Preferred time is required' })}
                />
              </div>
              {errors.appointment_time && (
                <span className="text-[11px] text-rose-500 mt-1 block">{errors.appointment_time.message}</span>
              )}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Symptoms / Reason for Visit
            </label>
            <div className="relative">
              <span className="absolute top-3.5 left-3.5 text-slate-400">
                <FileText className="w-4.5 h-4.5" />
              </span>
              <textarea
                placeholder="Fever, cough, or routine checkup..."
                rows="3"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-medical-500/20 focus:border-medical-500 focus:outline-none text-sm resize-none"
                {...register('symptoms')}
              ></textarea>
            </div>
          </div>

          {/* Status (Only Visible in Edit Mode) */}
          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Appointment Status
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 appearance-none focus:ring-4 focus:ring-medical-500/20 focus:border-medical-500 focus:outline-none text-sm"
                  {...register('status', { required: 'Status is required' })}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 pointer-events-none">
                  <ChevronDown className="w-4.5 h-4.5" />
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons Footer inside Form container */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-medical-600 hover:bg-medical-700 shadow-md shadow-medical-600/25 transition-all-300 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Book Appointment'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
