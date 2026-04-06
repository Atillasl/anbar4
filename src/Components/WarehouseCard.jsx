import React from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Trash2, ArrowRight, Box } from 'lucide-react';

const WarehouseCard = ({ warehouse, onDelete }) => {
  const { id, name, location, itemCount } = warehouse;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    if(window.confirm(`${name} sektorunu silmək istədiyinizə əminsiniz?`)) {
      onDelete(id);
    }
  };

  return (
    <Link 
      to={`/warehouse/${id}`}
      className="group relative block bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-2xl md:rounded-[2.5rem] border-2 border-gray-100 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(79,70,229,0.15)] transition-all duration-500 ease-out"
    >
      {/* Üst Dekorativ Xətt */}
      <div className="absolute top-0 left-6 sm:left-10 right-6 sm:right-10 h-1 bg-indigo-600 rounded-b-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />

      {/* ZİBİL QUTUSU: Sağ yuxarı küncdə qaldı */}
      <button 
        onClick={handleDelete} 
        className="absolute top-3 sm:top-6 right-3 sm:right-6 p-1.5 sm:p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors z-20 flex-shrink-0"
        title="Sektoru Sil"
      >
        <Trash2 size={18} strokeWidth={1.5} />
      </button>

      {/* İkon və Başlıq Hissəsi */}
      <div className="flex items-start justify-between gap-2 mb-4 sm:mb-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 w-12 sm:w-16 h-12 sm:h-16 rounded-lg sm:rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner flex-shrink-0">
          <Box size={24} strokeWidth={1.5} />
        </div>
        
        {/* AKTİV SEKTOR SÖZÜ */}
        <div className="mt-0.5 sm:mt-1 flex-shrink-0"> 
           <span className="text-[7px] sm:text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/20 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap">
             Aktiv Sec
           </span>
        </div>
      </div>

      {/* Məlumatlar */}
      <div className="mb-6 sm:mb-10">
        <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-1 group-hover:translate-x-1 transition-transform">
          {name}
        </h3>
        <div className="flex items-center text-gray-400 dark:text-gray-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest gap-1.5">
          <MapPin size={12} className="text-indigo-500 flex-shrink-0" /> 
          <span className="truncate">{location || "Ümumi Anbar"}</span>
        </div>
      </div>

      {/* Alt hissə */}
      <div className="flex items-end justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic leading-tight mb-1">
            {itemCount}
          </div>
          <div className="text-[7px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Mövcud Texnika
          </div>
        </div>
        
        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 sm:p-4 rounded-lg sm:rounded-2xl group-hover:rotate-12 transition-all duration-300 shadow-xl flex-shrink-0">
          <ArrowRight size={18} strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
};

export default React.memo(WarehouseCard);