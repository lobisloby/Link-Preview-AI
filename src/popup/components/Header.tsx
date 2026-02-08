// src/popup/components/Header.tsx
import React from 'react';
import { UserSettings } from '@shared/types';
import { Toggle } from './Toggle';

interface HeaderProps {
  settings: UserSettings;
  onToggle: (updates: Partial<UserSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onToggle }) => {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-white"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg">Link Preview AI</h1>
            <p className="text-sm text-white/70">Know before you click</p>
          </div>
        </div>
        
        <Toggle
          enabled={settings.enabled}
          onChange={(enabled) => onToggle({ enabled })}
        />
      </div>
    </header>
  );
};