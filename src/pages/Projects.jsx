import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Activity, Calendar, 
  DollarSign, AlertCircle, Trash2, ExternalLink, Edit3, Zap 
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import CreateProjectModal from '../Components/CreateProjectModal';

// JPEG LOQONU İMPORT ET
import MyLogo from '../assets/my-logo.jpeg'; 

const Projects = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); 
  
  const { 
    projects, 
    searchTerm, 
    setSearchTerm, 
    addProject, 
    deleteProject, 
    updateProject 
  } = useProjects();

  const activeProjects = projects.filter(p => p.status === 'Aktiv').length;
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);

  const handleEdit = (e, proj) => {
    e.stopPropagation(); 
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#05070A] transition-colors duration-500 relative overflow-hidden font-sans">
      
      {/* BACKGROUND DECOR - İndi Sarı tonlarda */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-500/5 blur-[120px] pointer-events-none" />

      <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto relative z-10">
        
        {/* HEADER & STATS SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-8 mb-8 sm:mb-16">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-lg border border-yellow-500/20 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em]">
              <Activity size={12} className="animate-pulse flex-shrink-0" /> SİSTEM AKTİVDİR
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">
              Layihələr<span className="text-yellow-500"></span>
            </h1>
            
            <div className="flex gap-4 sm:gap-6 pt-2 sm:pt-4 flex-col sm:flex-row">
              <div className="border-l-2 border-yellow-500 pl-3 sm:pl-4">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktiv İşlər</p>
                <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">{activeProjects}</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-3 sm:pl-4">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Ümumi Büdcə</p>
                <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">{totalBudget.toLocaleString()} ₼</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setEditingProject(null); setIsModalOpen(true); }} 
            className="group bg-yellow-500 hover:bg-yellow-600 text-black px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-widest shadow-2xl shadow-yellow-500/20 transition-all active:scale-95 flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={16} strokeWidth={3} /> Yeni Layihə
          </button>
        </header>

        {/* SEARCH & FILTER */}
        <div className="relative mb-8 sm:mb-12 max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
          <input 
            className="w-full bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border-2 border-slate-200 dark:border-slate-800 p-6 pl-16 rounded-2xl outline-none font-bold text-slate-700 dark:text-white focus:border-yellow-500 transition-all shadow-sm placeholder:text-slate-400 uppercase text-xs tracking-widest"
            placeholder="Layihə axtarışı..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* PROJECT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {projects.map(proj => (
            <div 
              key={proj.id} 
              onClick={() => navigate(`/project/${proj.id}`)}
              className="group relative bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-yellow-500/5 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Sarı Hover Effect */}
              <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/[0.02] transition-colors pointer-events-none" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner group-hover:border-yellow-500/50 transition-all p-0.5 bg-white dark:bg-slate-800 flex-shrink-0">
                  <img src={MyLogo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                </div>

                <div className="flex gap-2 relative z-20">
                   <button 
                    onClick={(e) => handleEdit(e, proj)} 
                    className="p-2 text-slate-300 hover:text-yellow-500 transition-colors"
                   >
                      <Edit3 size={18} />
                   </button>
                   
                   <button 
                    onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }} 
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                   >
                      <Trash2 size={18} />
                   </button>
                   
                   <div className="p-2 text-slate-300 group-hover:text-yellow-500 transition-all">
                      <ExternalLink size={18} />
                   </div>
                </div>
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter mb-1 relative z-10 group-hover:translate-x-1 transition-transform leading-tight">
                {proj.name}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Müştəri: {proj.client || 'Adsız'}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-8 relative z-10">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Tarix Aralığı</span>
                  </div>
                  <p className="text-[10px] font-bold dark:text-slate-200 uppercase">
                    {proj.startDate} — {proj.endDate}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <DollarSign size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Ümumi Büdcə</span>
                  </div>
                  <p className="text-[11px] font-black text-emerald-500 uppercase">
                    {Number(proj.budget).toLocaleString()} ₼
                  </p>
                </div>

                {/* BEH HİSSƏSİ - SARI VERSİYA */}
                <div className="bg-yellow-50/50 dark:bg-yellow-500/5 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-500/10">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-1">
                    <Zap size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Ön Ödəniş (Beh)</span>
                  </div>
                  <p className="text-[11px] font-black text-yellow-700 dark:text-yellow-500 uppercase">
                    {Number(proj.prepayment || 0).toLocaleString()} ₼
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-slate-100 dark:border-white/5 relative z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AlertCircle size={14} className="text-yellow-500 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Sistem: {proj.id}</span>
                </div>
                <span className="bg-yellow-500 text-black text-[8px] sm:text-[9px] font-black px-3 sm:px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-yellow-500/10 flex-shrink-0">
                  {proj.status || 'Aktiv'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingProject(null); }} 
        initialData={editingProject} 
        onConfirm={(formData) => {
          if (editingProject) {
            updateProject(editingProject.id, formData);
          } else {
            addProject(formData);
          }
          setIsModalOpen(false);
          setEditingProject(null);
        }} 
      />
    </div>
  );
};

export default Projects;