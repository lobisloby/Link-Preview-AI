// src/shared/theme.ts

export const theme = {
  // Background colors
  bg: {
    primary: '#0f172a',      // Main background (dark slate)
    secondary: '#1e293b',    // Card background
    tertiary: '#334155',     // Hover/active states
    elevated: '#1e293b',     // Elevated surfaces
  },
  
  // Text colors
  text: {
    primary: '#f1f5f9',      // Main text (light)
    secondary: '#94a3b8',    // Secondary text
    muted: '#64748b',        // Muted/disabled text
    inverse: '#0f172a',      // Text on light backgrounds
  },
  
  // Border colors
  border: {
    default: '#334155',
    light: '#475569',
    focus: '#0ea5e9',
  },
  
  // Accent colors
  accent: {
    primary: '#0ea5e9',      // Sky blue
    secondary: '#8b5cf6',    // Purple
    success: '#22c55e',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  
  // Gradients
  gradient: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
    accent: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
    card: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    glow: 'radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent)',
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    glowPurple: '0 0 20px rgba(139, 92, 246, 0.3)',
  },
  
  // Border radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
};