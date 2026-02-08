// src/content/components/LoadingSpinner.tsx
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);