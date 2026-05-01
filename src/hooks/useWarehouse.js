import { useState, useEffect } from 'react';
import { authFetch } from '../utils/apiClient';

const mapProduct = (item) => ({
  id: item.id,
  warehouseId: item.warehouse_id,
  name: item.name,
  category: item.category,
  price: item.price,
  costPrice: item.cost_price,
  status: item.status,
  image: item.image,
  createdAt: item.created_at,
});

const mapWarehouse = (item) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  createdAt: item.created_at,
});

export const useWarehouse = (id) => {
  const [warehouse, setWarehouse] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [warehouseRes, productsRes] = await Promise.all([
          authFetch(`/api/warehouses/${id}`),
          authFetch(`/api/warehouses/${id}/products`),
        ]);

        const warehouseData = await warehouseRes.json().catch(() => ({}));
        const productsData = await productsRes.json().catch(() => ({}));

        setWarehouse(warehouseData.warehouse ? mapWarehouse(warehouseData.warehouse) : null);
        setAllProducts(Array.isArray(productsData.products) ? productsData.products.map(mapProduct) : []);
      } catch (error) {
        console.error('Warehouse details yüklənmədi:', error);
      }
    };

    load();
  }, [id]);

  const addProduct = async (productData) => {
    const response = await authFetch(`/api/warehouses/${id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.product) {
      throw new Error(data.error || 'Məhsul əlavə edilə bilmədi.');
    }

    setAllProducts((prev) => [mapProduct(data.product), ...prev]);
  };

  // updateProduct - tam product obyektini qəbul edir (id daxil)
  const updateProduct = async (updatedData) => {
    const response = await authFetch(`/api/products/${updatedData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.product) {
      throw new Error(data.error || 'Məhsul yenilənə bilmədi.');
    }

    const mapped = mapProduct(data.product);
    setAllProducts((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
  };

  const deleteProduct = async (pid) => {
    const response = await authFetch(`/api/products/${pid}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Məhsul silinə bilmədi.');
    }

    setAllProducts((prev) => prev.filter((p) => p.id !== pid));
  };

  const filteredProducts = allProducts.filter((p) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    warehouse,
    products: filteredProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchTerm,
    setSearchTerm,
  };
};