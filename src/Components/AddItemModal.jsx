import React, { useState, useEffect } from 'react';
import { X, Database, ExternalLink } from 'lucide-react';
import { handleNumberInput } from '../utils/numberValidation';

const AddItemModal = ({ mode, projectDates, onClose, onAdd, calculateDays }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWH, setSelectedWH] = useState('');
  const [whProducts, setWhProducts] = useState([]);
  
  const [newItem, setNewItem] = useState({
    productId: '', name: '', days: 1, pricePerDay: 0, costPerDay: 0,
    startDate: projectDates.start || '', 
    endDate: projectDates.end || '', 
    provider: mode === 'internal' ? 'Mənim Anbarım' : ''
  });

  useEffect(() => {
    const whs = JSON.parse(localStorage.getItem('my_warehouses') || '[]');
    setWarehouses(whs);
    // İlk açılışda gün sayını hesabla
    setNewItem(prev => ({ ...prev, days: calculateDays(prev.startDate, prev.endDate) }));
  }, []);

  useEffect(() => {
    if (selectedWH) {
      const prods = JSON.parse(localStorage.getItem(`products_wh_${selectedWH}`) || '[]');
      setWhProducts(prods);
    }
  }, [selectedWH]);

  const handleDateChange = (field, value) => {
    const updated = { ...newItem, [field]: value };
    // Start date end date-dən böyük ola bilməz
    if (field === 'startDate' && new Date(value) > new Date(updated.endDate)) {
      updated.endDate = value;
    }
    updated.days = calculateDays(updated.startDate, updated.endDate);
    setNewItem(updated);
  };

  const handleSubmit = () => {
    if (!newItem.name || newItem.pricePerDay <= 0) return alert("Məlumatları tam doldurun!");
    
    onAdd({
      ...newItem,
      id: Date.now(),
      total: Number(newItem.days) * Number(newItem.pricePerDay),
      costTotal: Number(newItem.days) * Number(newItem.costPerDay || 0),
      type: mode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute right-8 top-8 text-gray-400 hover:text-black"><X size={24}/></button>
        
        <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3">
          {mode === 'internal' ? <Database className="text-indigo-600" /> : <ExternalLink className="text-orange-500" />}
          {mode === 'internal' ? 'Anbardan Seç' : 'Kənar Təchizat'}
        </h2>

        <div className="space-y-5">
          {mode === 'internal' ? (
            <>
              <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-500" 
                      onChange={(e) => setSelectedWH(e.target.value)}>
                <option value="">Anbar Seçin</option>
                {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
              </select>
              <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-500"
                      onChange={(e) => {
                        const prod = whProducts.find(p => p.id === Number(e.target.value));
                        if(prod) setNewItem({...newItem, productId: prod.id, name: prod.name, pricePerDay: prod.price || 0});
                      }}>
                <option value="">Məhsul Seçin</option>
                {whProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} ₼)</option>)}
              </select>
            </>
          ) : (
            <>
              <input placeholder="Tədarükçü adı" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none"
                     onChange={e => setNewItem({...newItem, provider: e.target.value})} />
              <input placeholder="Avadanlıq adı" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none"
                     onChange={e => setNewItem({...newItem, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" inputMode="numeric" placeholder="Aldığım (Maya)" className="p-5 bg-orange-50 rounded-2xl font-bold outline-none border border-orange-100"
                       onChange={e => {
                         handleNumberInput(e);
                         setNewItem({...newItem, costPerDay: e.target.value});
                       }} />
                <input type="text" inputMode="numeric" placeholder="Verdiyim (Qiymət)" className="p-5 bg-green-50 rounded-2xl font-bold outline-none border border-green-100"
                       onChange={e => {
                         handleNumberInput(e);
                         setNewItem({...newItem, pricePerDay: e.target.value});
                       }} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 ml-2">BAŞLANĞIC</label>
              <input type="date" className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={newItem.startDate} onChange={e => handleDateChange('startDate', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 ml-2">BİTMƏ</label>
              <input type="date" className="w-full p-4 bg-gray-50 rounded-xl font-bold" min={newItem.startDate} value={newItem.endDate} onChange={e => handleDateChange('endDate', e.target.value)} />
            </div>
          </div>

          <div className="bg-indigo-600 p-4 rounded-2xl flex justify-between items-center text-white">
            <span className="text-[10px] font-black uppercase">Avtomatik Gün:</span>
            <span className="text-xl font-black italic">{newItem.days} GÜN</span>
          </div>

          <button onClick={handleSubmit} className="w-full p-6 bg-black text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform">
            Siyahıya Əlavə Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;