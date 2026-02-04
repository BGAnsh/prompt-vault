import React from 'react';

const formatTimestamp = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleString();
};

export default function PromptCard({ prompt, onCopy, onEdit, onDelete, onFavorite, onView }) {
  const handleCopy = (event) => {
    event.stopPropagation();
    onCopy(prompt);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    onEdit(prompt);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(prompt);
  };

  const handleFavorite = (event) => {
    event.stopPropagation();
    onFavorite(prompt);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(prompt)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onView(prompt);
        }
      }}
      className="glass group flex w-full flex-col gap-4 rounded-2xl p-5 text-left transition hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">{prompt.title}</h3>
            {prompt.favorite && (
              <span className="text-lg" aria-label="Favorite">
                ★
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink/70">{prompt.notes || 'No notes yet.'}</p>
        </div>
        <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink">
          Used {prompt.useCount}x
        </span>
      </div>

      <p className="text-sm text-ink/80">
        {prompt.content.length > 200 ? `${prompt.content.slice(0, 200)}…` : prompt.content}
      </p>

      <div className="flex flex-wrap gap-2">
        {prompt.tags?.length ? (
          prompt.tags.map((tag) => (
            <span key={tag} className="chip bg-ink/10 text-ink">
              #{tag}
            </span>
          ))
        ) : (
          <span className="chip bg-ink/5 text-ink/60">No tags</span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink/70">
        <span>Last used: {formatTimestamp(prompt.lastUsed)}</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleFavorite}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold transition hover:border-accent hover:text-accent"
          >
            {prompt.favorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold transition hover:border-accent hover:text-accent"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold transition hover:border-accent hover:text-accent"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white transition hover:bg-accentDark"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
