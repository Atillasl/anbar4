export const StatCard = ({ label, val, icon, color }) => (
  <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg sm:rounded-[2.5rem] shadow-sm border-2 border-transparent hover:border-indigo-50 dark:hover:border-indigo-900 transition-all group">
    <div className={`bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-sm sm:text-base`}>
      {icon}
    </div>
    <p className="text-gray-400 dark:text-gray-500 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">{label}</p>
    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic mt-1">{val}</h3>
  </div>
);