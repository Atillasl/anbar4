import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Database } from 'lucide-react';

const navLinks = [
  { 
    path: '/', 
    label: 'Ana Səhifə', 
    icon: <LayoutDashboard size={16} strokeWidth={3} /> 
  },
  { 
    path: '/projects', 
    label: 'Layihələr', 
    icon: <Briefcase size={16} strokeWidth={3} /> 
  },
  { 
    path: '/warehouses', 
    label: 'Anbar', 
    icon: <Database size={16} strokeWidth={3} /> 
  },
];

export const Navigation = () => {
  const { pathname } = useLocation();

  return (
    <nav className="hidden lg:flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/10 backdrop-blur-sm">
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
            className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 py-2.5 px-6 rounded-2xl
              ${isActive 
                ? 'text-black bg-yellow-500 shadow-lg shadow-yellow-500/20 -translate-y-0.5' 
                : 'text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-500 hover:bg-white dark:hover:bg-white/5'
              }`}
          >
            {link.icon} {link.label}
          </Link>
        );
      })}
    </nav>
  );
};