import React from 'react';
import PromptCard from './PromptCard.jsx';

export default function PromptList({ prompts, onCopy, onEdit, onDelete, onFavorite, onView }) {
  if (!prompts.length) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <h3 className="font-display text-xl text-ink">Your vault is empty</h3>
        <p className="mt-2 text-sm text-ink/70">
          Add your first prompt to start building a reusable library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
          onFavorite={onFavorite}
          onView={onView}
        />
      ))}
    </div>
  );
}
