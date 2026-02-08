// src/popup/components/Header.tsx
import React from 'react';
import { UserSettings } from '@shared/types';

interface HeaderProps {
  settings: UserSettings;
  onToggle: (updates: Partial<UserSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onToggle }) => {
  return (
    <header 
      style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #c026d3 100%)',
        padding: '20px',
        color: 'white'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Icon */}
          <div 
            style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          
          {/* Title */}
          <div>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              margin: 0,
              lineHeight: 1.2
            }}>
              Link Preview AI
            </h1>
            <p style={{ 
              fontSize: '12px', 
              opacity: 0.8, 
              margin: 0,
              marginTop: '2px'
            }}>
              Know before you click
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={() => onToggle({ enabled: !settings.enabled })}
          style={{
            position: 'relative',
            width: '48px',
            height: '26px',
            background: settings.enabled ? 'white' : 'rgba(255,255,255,0.3)',
            borderRadius: '13px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            padding: 0
          }}
          aria-label={settings.enabled ? 'Disable extension' : 'Enable extension'}
        >
          <span
            style={{
              position: 'absolute',
              top: '3px',
              left: settings.enabled ? '25px' : '3px',
              width: '20px',
              height: '20px',
              background: settings.enabled ? '#0284c7' : 'white',
              borderRadius: '50%',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          />
        </button>
      </div>
    </header>
  );
};