import React, { useEffect, useState } from 'react';

export default function PromptForm({ isOpen, onClose, onSave, initialPrompt }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialPrompt?.title ?? '');
    setContent(initialPrompt?.content ?? '');
    setTags(initialPrompt?.tags ? initialPrompt.tags.join(', ') : '');
    setNotes(initialPrompt?.notes ?? '');
    setFavorite(Boolean(initialPrompt?.favorite));
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      title: title.trim(),
      content: content.trim(),
      tags,
      notes: notes.trim(),
      favorite,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="glass w-full max-w-2xl rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {initialPrompt ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink/10 px-3 py-1 text-sm font-semibold text-ink hover:bg-ink/20"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-ink">Title *</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">Content *</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="coding, writing, research"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(event) => setFavorite(event.target.checked)}
            />
            Mark as favorite
          </label>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accentDark"
            >
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
