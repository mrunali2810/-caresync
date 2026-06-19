import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Activity, Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/login', data);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-medical-900 via-slate-900 to-medical-950 p-4 relative overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-medical-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-md glass-panel-dark rounded-3xl shadow-2xl p-8 relative z-10 border border-slate-700/30 animate-fade-in-up">
        
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-medical-500 p-3.5 rounded-2xl text-white shadow-xl shadow-medical-500/20 mb-4 ring-4 ring-medical-500/10">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">CareSync Hub</h2>
          <p className="text-sm text-slate-400 mt-2">Hospital Appointment Management Portal</p>
        </div>

        {/* Credentials Tip box */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 mb-6 flex items-start space-x-3 text-xs text-slate-300">
          <ShieldAlert className="w-5 h-5 text-medical-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-200">Demonstration Credentials</p>
            <p className="mt-1">
              Email: <span className="font-mono text-medical-300 bg-slate-900 px-1 py-0.5 rounded">admin@gmail.com</span>
            </p>
            <p className="mt-0.5">
              Password: <span className="font-mono text-medical-300 bg-slate-900 px-1 py-0.5 rounded">admin123</span>
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="admin@gmail.com"
                className={`w-full bg-slate-900/60 pl-11 pr-4 py-3 rounded-xl border ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-700 focus:border-medical-500 focus:ring-medical-500/10'
                } text-white text-sm focus:outline-none focus:ring-4 transition-all duration-200`}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-400 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full bg-slate-900/60 pl-11 pr-4 py-3 rounded-xl border ${
                  errors.password ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-700 focus:border-medical-500 focus:ring-medical-500/10'
                } text-white text-sm focus:outline-none focus:ring-4 transition-all duration-200`}
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-400 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-medical-500 hover:bg-medical-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-medical-500/20 hover:shadow-medical-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-medical-500/20 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In to Hub</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500">&copy; 2026 CareSync Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
