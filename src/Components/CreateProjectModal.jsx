import { X, Calendar, User, FileText, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onConfirm, initialData = null }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    client: '', 
    startDate: '', 
    endDate: '', 
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          client: initialData.client || '',
          startDate: initialData.startDate || '',
          endDate: initialData.endDate || '',
          notes: initialData.notes || ''
        });
      } else {
        setFormData({ name: '', client: '', startDate: '', endDate: '', notes: '' });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Layihə adı mütləqdir';
    if (!formData.client.trim()) e.client = 'Müştəri adı mütləqdir';
    if (!formData.startDate) e.startDate = 'Başlama tarixi mütləqdir';
    if (!formData.endDate) e.endDate = 'Bitmə tarixi mütləqdir';
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      e.endDate = 'Bitmə tarixi başlama tarixindən əvvəl ola bilməz';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onConfirm({ 
      ...formData, 
      id: initialData ? initialData.id : Date.now(), 
      status: initialData ? initialData.status : 'Aktiv', 
      items: initialData ? initialData.items : [],
      progress: initialData ? initialData.progress : 0 
    });
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
                className={`w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white border-2 ${errors.name ? 'border-red-500' : 'border-transparent'} focus:border-yellow-500 rounded-2xl font-bold outline-none transition-all placeholder:text-slate-400`}
                placeholder="LAYİHƏ ADI" 
                value={formData.name}
                onChange={e => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ''}); }} 
              />
              {errors.name && <p className="text-[10px] font-black text-red-500 ml-5 mt-1 uppercase tracking-wider">{errors.name}</p>}
            </div>
            <div className="relative">
               <User className="absolute left-5 top-5 text-slate-400" size={18} />
               <input 
                className={`w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white border-2 ${errors.client ? 'border-red-500' : 'border-transparent'} focus:border-yellow-500 rounded-2xl font-bold outline-none transition-all`}
                placeholder="MÜŞTƏRİ / ŞİRKƏT" 
                value={formData.client}
                onChange={e => { setFormData({...formData, client: e.target.value}); setErrors({...errors, client: ''}); }} 
              />
              {errors.client && <p className="text-[10px] font-black text-red-500 ml-5 mt-1 uppercase tracking-wider">{errors.client}</p>}
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
                className={`w-full p-5 bg-slate-50 dark:bg-white/5 dark:text-white rounded-2xl font-bold outline-none focus:ring-2 ring-yellow-500/20 transition-all uppercase text-xs border-2 ${errors.startDate ? 'border-red-500' : 'border-transparent'}`}
                onChange={e => { setFormData({...formData, startDate: e.target.value}); setErrors({...errors, startDate: ''}); }} 
              />
              {errors.startDate && <p className="text-[10px] font-black text-red-500 ml-2 uppercase tracking-wider">{errors.startDate}</p>}
            </div>
            <div className="space-y-2 uppercase">
              <label className="text-[9px] font-black text-slate-400 ml-5 tracking-widest flex items-center gap-2">
                <Calendar size={12}/> Bitmə Tarixi
              </label>
              <input 
                type="date"
                value={formData.endDate}
                min={formData.startDate || undefined}
                className={`w-full p-5 bg-slate-50 dark:bg-white/5 dark:text-white rounded-2xl font-bold outline-none focus:ring-2 ring-yellow-500/20 transition-all uppercase text-xs border-2 ${errors.endDate ? 'border-red-500' : 'border-transparent'}`}
                onChange={e => { setFormData({...formData, endDate: e.target.value}); setErrors({...errors, endDate: ''}); }} 
              />
              {errors.endDate && <p className="text-[10px] font-black text-red-500 ml-2 uppercase tracking-wider">{errors.endDate}</p>}
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