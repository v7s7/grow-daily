/**
 * GrowDaily Design System
 * Comprehensive theme tokens for consistent, premium UI
 */

export const theme = {
  // Color Palette - Deep, calm, trustworthy
  colors: {
    // Primary brand colors
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f8cc6a', // Main brand gold
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    // Background layers
    background: {
      primary: '#021d34',    // Main dark blue
      secondary: '#0a1f35',  // Slightly lighter
      tertiary: '#10172a',   // Card backgrounds
      elevated: '#092945',   // Elevated surfaces
      overlay: 'rgba(2, 29, 52, 0.95)',
    },

    // Text colors
    text: {
      primary: '#f8cc6a',      // Gold text
      secondary: '#cbd5e1',    // Light gray
      tertiary: '#94a3b8',     // Muted gray
      inverse: '#021d34',      // Dark on light
      white: '#ffffff',
      disabled: '#64748b',
    },

    // Semantic colors
    success: {
      light: '#6ee7b7',
      main: '#4ade80',
      dark: '#10b981',
      bg: 'rgba(74, 222, 128, 0.1)',
    },
    error: {
      light: '#fca5a5',
      main: '#ef4444',
      dark: '#dc2626',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    warning: {
      light: '#fcd34d',
      main: '#f59e0b',
      dark: '#d97706',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    info: {
      light: '#7dd3fc',
      main: '#3b82f6',
      dark: '#2563eb',
      bg: 'rgba(59, 130, 246, 0.1)',
    },

    // Progress states
    progress: {
      incomplete: '#64748b',
      partial: '#f59e0b',
      complete: '#4ade80',
      streak: '#f8cc6a',
    },
  },

  // Spacing scale (based on 4px grid)
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  // Typography scale
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      arabic: "'Cairo', 'Inter', sans-serif",
      mono: "'Fira Code', 'Consolas', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 4px 8px rgba(0, 0, 0, 0.2)',
    md: '0 6px 18px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 50px rgba(0, 0, 0, 0.5)',
    glow: {
      gold: '0 0 12px rgba(248, 204, 106, 0.4)',
      success: '0 0 12px rgba(74, 222, 128, 0.4)',
      error: '0 0 12px rgba(239, 68, 68, 0.4)',
    },
  },

  // Z-index scale
  zIndex: {
    base: 1,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
  },

  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '250ms ease',
    slow: '400ms ease',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '375px',
    md: '768px',
    lg: '1024px',
    xl: '1440px',
  },

  // Common patterns
  patterns: {
    // Button sizes
    button: {
      sm: {
        padding: '8px 16px',
        fontSize: '14px',
        borderRadius: '8px',
      },
      md: {
        padding: '10px 20px',
        fontSize: '16px',
        borderRadius: '8px',
      },
      lg: {
        padding: '12px 24px',
        fontSize: '18px',
        borderRadius: '12px',
      },
    },

    // Input styles
    input: {
      height: '44px',
      padding: '10px 16px',
      fontSize: '16px',
      borderRadius: '8px',
    },

    // Card styles
    card: {
      padding: '24px',
      borderRadius: '16px',
      background: '#10172a',
    },
  },
};

export default theme;
