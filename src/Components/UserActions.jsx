import { User, LogOut } from 'lucide-react';

export const UserActions = ({ onLogout }) => (
  <div className="flex items-center gap-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
    <div className="text-right hidden sm:block">
      <p className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase">Admin</p>
    </div>
    
    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 border-2 border-white dark:border-gray-700 shadow-sm">
      <User size={22} />
    </div>

    <button 
      onClick={() => window.confirm("Çıxış edilsin?") && onLogout()}
      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 transition-all active:scale-90"
    >
      <LogOut size={22} strokeWidth={3} />
    </button>
  </div>
);