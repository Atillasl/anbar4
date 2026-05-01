import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, ArrowLeft, Layers, Sparkles, Target
} from 'lucide-react';
import { authFetch } from '../utils/apiClient';

const Statistics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalWarehouses: 0,
    totalProducts: 0,
    rentedRate: 0,
    warehouseStats: [],
    efficiency: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const warehousesRes = await authFetch('/api/warehouses');
        const warehousesData = await warehousesRes.json().catch(() => ({}));
        const warehouses = Array.isArray(warehousesData.warehouses) ? warehousesData.warehouses : [];

        let totalP = 0;
        let totalR = 0;

        const warehouseStats = await Promise.all(
          warehouses.map(async (wh) => {
            const productsRes = await authFetch(`/api/warehouses/${wh.id}/products`);
            const productsData = await productsRes.json().catch(() => ({}));
            const products = Array.isArray(productsData.products) ? productsData.products : [];
            const rentedInWh = products.filter((p) => p.status === 'Rented').length;

            totalP += products.length;
            totalR += rentedInWh;

            return {
              name: wh.name,
              count: products.length,
              rented: rentedInWh,
              percent: products.length > 0 ? Math.round((rentedInWh / products.length) * 100) : 0,
            };
          })
        );

        setData({
          totalWarehouses: warehouses.length,
          totalProducts: totalP,
          rentedRate: totalP > 0 ? Math.round((totalR / totalP) * 100) : 0,
          warehouseStats,
          efficiency: totalP > 0 ? (totalR * 1.5).toFixed(1) : '0.0',
        });
      } catch (error) {
        console.error('Statistika yüklənmədi:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#F8FAFC] dark:bg-gray-950 min-h-screen pb-20 transition-colors duration-500">
      
      {/* ÜST NAVİQASİYA */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="group flex items-center text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 mb-4 transition-all font-black text-[10px] tracking-[0.3em]"
          >
            <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm mr-3 group-hover:-translate-x-1 transition-transform border border-transparent dark:border-gray-800">
                <ArrowLeft size={14} strokeWidth={3} />
            </div>
            GERİ QAYIT
          </button>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase flex items-center gap-4">
            STATİSTİKA <Sparkles className="text-yellow-400" size={32} />
          </h1>
          <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-2 uppercase tracking-widest italic ml-1">İmperiyanın Cari Vəziyyəti</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-[2rem] shadow-xl shadow-indigo-50 dark:shadow-none border-b-4 border-indigo-100 dark:border-indigo-900/50 flex items-center gap-4 transition-colors">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Canlı Analitika Aktivdir</span>
        </div>
      </div>

      {/* ƏSAS GÖSTƏRİCİ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Anbarlar Kartı */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border-b-[10px] border-indigo-600 shadow-2xl shadow-indigo-50 dark:shadow-none group hover:-translate-y-2 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[1.5rem] group-hover:rotate-12 transition-transform">
                <Layers size={32} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-black text-indigo-400 border-2 border-indigo-50 dark:border-indigo-900/50 px-3 py-1 rounded-xl">SEKTORLAR</div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Cəmi Aktiv Sahə</p>
          <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter italic">{data.totalWarehouses}</h3>
        </div>

        {/* Doluluq Kartı */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border-b-[10px] border-orange-500 shadow-2xl shadow-orange-50 dark:shadow-none group hover:-translate-y-2 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-[1.5rem] group-hover:rotate-12 transition-transform">
                <TrendingUp size={32} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-black text-orange-400 border-2 border-orange-50 dark:border-orange-900/50 px-3 py-1 rounded-xl">RENDİMENT</div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Arenda Faizi</p>
          <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter italic">{data.rentedRate}%</h3>
        </div>

        {/* Səmərəlilik Kartı */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-950 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none border-b-[10px] border-indigo-900 group hover:-translate-y-2 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-white/10 text-white rounded-[1.5rem] group-hover:scale-110 transition-transform">
                <Target size={32} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-black text-indigo-200 border-2 border-white/20 px-3 py-1 rounded-xl">SCORE</div>
          </div>
          <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Səmərəlilik Balı</p>
          <h3 className="text-6xl font-black tracking-tighter italic">{data.efficiency}</h3>
          <p className="text-[9px] text-indigo-300 mt-4 font-bold uppercase tracking-widest opacity-80 italic">Global Tycoon Rank: #1</p>
        </div>
      </div>

      {/* ANALİZ CƏDVƏLİ */}
      <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-sm border-2 border-gray-50 dark:border-gray-800 overflow-hidden mb-12 transition-colors">
        <div className="p-10 bg-gray-50/50 dark:bg-gray-800/50 border-b-2 border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter italic">Sektor Performansı</h2>
          <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700">
             <BarChart3 size={20} className="text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Sektor Adı</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Stok</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">İcarə</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Güc Barı</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Reytinq</th>
              </tr>
            </thead>
            <tbody className="divide-y-8 divide-white dark:divide-gray-900">
              {data.warehouseStats.map((wh, idx) => (
                <tr key={idx} className="bg-gray-50/30 dark:bg-gray-800/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group">
                  <td className="p-6 rounded-l-[2rem]">
                    <div className="font-black text-gray-800 dark:text-gray-200 text-lg uppercase tracking-tight">{wh.name}</div>
                  </td>
                  <td className="p-6 font-bold text-gray-500 dark:text-gray-400">{wh.count} ədəd</td>
                  <td className="p-6 font-bold text-gray-500 dark:text-gray-400">{wh.rented} ədəd</td>
                  <td className="p-6 min-w-[200px]">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            wh.percent > 70 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                            wh.percent > 30 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 
                            'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${wh.percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-gray-300">{wh.percent}%</span>
                    </div>
                  </td>
                  <td className="p-6 rounded-r-[2rem]">
                    {wh.percent > 50 ? (
                      <span className="flex items-center gap-2 text-[9px] font-black text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-xl uppercase tracking-widest">
                        <CheckCircle2 size={14} /> ELİT
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[9px] font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-xl uppercase tracking-widest">
                        <Clock size={14} /> STANDART
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STRATEJİ MƏSLƏHƏTLƏR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[3rem] border-l-[12px] border-red-500 flex items-start gap-6 shadow-lg shadow-red-50 dark:shadow-none">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-2xl"><AlertTriangle size={28} strokeWidth={3} /></div>
          <div>
            <h4 className="font-black text-red-900 dark:text-red-400 text-lg uppercase tracking-tighter italic">Kritik Xəbərdarlıq</h4>
            <p className="text-sm text-red-700 dark:text-gray-400 mt-2 font-bold leading-relaxed">
              Bəzi sektorlarda arenda dərəcəsi çox aşağıdır! Göstərici 20%-in altına düşsə, resurs itkisi riski yaranacaq. 
            </p>
          </div>
        </div>
        
        <div className="bg-indigo-600 dark:bg-indigo-900 p-8 rounded-[3rem] border-l-[12px] border-yellow-400 flex items-start gap-6 shadow-lg shadow-indigo-100 dark:shadow-none">
          <div className="p-4 bg-white/10 dark:bg-indigo-800/50 text-yellow-400 rounded-2xl"><Sparkles size={28} strokeWidth={3} /></div>
          <div>
            <h4 className="font-black text-white text-lg uppercase tracking-tighter italic">Növbəti Hədəf</h4>
            <p className="text-sm text-indigo-100 dark:text-indigo-200 mt-2 font-bold leading-relaxed">
              Səmərəlilik balını artırmaq üçün boşda qalan məhsulları yeni kirayəçilərə yönləndirin. Hədəf: Global Rank #1!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Statistics;