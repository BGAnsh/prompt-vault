import React from 'react';

const formatTimestamp = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleString();
};

export default function PromptViewer({ prompt, isOpen, onClose, onCopy, onEdit, onDelete, onFavorite }) {
  if (!isOpen || !prompt) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="glass w-full max-w-3xl rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">{prompt.title}</h2>
            <p className="mt-1 text-sm text-ink/70">
              {prompt.tags?.length ? prompt.tags.map((tag) => `#${tag}`).join(' ') : 'No tags'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink/10 px-3 py-1 text-sm font-semibold text-ink hover:bg-ink/20"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-ink/10 bg-white/80 p-4 text-sm text-ink">
            <pre className="whitespace-pre-wrap font-sans">{prompt.content}</pre>
          </div>
          {prompt.notes ? (
            <div className="rounded-xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/80">
              <strong className="text-ink">Notes:</strong> {prompt.notes}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 text-xs text-ink/70">
            <span>Used {prompt.useCount}x</span>
            <span>Last used: {formatTimestamp(prompt.lastUsed)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onFavorite(prompt)}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
          >
            {prompt.favorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(prompt)}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(prompt)}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => onCopy(prompt)}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accentDark"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
