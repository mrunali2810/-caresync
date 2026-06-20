import React from 'react';

const StatCard = ({ title, value, icon, loading, colorSchema }) => {
  // Color configuration schema mapping
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500 text-white',
      border: 'border-blue-100/50',
      text: 'text-blue-600',
      gradient: 'from-blue-500/5 to-transparent'
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100/50',
      text: 'text-amber-600',
      gradient: 'from-amber-500/5 to-transparent'
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-500 text-white',
      border: 'border-emerald-100/50',
      text: 'text-emerald-600',
      gradient: 'from-emerald-500/5 to-transparent'
    }
  };

  const currentColors = colorMap[colorSchema] || colorMap.blue;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl skeleton"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded skeleton"></div>
          <div className="h-7 w-12 rounded skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white bg-gradient-to-br ${currentColors.gradient} p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all-300 flex items-center justify-between`}>
      <div className="flex items-center space-x-4">
        {/* Metric Icon Container */}
        <div className={`p-3 rounded-xl ${currentColors.iconBg} shadow-lg shadow-current/10`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
