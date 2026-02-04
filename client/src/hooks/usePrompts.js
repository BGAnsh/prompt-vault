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

const NETWORK_FAILURE_MESSAGE = 'Session expired or API unreachable — refresh the page';

const getErrorMessage = (err, fallback) => {
  const message = err?.message || '';
  if (err?.name === 'TypeError' || /failed to fetch/i.test(message)) {
    return NETWORK_FAILURE_MESSAGE;
  }
  return message || fallback;
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
      const response = await fetch(`/api/prompts${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to load prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load prompts'));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to load tags');
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load tags'));
    }
  }, []);

  const createPrompt = useCallback(async (payload) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create prompt');
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to create prompt'));
    }
  }, []);

  const updatePrompt = useCallback(async (id, payload) => {
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update prompt');
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to update prompt'));
    }
  }, []);

  const deletePrompt = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete prompt');
      return true;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to delete prompt'));
    }
  }, []);

  const recordCopy = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/prompts/${id}/copy`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to record copy');
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to record copy'));
    }
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/prompts/${id}/favorite`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update favorite');
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to update favorite'));
    }
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
