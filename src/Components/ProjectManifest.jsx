import React, { useState } from 'react';
import { Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import { handleNumberInput } from '../utils/numberValidation';

const ProjectManifest = ({ items, onUpdate, calculateDays }) => {
  const [editingId, setEditingId] = useState(null);
  const [tempData, setTempData] = useState({});

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTempData({ ...item });
  };

  const handleDateChange = (field, value) => {
    const updated = { ...tempData, [field]: value };
    if (field === 'startDate' && new Date(value) > new Date(updated.endDate)) updated.endDate = value;
    updated.days = calculateDays(updated.startDate, updated.endDate);
    setTempData(updated);
  };

  const saveRow = () => {
    const newItems = items.map(it => it.id === editingId ? {
      ...tempData,
      total: Number(tempData.days) * Number(tempData.pricePerDay),
      costTotal: Number(tempData.days) * Number(tempData.costPerDay || 0)
    } : it);
    onUpdate(newItems);
    setEditingId(null);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <tr>
            <th className="p-6">Avadanlıq / Tarix</th>
            <th className="p-6 text-center">Gün × Qiymət</th>
            <th className="p-6">Cəmi</th>
            <th className="p-6"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items?.map(item => (
            <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
              <td className="p-6">
                {editingId === item.id ? (
                  <div className="flex flex-col gap-2">
                    <input className="p-2 border rounded-lg text-xs font-bold" value={tempData.name} onChange={e => setTempData({...tempData, name: e.target.value})} />
                    <div className="flex gap-1">
                      <input type="date" className="p-1 text-[10px] border rounded" value={tempData.startDate} onChange={e => handleDateChange('startDate', e.target.value)} />
                      <input type="date" className="p-1 text-[10px] border rounded" min={tempData.startDate} value={tempData.endDate} onChange={e => handleDateChange('endDate', e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-black text-sm uppercase">{item.name}</div>
                    <div className="text-[9px] text-indigo-500 font-bold uppercase">{item.startDate} - {item.endDate}</div>
                  </div>
                )}
              </td>
              <td className="p-6 text-center italic font-black text-xs">
                {editingId === item.id ? (
                   <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] bg-indigo-100 px-2 rounded-full">{tempData.days} GÜN</span>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <div className="space-y-1">
                        <label className="text-[8px] text-orange-600 font-bold">Maya</label>
                        <input type="text" inputMode="numeric" placeholder="Maya" className="w-full p-1 border border-orange-200 rounded text-center text-xs bg-orange-50" value={tempData.costPerDay || 0} onChange={e => {
                          handleNumberInput(e);
                          setTempData({...tempData, costPerDay: e.target.value});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-green-600 font-bold">Qiymət</label>
                        <input type="text" inputMode="numeric" placeholder="Qiymət" className="w-full p-1 border border-green-200 rounded text-center text-xs bg-green-50" value={tempData.pricePerDay} onChange={e => {
                          handleNumberInput(e);
                          setTempData({...tempData, pricePerDay: e.target.value});
                        }} />
                      </div>
                    </div>
                   </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span>{item.days} GÜN × {item.pricePerDay} ₼</span>
                    {item.provider && item.provider !== 'Mənim Anbarım' && (
                      <span className="text-[8px] text-orange-600 font-bold uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                        {item.provider}
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td className="p-6 font-black italic">{editingId === item.id ? (tempData.days * tempData.pricePerDay) : item.total} ₼</td>
              <td className="p-6 text-right flex gap-3 justify-end">
                {editingId === item.id ? (
                  <button onClick={saveRow} className="text-green-500"><CheckCircle2 size={18}/></button>
                ) : (
                  <button onClick={() => handleEdit(item)} className="text-gray-300 hover:text-blue-500"><Edit3 size={18}/></button>
                )}
                <button onClick={() => onUpdate(items.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectManifest;