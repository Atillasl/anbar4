import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, Trash2, FileText, PlusCircle, Calendar } from 'lucide-react';
import { useProjectActions } from '../hooks/useProjectActions';
import ProjectManifest from '../Components/ProjectManifest';
import FinanceCard from '../Components/FinanceCard';
import AddItemModal from '../Components/AddItemModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    project, 
    isEditing, 
    setIsEditing, 
    editData, 
    setEditData, 
    saveProject, 
    calculateDays, 
    finance 
  } = useProjectActions(id);

  const [showModal, setShowModal] = useState(null);

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#05070A]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">Sistem Yüklənir...</p>
        </div>
      </div>
    );
  }

  const handleDeleteProject = () => {
    if (window.confirm("Bu layihəni tamamilə silmək istədiyinizə əminsiniz?")) {
      const projects = JSON.parse(localStorage.getItem('my_projects') || '[]');
      const filtered = projects.filter(p => p.id !== Number(id));
      localStorage.setItem('my_projects', JSON.stringify(filtered));
      navigate('/projects');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-[1400px] mx-auto min-h-screen pb-32 bg-[#F8FAFC] dark:bg-[#05070A] transition-colors duration-500 font-sans relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] pointer-events-none" />

      {/* HEADER BÖLMƏSİ */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 sm:gap-6 mb-8 sm:mb-12 relative z-10">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/projects')} 
            className="flex items-center text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors group"
          >
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Layihələr siyahısına qayıt
          </button>
          
          {isEditing ? (
            <input 
              className="text-4xl font-black bg-white dark:bg-[#0D1117] border-2 border-yellow-500 p-3 rounded-2xl italic uppercase outline-none shadow-xl shadow-yellow-500/10 dark:text-white" 
              value={editData.name} 
              onChange={e => setEditData({...editData, name: e.target.value})} 
            />
          ) : (
            <h1 className="text-5xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">
              {project.name}<span className="text-yellow-500">.</span>
            </h1>
          )}
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <button 
              onClick={() => { saveProject(editData); setIsEditing(false); }} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Save size={16}/> Yadda Saxla
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-yellow-500 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm"
            >
              <Edit3 size={16}/> Redaktə et
            </button>
          )}
          <button 
            onClick={handleDeleteProject}
            className="bg-white dark:bg-[#0D1117] border border-red-100 dark:border-white/5 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all shadow-sm"
          >
            <Trash2 size={16}/> Sil
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* SOL TƏRƏF */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* QEYDLƏR */}
          <div className="bg-white dark:bg-[#0D1117] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6 text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-widest"> 
              <FileText size={18}/> Layihə Haqqında Qeydlər 
            </div>
            {isEditing ? (
              <textarea 
                className="w-full p-5 bg-slate-50 dark:bg-white/5 dark:text-white rounded-3xl min-h-[120px] font-bold outline-none border-2 border-transparent focus:border-yellow-500 transition-all resize-none" 
                value={editData.notes} 
                onChange={e => setEditData({...editData, notes: e.target.value})} 
                placeholder="Layihə detallarını buraya yazın..."
              />
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed">
                {project.notes || "Heç bir qeyd əlavə edilməyib."}
              </p>
            )}
          </div>

          {/* AVADANLIQ MANİFESTİ */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Avadanlıq Siyahısı</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowModal('internal')}
                  className="bg-yellow-500 text-black p-2 px-5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/10"
                >
                  <PlusCircle size={12}/> Anbardan
                </button>
                <button 
                  onClick={() => setShowModal('external')}
                  className="bg-white dark:bg-[#0D1117] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 p-2 px-5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <PlusCircle size={12}/> Kənardan
                </button>
              </div>
            </div>
            
            <ProjectManifest 
              items={project.items || []} 
              calculateDays={calculateDays} 
              onUpdate={(newItems) => saveProject({...project, items: newItems})} 
            />
          </div>
        </div>

        {/* SAĞ TƏRƏF: MALİYYƏ PANELİ */}
        <div className="xl:col-span-4">
          <div className="sticky top-12 space-y-6">
            <FinanceCard finance={finance} />
            
            {/* Tarix Kartı */}
            <div className="p-8 bg-white dark:bg-[#0D1117] rounded-[2.5rem] border border-slate-200 dark:border-white/5 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-600">
                   <Calendar size={20} />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                Layihə müddəti
              </p>
              <p className="text-slate-900 dark:text-white font-black italic uppercase text-lg mt-1 tracking-tighter">
                {project.startDate} <span className="text-yellow-500">—</span> {project.endDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AddItemModal 
          mode={showModal}
          projectDates={{start: project.startDate, end: project.endDate}}
          calculateDays={calculateDays}
          onClose={() => setShowModal(null)}
          onAdd={(item) => saveProject({...project, items: [...(project.items || []), item]})}
        />
      )}
    </div>
  );
};

export default ProjectDetail;