import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Database, BarChart3 } from 'lucide-react';

const navLinks = [
  { 
    path: '/', 
    label: 'Ana Səhifə', 
    icon: <LayoutDashboard size={20} strokeWidth={2.5} /> 
  },
  { 
    path: '/projects', 
    label: 'Layihələr', 
    icon: <Briefcase size={20} strokeWidth={2.5} /> 
  },
  { 
    path: '/warehouses', 
    label: 'Anbar', 
    icon: <Database size={20} strokeWidth={2.5} /> 
  },
  { 
    path: '/reports', 
    label: 'Hesabatlar', 
    icon: <BarChart3 size={20} strokeWidth={2.5} /> 
  },
];

export const MobileMenu = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed top-20 right-0 w-full max-w-xs bg-white dark:bg-[#0D1117] border-l border-slate-200 dark:border-white/10 shadow-2xl z-50 lg:hidden">
        <div className="flex flex-col gap-2 p-6">
          {navLinks.map((link) => {
            const isActive = 
              pathname === link.path || 
              (link.path === '/projects' && pathname.startsWith('/project/')) ||
              (link.path === '/warehouses' && pathname.startsWith('/warehouse/')) ||
              (link.path === '/reports' && pathname.startsWith('/reports/'));

            return (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-bold text-sm
                  ${isActive 
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
