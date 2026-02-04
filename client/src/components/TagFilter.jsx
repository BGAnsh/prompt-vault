import React from 'react';

export default function TagFilter({ tags, active, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`chip border ${
          active === 'all'
            ? 'border-accent bg-accent text-white'
            : 'border-transparent bg-ink/10 text-ink'
        }`}
      >
        All
      </button>
      <button
        type="button"
        onClick={() => onSelect('favorites')}
        className={`chip border ${
          active === 'favorites'
            ? 'border-accent bg-accent text-white'
            : 'border-transparent bg-ink/10 text-ink'
        }`}
      >
        ⭐ Favorites
      </button>
      {tags.map((tag) => (
        <button
          type="button"
          key={tag.tag}
          onClick={() => onSelect(tag.tag)}
          className={`chip border ${
            active === tag.tag
              ? 'border-accent bg-accent text-white'
              : 'border-transparent bg-ink/10 text-ink'
          }`}
        >
          #{tag.tag}
          <span className="text-xs opacity-70">{tag.count}</span>
        </button>
      ))}
    </div>
  );
}
