import { Link } from 'react-router-dom';
// 1. Şəkli import edirik
import MyLogo from '../assets/my-logo.jpeg'; 

export const Logo = () => (
  <Link to="/" className="flex items-center gap-3 group">
    {/* Loqo qutusu - Sarı vurğulu border ilə */}
    <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-white dark:border-yellow-500/20 bg-white dark:bg-slate-900">
      <img 
        src={MyLogo} 
        alt="Falcon Logo" 
        className="w-full h-full object-cover rounded-full" 
      />
      {/* Şəklin üzərinə sarı parıltı effekti */}
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent pointer-events-none" />
    </div>

    <div className="flex flex-col">
      <span className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tighter italic">
        FAL<span className="text-yellow-500">KON</span>
      </span>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[8px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-[0.3em]">Production</span>
        {/* Aktivlik nöqtəsi - Sarı konseptə uyğun */}
        <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" />
      </div>
    </div>
  </Link>
);