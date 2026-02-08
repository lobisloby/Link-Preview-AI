// src/popup/components/Header.tsx - Cleaner version
import React from 'react';
import { UserSettings } from '@shared/types';
import { Zap, ZapOff } from 'lucide-react';

interface HeaderProps {
  settings: UserSettings;
  onToggle: (updates: Partial<UserSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onToggle }) => {
  const iconUrl = chrome.runtime.getURL('icons/icon48.png');

  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
        padding: '20px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Icon Container */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <img
              src={iconUrl}
              alt="Link Preview AI"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <div>
            <h1
              style={{
                fontSize: '17px',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Link Preview AI
            </h1>
            <p
              style={{
                fontSize: '12px',
                margin: '3px 0 0 0',
                opacity: 0.85,
                fontWeight: 500,
              }}
            >
              Know before you click
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => onToggle({ enabled: !settings.enabled })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: settings.enabled
              ? 'rgba(255,255,255,0.95)'
              : 'rgba(255,255,255,0.2)',
            color: settings.enabled ? '#7c3aed' : 'white',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s ease',
            boxShadow: settings.enabled
              ? '0 4px 12px rgba(0,0,0,0.15)'
              : 'none',
          }}
        >
          {settings.enabled ? (
            <>
              <Zap size={16} fill="currentColor" />
              Active
            </>
          ) : (
            <>
              <ZapOff size={16} />
              Paused
            </>
          )}
        </button>
      </div>
    </header>
  );
};