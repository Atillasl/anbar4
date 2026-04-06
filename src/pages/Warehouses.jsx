import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Database, ChevronRight, Package, HardDrive, Trash2, Zap } from 'lucide-react';

const Warehouses = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newWH, setNewWH] = useState({ name: '', description: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('my_warehouses') || '[]');
    setWarehouses(saved);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    const warehouseWithId = { ...newWH, id: Date.now() };
    const updated = [...warehouses, warehouseWithId];
    localStorage.setItem('my_warehouses', JSON.stringify(updated));
    setWarehouses(updated);
    setShowModal(false);
    setNewWH({ name: '', description: '' });
  };

  const deleteWarehouse = (e, id) => {
    e.stopPropagation();
    if(window.confirm("Bu sektoru və içindəki bütün malları silmək istəyirsiniz?")) {
        const updated = warehouses.filter(w => w.id !== id);
        setWarehouses(updated);
        localStorage.setItem('my_warehouses', JSON.stringify(updated));
        localStorage.removeItem(`products_wh_${id}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto bg-[#F8FAFC] dark:bg-[#05070A] min-h-screen pb-32 transition-colors">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-16 gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-yellow-500">
            <Zap size={16} fill="currentColor" className="flex-shrink-0" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em]">Inventory Systems</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-tight">
            ANBARLAR<span className="text-yellow-500"></span>
          </h1>
          <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] italic">
            Texniki Sektorların İdarəedilməsi
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center gap-2 sm:gap-3 transition-all shadow-xl shadow-yellow-500/10 active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus size={18} strokeWidth={3} /> YENİ ANBAR
        </button>
      </div>

      {/* WAREHOUSE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {warehouses.map(wh => (
          <div 
            key={wh.id} 
            onClick={() => navigate(`/warehouse/${wh.id}`)}
            className="group bg-white dark:bg-[#0D1117] p-10 rounded-[3.5rem] border-2 border-transparent hover:border-yellow-500 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          >
            {/* Arxa fon dekorasiyası */}
            <Database className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 text-yellow-500" size={150} />

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center text-yellow-500 border border-slate-100 dark:border-white/5 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                <HardDrive size={28} />
              </div>
              <button 
                onClick={(e) => deleteWarehouse(e, wh.id)}
                className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2 group-hover:translate-x-1 transition-transform">
                {wh.name}
              </h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 h-10 line-clamp-2 leading-relaxed">
                {wh.description || 'Təsvir qeyd edilməyib'}
              </p>
              
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6">
                <span className="text-yellow-600 dark:text-yellow-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  İnventara Bax <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <Package size={18} className="text-slate-200 dark:text-slate-800" />
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {warehouses.length === 0 && (
          <div className="col-span-full py-32 text-center rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center">
            <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-full mb-6">
              <Database size={60} className="text-slate-200 dark:text-slate-800" />
            </div>
            <p className="text-slate-300 dark:text-slate-700 font-black uppercase italic tracking-[0.3em]">Hələ Heç bir sektor yaradılmayıb</p>
          </div>
        )}
      </div>

      {/* MODAL: CREATE SECTOR */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1117] w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl border-t-[12px] border-yellow-500 animate-in zoom-in duration-300 relative">
             <div className="absolute top-4 right-8 text-[8px] font-black text-yellow-500 uppercase tracking-widest opacity-40">System_Prompt</div>
            
            <h2 className="text-3xl font-black italic uppercase mb-8 dark:text-white tracking-tighter">Yeni Sektor</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Sektorun Adı</label>
                <input 
                  placeholder="Məs: Kamera və Obyektivlər" 
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-yellow-500/50 font-bold outline-none transition-all dark:text-white"
                  onChange={e => setNewWH({...newWH, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Qısa Təsvir</label>
                <input 
                  placeholder="Məs: Əsas anbarda yerləşən rəflər" 
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-yellow-500/50 font-bold outline-none transition-all dark:text-white"
                  onChange={e => setNewWH({...newWH, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 p-5 bg-yellow-500 text-black rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-yellow-500/10 hover:bg-yellow-600 transition-all">Sektoru Aç</button>
                <button type="button" onClick={() => setShowModal(false)} className="p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">Ləğv Et</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;