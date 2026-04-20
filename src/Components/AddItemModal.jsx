import React, { useState, useEffect } from 'react';
import { X, Database, ExternalLink } from 'lucide-react';
import { handleNumberInput } from '../utils/numberValidation';

const AddItemModal = ({ mode, projectDates, onClose, onAdd, calculateDays, initialData, isOpen }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWH, setSelectedWH] = useState(initialData?.warehouseId ? String(initialData.warehouseId) : '');
  const [whProducts, setWhProducts] = useState([]);
  
  const [newItem, setNewItem] = useState({
    id: initialData?.id || Date.now(),
    productId: initialData?.productId || '',
    warehouseId: initialData?.warehouseId || '',
    name: initialData?.name || '',
    days: initialData?.days || 1,
    pricePerDay: initialData?.pricePerDay || 0,
    costPerDay: initialData?.costPerDay || 0,
    startDate: initialData?.startDate || projectDates.start || '', 
    endDate: initialData?.endDate || projectDates.end || '', 
    provider: mode === 'internal' ? 'Mənim Anbarım' : (initialData?.provider || '')
  });

  useEffect(() => {
    const whs = JSON.parse(localStorage.getItem('my_warehouses') || '[]');
    setWarehouses(whs);
  }, []);

  useEffect(() => {
    if (selectedWH) {
      const prods = JSON.parse(localStorage.getItem(`products_wh_${selectedWH}`) || '[]');
      setWhProducts(prods);
    } else {
      setWhProducts([]);
    }
  }, [selectedWH]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setSelectedWH(initialData?.warehouseId ? String(initialData.warehouseId) : '');
      setNewItem({
        id: initialData?.id || Date.now(),
        productId: initialData?.productId || '',
        warehouseId: initialData?.warehouseId || '',
        name: initialData?.name || '',
        days: initialData?.days || 1,
        pricePerDay: initialData?.pricePerDay || 0,
        costPerDay: initialData?.costPerDay || 0,
        startDate: initialData?.startDate || projectDates.start || '',
        endDate: initialData?.endDate || projectDates.end || '',
        provider: mode === 'internal' ? 'Mənim Anbarım' : (initialData?.provider || '')
      });
      return;
    }

    setSelectedWH('');
    setNewItem({
      id: Date.now(),
      productId: '',
      warehouseId: '',
      name: '',
      days: calculateDays(projectDates.start, projectDates.end),
      pricePerDay: 0,
      costPerDay: 0,
      startDate: projectDates.start || '',
      endDate: projectDates.end || '',
      provider: mode === 'internal' ? 'Mənim Anbarım' : ''
    });
  }, [initialData, isOpen, mode, projectDates.start, projectDates.end, calculateDays]);

  const handleDateChange = (field, value) => {
    const updated = { ...newItem, [field]: value };
    // Start date end date-dən böyük ola bilməz
    if (field === 'startDate' && new Date(value) > new Date(updated.endDate)) {
      updated.endDate = value;
    }
    updated.days = calculateDays(updated.startDate, updated.endDate);
    setNewItem(updated);
  };

  const handleDaysChange = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setNewItem({ ...newItem, days: cleaned ? Number(cleaned) : 1 });
  };

  const handleSubmit = () => {
    if (mode === 'internal' && (!newItem.productId || !selectedWH)) {
      return alert('Anbar və məhsul seçin!');
    }
    if (!newItem.name || newItem.pricePerDay <= 0) {
      return alert('Məlumatları tam doldurun!');
    }
    onAdd({
      ...newItem,
      warehouseId: mode === 'internal' ? Number(selectedWH) : newItem.warehouseId,
      provider: mode === 'internal' ? 'Mənim Anbarım' : newItem.provider,
      total: Number(newItem.days) * Number(newItem.pricePerDay),
      costTotal: Number(newItem.days) * Number(newItem.costPerDay || 0),
      type: mode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-md z-[100] p-4">
      <div className="relative mx-auto w-full max-w-lg rounded-[3rem] bg-white dark:bg-slate-950 p-10 shadow-2xl animate-in zoom-in duration-200 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <button onClick={onClose} className="absolute right-8 top-8 text-gray-400 dark:text-slate-300 hover:text-black dark:hover:text-white"><X size={24}/></button>
        
        <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
          {mode === 'internal' ? <Database className="text-indigo-600" /> : <ExternalLink className="text-orange-500" />}
          {mode === 'internal' ? 'Anbardan Seç' : 'Kənar Təchizat'}
        </h2>

        <div className="space-y-5">
          {mode === 'internal' ? (
            <>
              <select
                value={selectedWH}
                className="w-full p-5 bg-gray-50 dark:bg-slate-900 dark:text-white rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                onChange={(e) => {
                  setSelectedWH(e.target.value);
                  setNewItem({ ...newItem, warehouseId: Number(e.target.value), productId: '', name: '', pricePerDay: 0, costPerDay: 0 });
                }}>
                <option value="">Anbar Seçin</option>
                {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
              </select>
              <select
                value={newItem.productId || ''}
                className="w-full p-5 bg-gray-50 dark:bg-slate-900 dark:text-white rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                onChange={(e) => {
                  const prod = whProducts.find(p => p.id === Number(e.target.value));
                  if (prod) {
                    setNewItem({
                      ...newItem,
                      productId: prod.id,
                      name: prod.name,
                      pricePerDay: prod.price || 0,
                      costPerDay: prod.costPrice || 0,
                      warehouseId: Number(selectedWH)
                    });
                  }
                }}>
                <option value="">Məhsul Seçin</option>
                {whProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} ₼)</option>)}
              </select>

              {newItem.name && (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-200">
                    Seçilmiş məhsul: {newItem.name}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {!(mode === 'internal' && initialData) && (
                      <div className="relative">
                        <label className="text-[9px] font-black text-gray-400 dark:text-slate-400 ml-2 mb-1 inline-block">Maya / gün</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newItem.costPerDay}
                          placeholder="Maya"
                          className="w-full p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl font-bold outline-none border border-orange-100 dark:border-orange-700/50 dark:text-white placeholder:text-slate-500"
                          onChange={e => {
                            handleNumberInput(e);
                            setNewItem({...newItem, costPerDay: e.target.value});
                          }}
                        />
                      </div>
                    )}
                    <div className={`relative ${mode === 'internal' && initialData ? 'col-span-2' : ''}`}>
                      <label className="text-[9px] font-black text-gray-400 dark:text-slate-400 ml-2 mb-1 inline-block">Qiymət / gün</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newItem.pricePerDay}
                        placeholder="Qiymət"
                        className="w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl font-bold outline-none border border-green-100 dark:border-green-700/50 dark:text-white placeholder:text-slate-500"
                        onChange={e => {
                          handleNumberInput(e);
                          setNewItem({...newItem, pricePerDay: e.target.value});
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <input placeholder="Tədarükçü adı" className="w-full p-5 bg-gray-50 dark:bg-slate-900 dark:text-white rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 placeholder:text-slate-500" 
                     onChange={e => setNewItem({...newItem, provider: e.target.value})} />
              <input placeholder="Avadanlıq adı" className="w-full p-5 bg-gray-50 dark:bg-slate-900 dark:text-white rounded-2xl font-bold outline-none border border-slate-200 dark:border-slate-800 placeholder:text-slate-500" 
                     onChange={e => setNewItem({...newItem, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" inputMode="numeric" placeholder="Aldığım (Maya)" className="p-5 bg-orange-50 dark:bg-orange-900/20 rounded-2xl font-bold outline-none border border-orange-100 dark:border-orange-700/50 dark:text-white placeholder:text-slate-500"
                       onChange={e => {
                         handleNumberInput(e);
                         setNewItem({...newItem, costPerDay: e.target.value});
                       }} />
                <input type="text" inputMode="numeric" placeholder="Verdiyim (Qiymət)" className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl font-bold outline-none border border-green-100 dark:border-green-700/50 dark:text-white placeholder:text-slate-500"
                       onChange={e => {
                         handleNumberInput(e);
                         setNewItem({...newItem, pricePerDay: e.target.value});
                       }} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 dark:text-slate-400 ml-2">BAŞLANĞIC</label>
              <input type="date" className="w-full p-4 bg-gray-50 dark:bg-slate-900 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-slate-800" value={newItem.startDate} onChange={e => handleDateChange('startDate', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 dark:text-slate-400 ml-2">BİTMƏ</label>
              <input type="date" className="w-full p-4 bg-gray-50 dark:bg-slate-900 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-slate-800" min={newItem.startDate} value={newItem.endDate} onChange={e => handleDateChange('endDate', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 dark:text-slate-400 ml-2">GÜN</label>
            <input
              type="text"
              inputMode="numeric"
              value={newItem.days}
              className="w-full p-4 bg-gray-50 dark:bg-slate-900 dark:text-white rounded-xl font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-yellow-500"
              onChange={e => {
                handleNumberInput(e);
                handleDaysChange(e.target.value);
              }}
            />
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