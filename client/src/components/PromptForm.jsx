import React, { useEffect, useState } from 'react';

export default function PromptForm({ isOpen, onClose, onSave, initialPrompt }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialPrompt?.title ?? '');
    setContent(initialPrompt?.content ?? '');
    setTags(initialPrompt?.tags ?? []);
    setTagInput('');
    setNotes(initialPrompt?.notes ?? '');
    setFavorite(Boolean(initialPrompt?.favorite));
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  const parseTags = (value) =>
    value
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

  const mergeTags = (existing, incoming) => {
    const next = [...existing];
    incoming.forEach((tag) => {
      const normalized = tag.toLowerCase();
      if (next.some((current) => current.toLowerCase() === normalized)) return;
      next.push(tag);
    });
    return next;
  };

  const commitTagInput = (value = tagInput) => {
    const incoming = parseTags(value);
    if (!incoming.length) return;
    setTags((prev) => mergeTags(prev, incoming));
    setTagInput('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const pendingTags = parseTags(tagInput);
    const finalTags = pendingTags.length ? mergeTags(tags, pendingTags) : tags;
    if (pendingTags.length) {
      setTags(finalTags);
      setTagInput('');
    }
    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: finalTags,
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
            <label className="text-sm font-semibold text-ink">Tags</label>
            <div className="mt-2 flex min-h-[44px] flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-accent/40">
              {tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="chip bg-ink/10 text-ink">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((_, i) => i !== index))}
                    className="text-xs font-semibold text-ink/60 hover:text-ink"
                    aria-label={`Remove ${tag}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
                    if (!tagInput.trim()) return;
                    event.preventDefault();
                    commitTagInput();
                  }
                }}
                onBlur={() => {
                  if (!tagInput.trim()) return;
                  commitTagInput();
                }}
                onPaste={(event) => {
                  const text = event.clipboardData.getData('text');
                  if (!text) return;
                  event.preventDefault();
                  const incoming = parseTags(`${tagInput} ${text}`);
                  if (incoming.length) {
                    setTags((prev) => mergeTags(prev, incoming));
                    setTagInput('');
                  }
                }}
                className="min-w-[140px] flex-1 bg-transparent text-sm focus:outline-none"
                placeholder="Type a tag and press Enter"
              />
            </div>
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
