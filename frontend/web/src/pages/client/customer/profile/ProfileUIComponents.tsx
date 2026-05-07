import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

// ===========================
// Card Component
// ===========================
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-sm shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

// ===========================
// FormField Component
// ===========================
export const FormField: React.FC<{
  label: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, icon, error, className = '', children }) => (
  <div className={className}>
    <label className="block text-sm font-medium mb-2 text-slate-700">{label}</label>
    <div className="relative">
      {React.isValidElement(icon) && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 15 })}
        </div>
      )}
      {children}
    </div>
    {error && <p className="text-red-500 text-[11px] mt-1.5 font-medium ml-1">{error}</p>}
  </div>
);

// ===========================
// PasswordFormField Component
// ===========================
export const PasswordFormField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
}> = ({ label, placeholder, value, onChange, show, onToggle, error }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-2">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-2.5 py-2 rounded-sm text-sm border focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all pr-10 ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-alpha-blue'}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
    {error && <p className="text-red-500 text-[10px] mt-1 font-medium">{error}</p>}
  </div>
);

// ===========================
// SidebarAction Component
// ===========================
export const SidebarAction: React.FC<{
  label: string;
  subLabel?: string;
  href?: string;
  to?: string;
  onClick?: () => void;
}> = ({ label, subLabel, href, to, onClick }) => {
  const content = (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group cursor-pointer">
      <div className="flex-1">
        <p className={`text-xs text-slate-500 ${subLabel ? 'mb-0.5' : ''}`}>{label}</p>
        {subLabel && <p className="text-sm font-bold text-alpha-blue">{subLabel}</p>}
      </div>
      <span className="text-slate-300 group-hover:text-alpha-blue transition-colors text-xl font-light">›</span>
    </div>
  );

  if (href) return <a href={href} className="block">{content}</a>;
  if (to) return <Link to={to} className="block">{content}</Link>;
  return <div onClick={onClick} className="block">{content}</div>;
};
