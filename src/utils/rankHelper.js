export const calculateRank = () => {
  const warehouses = JSON.parse(localStorage.getItem('my_warehouses') || '[]');
  let totalItems = 0;
  
  warehouses.forEach(wh => {
    const products = JSON.parse(localStorage.getItem(`products_wh_${wh.id}`) || '[]');
    totalItems += products.length;
  });

  if (totalItems >= 20) return { title: "İcarə", color: "text-yellow-500", icon: "👑" };
  if (totalItems >= 5) return { title: "Sahə Meneceri", color: "text-indigo-500", icon: "💎" };
  return { title: "Yeni Başlayan", color: "text-green-500", icon: "🌱" };
};