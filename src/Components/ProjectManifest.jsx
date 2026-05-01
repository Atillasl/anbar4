import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ProjectManifest = ({ items, onDeleteItem, onEditItem }) => {

  return (
    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[540px]">
          <thead className="bg-gray-50/80 dark:bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400">
            <tr>
              <th className="p-4 sm:p-6">Avadanlıq / Tarix</th>
              <th className="p-4 sm:p-6 text-center">Gün × Qiymət</th>
              <th className="p-4 sm:p-6">Cəmi</th>
              <th className="p-4 sm:p-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {items?.map(item => (
              <tr key={item.id} className="hover:bg-indigo-50/40 dark:hover:bg-white/5 transition-colors">
                <td className="p-4 sm:p-6">
                  <div>
                    <div className="font-black text-sm uppercase text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[9px] text-indigo-500 dark:text-indigo-300 font-bold uppercase">{item.startDate} - {item.endDate}</div>
                  </div>
                </td>
                <td className="p-4 sm:p-6 text-center italic font-black text-xs text-slate-900 dark:text-slate-200">
                  <div className="flex flex-col items-center gap-1">
                    <span>{item.days} GÜN × {Number(item.pricePerDay).toFixed(2)} ₼</span>
                    {item.provider && item.provider !== 'Mənim Anbarım' && (
                      <span className="text-[8px] text-orange-600 dark:text-orange-300 font-bold uppercase bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                        {item.provider}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 sm:p-6 font-black italic text-slate-900 dark:text-white whitespace-nowrap">{fmt((Number(item.days) || 0) * (Number(item.pricePerDay) || 0))} ₼</td>
                <td className="p-4 sm:p-6 text-right">
                  <div className="flex gap-2 sm:gap-3 justify-end">
                    <button onClick={() => onEditItem(item)} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400"><Edit3 size={16}/></button>
                    <button onClick={() => onDeleteItem(item.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectManifest;