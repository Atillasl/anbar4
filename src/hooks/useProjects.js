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

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await authFetch('/api/projects');
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return;
        setProjects(Array.isArray(data.projects) ? data.projects.map(mapProject) : []);
      } catch (error) {
        console.error('Layihələr yüklənmədi:', error);
      }
    };

    load();
  }, []);

  const addProject = async (newProj) => {
    const response = await authFetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.project) {
      throw new Error(data.error || 'Layihə əlavə edilə bilmədi.');
    }

    setProjects((prev) => [mapProject(data.project), ...prev]);
  };

  const updateProject = async (id, updatedData) => {
    const response = await authFetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.project) {
      throw new Error(data.error || 'Layihə yenilənə bilmədi.');
    }

    const mapped = mapProject(data.project);
    setProjects((prev) => prev.map((p) => (p.id === id ? mapped : p)));
  };

  const deleteProject = async (id) => {
    if (window.confirm('Bu layihəni silmək istədiyinizə əminsiniz?')) {
      const response = await authFetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Layihə silinə bilmədi.');
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredProjects = projects.filter((p) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    projects: filteredProjects,
    allProjects: projects,
    searchTerm,
    setSearchTerm,
    addProject,
    updateProject,
    deleteProject,
  };
};