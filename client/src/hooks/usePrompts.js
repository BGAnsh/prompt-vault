import { useCallback, useState } from 'react';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export default function usePrompts() {
  const [prompts, setPrompts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrompts = useCallback(async ({ search, tag, favorite } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery({ search, tag, favorite });
      const response = await fetch(`/api/prompts${query}`);
      if (!response.ok) throw new Error('Failed to load prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      setError(err.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to load tags');
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err.message || 'Failed to load tags');
    }
  }, []);

  const createPrompt = useCallback(async (payload) => {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create prompt');
    const data = await response.json();
    return data;
  }, []);

  const updatePrompt = useCallback(async (id, payload) => {
    const response = await fetch(`/api/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update prompt');
    const data = await response.json();
    return data;
  }, []);

  const deletePrompt = useCallback(async (id) => {
    const response = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete prompt');
    return true;
  }, []);

  const recordCopy = useCallback(async (id) => {
    const response = await fetch(`/api/prompts/${id}/copy`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to record copy');
    const data = await response.json();
    return data;
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const response = await fetch(`/api/prompts/${id}/favorite`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to update favorite');
    const data = await response.json();
    return data;
  }, []);

  return {
    prompts,
    tags,
    loading,
    error,
    fetchPrompts,
    fetchTags,
    createPrompt,
    updatePrompt,
    deletePrompt,
    recordCopy,
    toggleFavorite,
  };
}
