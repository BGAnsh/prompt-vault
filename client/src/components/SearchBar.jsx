import React from 'react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="text-lg">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search prompts by title, content, or tags..."
        className="w-full bg-transparent text-sm text-ink placeholder:text-ink/50 focus:outline-none"
      />
    </div>
  );
}
