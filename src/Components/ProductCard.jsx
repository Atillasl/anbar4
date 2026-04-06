import { Trash2, Image as ImageIcon, Edit3 } from 'lucide-react';

const ProductCard = ({ product, onDelete, onEdit }) => (
  <div className="group bg-white dark:bg-[#0D1117] rounded-lg sm:rounded-2xl md:rounded-[3rem] border-2 border-transparent hover:border-yellow-500 transition-all shadow-sm overflow-hidden">
    <div className="h-40 sm:h-48 bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center">
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <ImageIcon size={40} className="text-slate-300 dark:text-slate-700" />
      )}

      {/* Action buttons */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="p-1.5 sm:p-2 bg-blue-500/90 backdrop-blur-md rounded-lg sm:rounded-xl text-white hover:scale-110 active:scale-90 shadow-lg transition-all"
          >
            <Edit3 size={16} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product.id);
          }}
          className="p-1.5 sm:p-2 bg-white/90 dark:bg-[#0D1117]/90 backdrop-blur-md rounded-lg sm:rounded-xl text-red-500 hover:scale-110 active:scale-90 shadow-lg"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    <div className="p-4 sm:p-6 md:p-8">
      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-1 truncate">
        {product.name}
      </h3>
      <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">
        {product.category}
      </p>
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 sm:pt-4 text-yellow-600 dark:text-yellow-500 font-black text-lg sm:text-xl italic tracking-tighter gap-2">
        <span className="truncate">{product.price} ₼</span> <span className="text-[7px] sm:text-[8px] text-slate-400 dark:text-slate-500 uppercase not-italic tracking-widest whitespace-nowrap flex-shrink-0">GÜNLÜK</span>
      </div>
    </div>
  </div>
);

export default ProductCard;