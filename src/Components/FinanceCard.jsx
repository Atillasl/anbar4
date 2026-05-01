import { TrendingUp } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FinanceCard = ({ finance }) => (
  <div className="bg-indigo-600 p-6 sm:p-8 md:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
    <TrendingUp className="absolute -right-6 -bottom-6 opacity-10" size={200} />
    <div className="relative z-10 space-y-6 sm:space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Sifariş Dəyəri</p>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter">{fmt(finance.totalRevenue)} ₼</h3>
      </div>
      <div className="pt-4 sm:pt-6 border-t border-white/10">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">Maya Dəyəri</p>
        <p className="text-lg font-black italic opacity-80">{fmt(finance.totalCost)} ₼</p>
      </div>
    </div>
  </div>
);

export default FinanceCard;