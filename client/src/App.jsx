import React, { useCallback, useEffect, useMemo, useState } from 'react';
import usePrompts from './hooks/usePrompts.js';
import PromptForm from './components/PromptForm.jsx';
import PromptList from './components/PromptList.jsx';
import PromptViewer from './components/PromptViewer.jsx';
import SearchBar from './components/SearchBar.jsx';
import TagFilter from './components/TagFilter.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const {
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
  } = usePrompts();

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [viewPrompt, setViewPrompt] = useState(null);
  const [toast, setToast] = useState('');

  const queryParams = useMemo(() => {
    const params = { search: search.trim() };
    if (activeTag === 'favorites') {
      params.favorite = 'true';
    } else if (activeTag !== 'all') {
      params.tag = activeTag;
    }
    return params;
  }, [search, activeTag]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrompts(queryParams);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPrompts, queryParams]);

  const refreshPrompts = useCallback(() => {
    fetchPrompts(queryParams);
  }, [fetchPrompts, queryParams]);

  const handleSavePrompt = async (payload) => {
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, payload);
        setToast('Prompt updated');
      } else {
        await createPrompt(payload);
        setToast('Prompt added');
      }
      setIsFormOpen(false);
      setEditingPrompt(null);
      fetchTags();
      refreshPrompts();
    } catch (err) {
      setToast(err.message || 'Something went wrong');
    }
  };

  const handleDeletePrompt = async (prompt) => {
    if (!window.confirm('Delete this prompt?')) return;
    try {
      await deletePrompt(prompt.id);
      setToast('Prompt deleted');
      fetchTags();
      refreshPrompts();
      if (viewPrompt?.id === prompt.id) setViewPrompt(null);
    } catch (err) {
      setToast(err.message || 'Failed to delete');
    }
  };

  const handleCopyPrompt = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      await recordCopy(prompt.id);
      setToast('Copied to clipboard');
      refreshPrompts();
    } catch (err) {
      setToast('Copy failed');
    }
  };

  const handleFavoritePrompt = async (prompt) => {
    try {
      await toggleFavorite(prompt.id);
      refreshPrompts();
      fetchTags();
    } catch (err) {
      setToast('Favorite update failed');
    }
  };

  const openNewPrompt = () => {
    setEditingPrompt(null);
    setIsFormOpen(true);
  };

  const openEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen px-4 pb-20 pt-10 md:px-10">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
            Prompt Vault
          </p>
          <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
            Your AI prompt library.
          </h1>
          <p className="mt-3 max-w-xl text-balance text-sm text-ink/70">
            Store, tag, and refine your best prompts. Copy them fast, track usage, and keep
            favorites close.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openNewPrompt}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            + New Prompt
          </button>
          <div className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink">
            {prompts.length} prompts
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-6">
        <SearchBar value={search} onChange={setSearch} />
        <TagFilter tags={tags} active={activeTag} onSelect={setActiveTag} />

        {error ? (
          <div className="glass rounded-2xl p-6 text-sm text-ink/70">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="glass rounded-2xl p-6 text-sm text-ink/70">Loading prompts...</div>
        ) : (
          <PromptList
            prompts={prompts}
            onCopy={handleCopyPrompt}
            onEdit={openEditPrompt}
            onDelete={handleDeletePrompt}
            onFavorite={handleFavoritePrompt}
            onView={setViewPrompt}
          />
        )}
      </main>

      <PromptForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePrompt}
        initialPrompt={editingPrompt}
      />

      <PromptViewer
        prompt={viewPrompt}
        isOpen={Boolean(viewPrompt)}
        onClose={() => setViewPrompt(null)}
        onCopy={handleCopyPrompt}
        onEdit={(prompt) => {
          setViewPrompt(null);
          openEditPrompt(prompt);
        }}
        onDelete={handleDeletePrompt}
        onFavorite={handleFavoritePrompt}
      />

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
