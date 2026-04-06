import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Video, Sparkles, 
  ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto bg-[#F8FAFC] dark:bg-[#05070A] min-h-screen pb-32 transition-all font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yellow-500/5 blur-[120px] pointer-events-none" />

      {/* HEADER: Xoş gəldiniz */}
      <header className="mb-8 sm:mb-16 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3 text-yellow-600 dark:text-yellow-500 mb-3 sm:mb-4">
          <Sparkles size={18} className="animate-pulse flex-shrink-0" />
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em]">System Control Unit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase leading-tight">
          Nəzarət <br /> <span className="text-yellow-500">Mərkəzi</span>
        </h1>
      </header>

      {/* İKİ BÖYÜK QAPI (MAIN CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 relative z-10">
        
        {/* ANBAR PANELI (Light Mode-da Ağ, Dark-da Qara) */}
        <button 
          onClick={() => navigate('/warehouses')}
          className="group relative bg-white dark:bg-[#0D1117] p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl md:rounded-[3.5rem] border-2 border-transparent hover:border-yellow-500 shadow-xl dark:shadow-none transition-all duration-500 text-left overflow-hidden min-h-64 sm:min-h-80 md:h-[450px] flex flex-col justify-end"
        >
          <div className="absolute top-0 right-0 p-6 sm:p-8 md:p-12 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
            <Box size={150} strokeWidth={1} />
          </div>
          
          <div className="bg-yellow-500 text-black w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-[1.8rem] flex items-center justify-center mb-4 sm:mb-8 group-hover:rotate-6 transition-transform shadow-lg shadow-yellow-500/20">
            <Box size={32} strokeWidth={2.5} />
          </div>
          
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic mb-2 tracking-tighter">Anbar</h2>
            <p className="text-sm sm:text-base text-gray-400 font-bold uppercase tracking-wider mb-4 sm:mb-8 max-w-[250px]">Bütün texnika və sektorları idarə et</p>
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
              Daxil ol <ArrowRight size={16} />
            </div>
          </div>
        </button>

        {/* LAYİHƏ PANELI (Həmişə Tünd/Sarı Vurğulu) */}
        <button 
          onClick={() => navigate('/projects')}
          className="group relative bg-[#0D1117] dark:bg-yellow-500/5 p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl md:rounded-[3.5rem] border-2 border-transparent hover:border-yellow-500 shadow-2xl transition-all duration-500 text-left overflow-hidden min-h-64 sm:min-h-80 md:h-[450px] flex flex-col justify-end"
        >
          <div className="absolute top-0 right-0 p-6 sm:p-8 md:p-12 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
            <Video size={150} className="text-yellow-500" strokeWidth={1} />
          </div>
          
          <div className="bg-white text-black w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-[1.8rem] flex items-center justify-center mb-4 sm:mb-8 group-hover:-rotate-6 transition-transform shadow-lg">
            <Video size={32} strokeWidth={2.5} />
          </div>
          
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase italic mb-2 tracking-tighter">
              Layihə <span className="text-yellow-500">Paneli</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-bold uppercase tracking-wider mb-4 sm:mb-8 max-w-[250px]">Çəkiliş layihələrini və arendaları izlə</p>
            <div className="flex items-center gap-2 text-yellow-500 font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
              Daxil ol <ArrowRight size={16} />
            </div>
          </div>
        </button>

      </div>

      {/* FOOTER QEYD */}
      <footer className="mt-12 sm:mt-20 text-center">
        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.5em] opacity-50">
          Industrial Production Management System v3.0
        </p>
      </footer>

    </div>
  );
};

export default Dashboard;