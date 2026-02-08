// src/content/index.tsx
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';
import './styles/content.css';

// Create container for React app
const containerId = 'link-preview-ai-root';

// Check if container already exists (for hot reload)
let container = document.getElementById(containerId);

if (!container) {
  container = document.createElement('div');
  container.id = containerId;
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 2147483647;
    pointer-events: none;
  `;
  document.body.appendChild(container);
}

// Mount React app
const root = createRoot(container);
root.render(<App />);