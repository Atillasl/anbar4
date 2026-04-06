import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Briefcase,
  TrendingUp, Download, User, MapPin, Clock, X, Star, Zap
} from 'lucide-react';

const Reports = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, monthlyBreakdown: [], projectGains: [] });
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('my_projects') || '[]');
    let revenue = 0;
    let months = {};

    projects.forEach(proj => {
      const budget = Number(proj.budget || 0);
      revenue += budget;

      const date = new Date(proj.startDate || Date.now());
      const monthYear = date.toLocaleString('az-AZ', { month: 'long', year: 'numeric' });
      months[monthYear] = (months[monthYear] || 0) + budget;
    });

    const monthlyData = Object.entries(months).map(([name, value]) => ({ name, value }));

    setStats({
      totalRevenue: revenue,
      monthlyBreakdown: monthlyData,
      projectGains: projects
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#05070A] p-6 md:p-12 transition-all font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-4 text-yellow-500">
            <Zap size={20} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Financial Data Unit</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
            Maliyyə <br /> <span className="text-yellow-500">Çıxarışı</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 italic">Aylıq Gəlir və Layihə Analizi</p>
        </div>
        <button className="bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-yellow-500/10 hover:bg-yellow-600 transition-all flex items-center gap-3 active:scale-95">
          <Download size={18} /> Hesabatı Eksport Et
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        
        {/* SOL TƏRƏF: Aylıq Gəlir Çıxarışı */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0D1117] p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500"><TrendingUp size={24}/></div>
              <h3 className="font-black uppercase tracking-widest text-xs dark:text-slate-400 text-slate-500">Aylıq Gəlir</h3>
            </div>
            
            <div className="space-y-6">
              {stats.monthlyBreakdown.length > 0 ? stats.monthlyBreakdown.map((m, i) => (
                <div key={i} className="flex justify-between items-center group cursor-default">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 group-hover:text-yellow-500 transition-colors">{m.name}</span>
                  <div className="flex-1 border-b border-dashed border-slate-200 dark:border-white/10 mx-4 mb-1"></div>
                  <span className="font-black dark:text-white text-slate-900">{m.value.toLocaleString()} ₼</span>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic">Məlumat tapılmadı.</p>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Ümumi Balans</p>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                {stats.totalRevenue.toLocaleString()} <span className="text-yellow-500">₼</span>
              </h2>
            </div>
          </div>
        </div>

        {/* SAĞ TƏRƏF: Layihələr Siyahısı */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D1117] rounded-[3.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-2 dark:text-slate-400">
            <Briefcase size={20} className="text-yellow-500" /> Layihə Arxivləri
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.projectGains.map((proj, i) => (
              <button 
                key={i}
                onClick={() => setSelectedProject(proj)}
                className="flex flex-col p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border-2 border-transparent hover:border-yellow-500 transition-all text-left group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="p-3 bg-white dark:bg-slate-800 rounded-xl text-yellow-500 shadow-sm"><Star size={18} fill="currentColor" /></span>
                  <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full">Analiz</span>
                </div>
                <h4 className="font-black uppercase italic text-slate-900 dark:text-white mb-1 tracking-tight group-hover:text-yellow-500 transition-colors">{proj.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{proj.client}</p>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 w-full flex justify-between items-center">
                   <span className="text-lg font-black dark:text-white">{Number(proj.budget).toLocaleString()} ₼</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{proj.startDate}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DETALLAR MODALI */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60">
          <div className="bg-white dark:bg-[#0D1117] w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedProject(null)} 
              className="absolute right-10 top-10 text-slate-400 hover:text-yellow-500 hover:rotate-90 transition-all duration-300"
            >
              <X size={32}/>
            </button>
            
            <header className="mb-10">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em]">Layihə Detalları</span>
              <h2 className="text-4xl font-black italic uppercase text-slate-900 dark:text-white mt-2 leading-none">
                {selectedProject.name}<span className="text-yellow-500">_</span>
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-yellow-500"><User size={20}/></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Müştəri</p>
                    <p className="font-bold text-sm uppercase dark:text-white">{selectedProject.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-yellow-500"><MapPin size={20}/></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Məkan</p>
                    <p className="font-bold text-sm uppercase dark:text-white">{selectedProject.location || 'DAXİLİ ÇƏKİLİŞ'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-yellow-500"><Clock size={20}/></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Müddət</p>
                    <p className="font-bold text-[11px] uppercase dark:text-white">{selectedProject.startDate} — {selectedProject.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><DollarSign size={20}/></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Büdcə / Beh</p>
                    <p className="font-bold text-sm uppercase dark:text-white">{selectedProject.budget} ₼ / {selectedProject.prepayment || 0} ₼</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
              <h5 className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={14} fill="currentColor" /> Sistem Qeydləri
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed">
                {selectedProject.notes || "Bu layihə üçün əlavə maliyyə qeydi tapılmadı."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;