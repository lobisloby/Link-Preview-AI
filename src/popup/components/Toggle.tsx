// src/popup/components/Toggle.tsx
import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label }) => {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-white' : 'bg-white/30'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full transition-transform
          ${enabled 
            ? 'translate-x-6 bg-primary-600' 
            : 'translate-x-1 bg-white'
          }
        `}
      />
      {label && (
        <span className="ml-3 text-sm">{label}</span>
      )}
    </button>
  );
};