import React, { useState, useEffect } from 'react';
import { X, Upload, Package, DollarSign, Tag, Zap, ShieldCheck } from 'lucide-react';
import { handleNumberInput } from '../utils/numberValidation';

const AddProductModal = ({ isOpen, onClose, onAdd, initialData }) => {
  // initialData gələndə (redaktə üçün) state-i doldururuq, gəlməyəndə boşaldırıq
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    costPrice: '', // Maya dəyəri
    image: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', category: '', price: '', costPrice: '', image: null });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.costPrice) {
      return alert("Ad, Maya dəyəri və İcarə qiyməti mütləqdir!");
    }
    
    onAdd(formData); // Bu həm add, həm də update funksiyasını təmsil edə bilər
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0D1117] w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl border-t-[12px] border-yellow-500 animate-in zoom-in duration-300 relative">
        
        <button onClick={onClose} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-yellow-500 transition-colors">
          <X size={24} strokeWidth={3} />
        </button>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
            <Zap size={18} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Unit Registration</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase dark:text-white tracking-tighter leading-none">
            {initialData ? "Məlumatı Yenilə" : "İnventara Giriş"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* IMAGE UPLOAD AREA */}
          <div className="relative group">
            <div className={`h-40 w-full border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden transition-all
              ${formData.image ? 'border-yellow-500' : 'border-slate-100 dark:border-white/5 hover:border-yellow-500/50'}`}>
              
              {formData.image ? (
                <div className="relative w-full h-full">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Şəkli Dəyiş</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-yellow-500">
                    <Upload size={20} />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Texnika Şəkli Yüklə</p>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
            </div>
          </div>

          {/* ADI */}
          <div className="relative">
            <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
            <input 
              type="text"
              placeholder="Avadanlıq Adı"
              className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 rounded-2xl border-none font-bold outline-none dark:text-white text-sm focus:ring-2 ring-yellow-500/20 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* KATEQORİYA */}
            <div className="relative">
              <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={16} />
              <input 
                type="text"
                placeholder="Kateqoriya"
                className="w-full p-5 pl-12 bg-slate-50 dark:bg-white/5 rounded-2xl border-none font-bold outline-none dark:text-white text-xs focus:ring-2 ring-yellow-500/20 transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>

            {/* MAYA DƏYƏRİ (Sənin istədiyin yeni xana) */}
            <div className="relative">
              <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500/50" size={16} />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Maya (₼)"
                className="w-full p-5 pl-12 bg-slate-50 dark:bg-white/5 rounded-2xl border-none font-bold outline-none dark:text-white text-xs focus:ring-2 ring-red-500/10 transition-all border-b-2 border-transparent focus:border-red-500/30"
                value={formData.costPrice}
                onChange={e => {
                  handleNumberInput(e);
                  setFormData({...formData, costPrice: e.target.value});
                }}
                required
              />
            </div>
          </div>

          {/* İCARƏ QİYMƏTİ */}
          <div className="relative">
            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500" size={18} />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Günlük İcarə Qiyməti (₼)"
              className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 rounded-2xl border-none font-black outline-none dark:text-white text-sm focus:ring-2 ring-green-500/10 transition-all border-b-2 border-transparent focus:border-green-500/30"
              value={formData.price}
              onChange={e => {
                handleNumberInput(e);
                setFormData({...formData, price: e.target.value});
              }}
              required
            />
          </div>

          <button type="submit" className="w-full p-6 bg-yellow-500 text-black rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-yellow-500/10 hover:bg-yellow-600 transition-all active:scale-95">
            {initialData ? "Məlumatı Yenilə_" : "Siyahıya Əlavə Et"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;