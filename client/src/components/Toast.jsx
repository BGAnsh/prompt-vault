import React, { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  );
}
