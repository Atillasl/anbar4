import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Layout, ListFilter, MoveLeft, Zap
} from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouse';
import ProductCard from '../Components/ProductCard';
import AddProductModal from '../Components/AddProductModal';

const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // MODAL VE REDAKTE ÜÇÜN STATE-LƏR
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // useWarehouse hook-una 'updateProduct' funksiyasını da əlavə etdiyini fərz edirəm
  const { 
    warehouse, 
    products, 
    addProduct, 
    updateProduct, // Bu funksiya hook-da olmalıdır
    deleteProduct, 
    searchTerm, 
    setSearchTerm 
  } = useWarehouse(id);

  // REDAKTE DÜYMƏSİ BASILANDA
  const handleEditClick = (product) => {
    setEditingProduct(product); // Redaktə ediləcək məhsulu seçirik
    setShowModal(true); // Modalı açırıq
  };

  // YENİ MAL DÜYMƏSİ BASILANDA
  const handleAddNewClick = () => {
    setEditingProduct(null); // Seçilmiş məhsulu sıfırlayırıq (boş modal üçün)
    setShowModal(true);
  };

  // MODAL BAĞLANANDA
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#05070A] text-slate-900 dark:text-white transition-all duration-500">
      
      {/* HEADER */}
      <header className="bg-white/90 dark:bg-[#05070A]/90 backdrop-blur-xl border-b-2 border-slate-100 dark:border-yellow-500/10 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
          
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <button 
              onClick={() => navigate('/warehouses')}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-yellow-500 transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-widest group flex-shrink-0"
            >
              <MoveLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Geri
            </button>
            <div className="h-8 sm:h-10 w-[1px] bg-slate-200 dark:bg-yellow-500/20 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-yellow-500 mb-0.5">
                <Zap size={12} fill="currentColor" className="flex-shrink-0" />
                <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Sector Active</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-tight truncate">
                {warehouse?.name || "Yüklenir..."}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-4 flex-shrink-0">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-yellow-500/50" size={18} />
              <input 
                type="text"
                placeholder="İnventarda axtar..."
                className="bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-yellow-500/30 rounded-2xl py-3.5 pl-12 pr-6 text-xs w-64 transition-all outline-none dark:text-white placeholder:text-slate-400 uppercase font-bold"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAddNewClick}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest shadow-xl shadow-yellow-500/10 transition-all active:scale-95 flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Yeni Mal</span><span className="inline sm:hidden">+</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 sm:p-8">
        
        {/* STATUS BAR */}
        <div className="mb-10 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-yellow-500 border border-slate-200 dark:border-white/10">
              <Layout size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                İnventar Vəziyyəti
              </span>
              <span className="text-xs font-black dark:text-white uppercase italic">
                 {products.length} Məhsul qeydiyyatdadır
              </span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-yellow-500 transition-colors">
            <ListFilter size={16} /> Filtrlə
          </button>
        </div>

        {/* İNVENTAR GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {products.map(product => (
            <div key={product.id} className="transition-all duration-300">
              <ProductCard 
                product={product} 
                onDelete={deleteProduct} 
                onEdit={() => handleEditClick(product)} // Redaktə funksiyasını bura bağladıq
              />
            </div>
          ))}

          {/* Yeni Boş Slot */}
          <button 
            onClick={handleAddNewClick}
            className="group min-h-[320px] border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-yellow-500 opacity-0 group-hover:opacity-[0.02] transition-opacity" />
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-yellow-500 group-hover:text-black group-hover:rotate-90 transition-all duration-500 flex items-center justify-center shadow-inner">
              <Plus size={32} strokeWidth={3} />
            </div>
            <div className="text-center relative z-10">
              <p className="text-[11px] font-black text-slate-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 uppercase tracking-[0.2em]">
                Boş Rəf_0{products.length + 1}
              </p>
            </div>
          </button>
        </div>
      </main>

      {/* MODAL: Həm əlavə etmək, həm də redaktə etmək üçün istifadə olunur */}
      <AddProductModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        // Əgər editingProduct varsa update etsin, yoxdursa əlavə etsin
        onAdd={editingProduct ? updateProduct : addProduct} 
        initialData={editingProduct} 
      />
    </div>
  );
};

export default WarehouseDetail;