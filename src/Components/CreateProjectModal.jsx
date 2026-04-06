import { X, Calendar, DollarSign, User, FileText, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { handleNumberInput } from '../utils/numberValidation';

const CreateProjectModal = ({ isOpen, onClose, onConfirm, initialData = null }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    client: '', 
    startDate: '', 
    endDate: '', 
    prepayment: '', 
    notes: '',
    budget: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ name: '', client: '', startDate: '', endDate: '', prepayment: '', notes: '', budget: '' });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ 
      ...formData, 
      id: initialData ? initialData.id : Date.now(), 
      status: initialData ? initialData.status : 'Aktiv', 
      items: initialData ? initialData.items : [],
      progress: initialData ? initialData.progress : 0 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0D1117] w-full max-w-2xl rounded-[3rem] p-10 md:p-14 shadow-[0_0_50px_rgba(234,179,8,0.1)] border border-slate-200 dark:border-white/5 relative overflow-hidden">
        
        {/* Dekorativ Sarı Parıltı */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute right-10 top-10 text-slate-400 hover:text-yellow-500 hover:rotate-90 transition-all duration-300 z-50"
        >
          <X size={28} />
        </button>

        <header className="mb-10">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
            {initialData ? 'Redaktə' : 'Yeni Layihə'}<span className="text-yellow-500"></span>
          </h2>
          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mt-3">
            {initialData ? 'Sistem Məlumatlarının Yenilənməsi' : 'Sistem Girişi: Mühəndislik Portfeli'}
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ad və Müştəri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
               <Zap className="absolute left-5 top-5 text-yellow-500" size={18} />
               <input 
                className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white border-2 border-transparent focus:border-yellow-500 rounded-2xl font-bold outline-none transition-all placeholder:text-slate-400" 
                placeholder="LAYİHƏ ADI" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required
              />
            </div>
            <div className="relative">
               <User className="absolute left-5 top-5 text-slate-400" size={18} />
               <input 
                className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white border-2 border-transparent focus:border-yellow-500 rounded-2xl font-bold outline-none transition-all" 
                placeholder="MÜŞTƏRİ / ŞİRKƏT" 
                value={formData.client}
                onChange={e => setFormData({...formData, client: e.target.value})} 
                required
              />
            </div>
          </div>

          {/* Tarixlər */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 uppercase">
              <label className="text-[9px] font-black text-slate-400 ml-5 tracking-widest flex items-center gap-2">
                <Calendar size={12}/> Başlama Tarixi
              </label>
              <input 
                type="date"
                value={formData.startDate}
                className="w-full p-5 bg-slate-50 dark:bg-white/5 dark:text-white rounded-2xl font-bold outline-none focus:ring-2 ring-yellow-500/20 transition-all uppercase text-xs" 
                onChange={e => setFormData({...formData, startDate: e.target.value})} 
                required
              />
            </div>
            <div className="space-y-2 uppercase">
              <label className="text-[9px] font-black text-slate-400 ml-5 tracking-widest flex items-center gap-2">
                <Calendar size={12}/> Bitmə Tarixi
              </label>
              <input 
                type="date"
                value={formData.endDate}
                className="w-full p-5 bg-slate-50 dark:bg-white/5 dark:text-white rounded-2xl font-bold outline-none focus:ring-2 ring-yellow-500/20 transition-all uppercase text-xs" 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
                required
              />
            </div>
          </div>

          {/* Büdcə və Beh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
               <DollarSign className="absolute left-5 top-5 text-emerald-500" size={18} />
               <input
                type="text"
                inputMode="numeric"
                value={formData.budget}
                className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
                placeholder="ÜMUMİ BÜDCƏ (₼)"
                onChange={e => {
                  handleNumberInput(e);
                  setFormData({...formData, budget: e.target.value});
                }}
                required
              />
            </div>
            <div className="relative">
               <DollarSign className="absolute left-5 top-5 text-yellow-500" size={18} />
               <input
                type="text"
                inputMode="numeric"
                value={formData.prepayment}
                className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-yellow-500 transition-all shadow-inner"
                placeholder="BEH / ÖNCƏDƏN ÖDƏNİŞ"
                onChange={e => {
                  handleNumberInput(e);
                  setFormData({...formData, prepayment: e.target.value});
                }}
              />
            </div>
          </div>

          {/* Qeydlər */}
          <div className="relative">
            <FileText className="absolute left-5 top-5 text-slate-400" size={18} />
            <textarea 
              className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white rounded-[1.5rem] font-bold outline-none min-h-[100px] border-2 border-transparent focus:border-yellow-500 transition-all resize-none" 
              placeholder="LAYİHƏ HAQQINDA QEYDLƏR..." 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {/* Düymə */}
          <button 
            type="submit" 
            className="w-full p-7 bg-yellow-500 hover:bg-yellow-600 text-black rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-xl shadow-yellow-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
          >
            {initialData ? 'Yadda Saxla' : 'Sistemi Başlat'} <Zap size={20} fill="currentColor" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;