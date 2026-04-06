import { useState, useEffect } from 'react';

export const useWarehouse = (id) => {
  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const whs = JSON.parse(localStorage.getItem('my_warehouses') || '[]');
    setWarehouse(whs.find(w => w.id === Number(id)));
    setProducts(JSON.parse(localStorage.getItem(`products_wh_${id}`) || '[]'));
  }, [id]);

  const addProduct = (productData) => {
    const updated = [...products, { ...productData, id: Date.now() }];
    setProducts(updated);
    localStorage.setItem(`products_wh_${id}`, JSON.stringify(updated));
  };

  // FIXED: Add missing updateProduct function
  const updateProduct = (productId, updatedData) => {
    const updated = products.map(p => 
      p.id === productId ? { ...p, ...updatedData } : p
    );
    setProducts(updated);
    localStorage.setItem(`products_wh_${id}`, JSON.stringify(updated));
  };

  const deleteProduct = (pid) => {
    const updated = products.filter(p => p.id !== pid);
    setProducts(updated);
    localStorage.setItem(`products_wh_${id}`, JSON.stringify(updated));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return { warehouse, products: filteredProducts, addProduct, updateProduct, deleteProduct, searchTerm, setSearchTerm };
};