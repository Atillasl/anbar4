import { useState, useEffect } from 'react';
import { authFetch } from '../utils/apiClient';

const mapProject = (item) => ({
  id: item.id,
  name: item.name,
  client: item.client,
  startDate: item.start_date,
  endDate: item.end_date,
  prepayment: item.prepayment,
  budget: item.budget,
  notes: item.notes,
  status: item.status,
  progress: item.progress,
  createdAt: item.created_at,
});

const mapItem = (item) => ({
  id: item.id,
  projectId: item.project_id,
  warehouseId: item.warehouse_id,
  productId: item.product_id,
  name: item.name,
  days: item.days,
  pricePerDay: item.price_per_day,
  costPerDay: item.cost_per_day,
  startDate: item.start_date,
  endDate: item.end_date,
  provider: item.provider,
  total: item.total,
  costTotal: item.cost_total,
  type: item.type,
  createdAt: item.created_at,
});

const toProjectPayload = (project) => ({
  name: project.name,
  client: project.client,
  startDate: project.startDate,
  endDate: project.endDate,
  prepayment: project.prepayment,
  budget: project.budget,
  notes: project.notes,
  status: project.status,
  progress: project.progress,
});

const toItemPayload = (item) => ({
  warehouseId: item.warehouseId,
  productId: item.productId,
  name: item.name,
  days: item.days,
  pricePerDay: item.pricePerDay,
  costPerDay: item.costPerDay,
  startDate: item.startDate,
  endDate: item.endDate,
  provider: item.provider,
  total: item.total,
  costTotal: item.costTotal,
  type: item.type,
});

export const useProjectActions = (id) => {
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [projectRes, itemsRes] = await Promise.all([
          authFetch(`/api/projects/${id}`),
          authFetch(`/api/projects/${id}/items`),
        ]);

        const projectData = await projectRes.json().catch(() => ({}));
        const itemsData = await itemsRes.json().catch(() => ({}));

        if (!projectRes.ok || !projectData.project) {
          setError(projectData.error || 'Layihə tapılmadı və ya giriş icazəsi yoxdur.');
          setProject(null);
          setEditData({});
          return;
        }

        const mapped = mapProject(projectData.project);
        mapped.items = Array.isArray(itemsData.items) ? itemsData.items.map(mapItem) : [];

        setProject(mapped);
        setEditData(mapped);
      } catch (error) {
        console.error('Project yüklənmədi:', error);
        setError('Layihə yüklənərkən xəta baş verdi.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const saveProject = async (updated) => {
    const response = await authFetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toProjectPayload(updated)),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.project) {
      throw new Error(data.error || 'Layihə yadda saxlanılmadı.');
    }

    const mapped = mapProject(data.project);
    mapped.items = project?.items || [];
    setProject(mapped);
    setEditData(mapped);
  };

  const upsertProjectItem = async (item) => {
    if (item.id) {
      const response = await authFetch(`/api/project-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toItemPayload(item)),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.item) {
        throw new Error(data.error || 'Item yenilənmədi.');
      }

      const mapped = mapItem(data.item);
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: (prev.items || []).map((i) => (i.id === mapped.id ? mapped : i)),
        };
      });
      return mapped;
    }

    const response = await authFetch(`/api/projects/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toItemPayload(item)),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.item) {
      throw new Error(data.error || 'Item əlavə edilmədi.');
    }

    const mapped = mapItem(data.item);
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [...(prev.items || []), mapped],
      };
    });
    return mapped;
  };

  const deleteProjectItem = async (itemId) => {
    const response = await authFetch(`/api/project-items/${itemId}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Item silinmədi.');
    }

    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: (prev.items || []).filter((i) => i.id !== itemId),
      };
    });
  };

  const deleteProject = async () => {
    const response = await authFetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Layihə silinmədi.');
    }
  };

  const finance = {
    totalRevenue: Math.round(
      (project?.items?.reduce((acc, curr) =>
        acc + (Number(curr.days) || 0) * (Number(curr.pricePerDay) || 0), 0) || 0) * 100
    ) / 100,
    totalCost: Math.round(
      (project?.items?.reduce((acc, curr) =>
        acc + (Number(curr.days) || 0) * (Number(curr.costPerDay) || 0), 0) || 0) * 100
    ) / 100,
    get netProfit() { return Math.round((this.totalRevenue - this.totalCost) * 100) / 100; }
  };

  return {
    project,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    loading,
    error,
    saveProject,
    upsertProjectItem,
    deleteProjectItem,
    deleteProject,
    calculateDays,
    finance,
  };
};