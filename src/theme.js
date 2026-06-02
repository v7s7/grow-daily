export const theme = {
  colors: {
    primary: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#F5C533',
      600: '#F0A500',
      700: '#D48900',
      800: '#B07200',
      900: '#8C5C00',
    },
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
      elevated: '#3A3A3C',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(235, 235, 245, 0.6)',
      tertiary: 'rgba(235, 235, 245, 0.3)',
      inverse: '#000000',
      white: '#FFFFFF',
      disabled: 'rgba(235, 235, 245, 0.25)',
    },
    success: {
      light: '#7DE2A0',
      main: '#34C759',
      dark: '#30A851',
      bg: 'rgba(52, 199, 89, 0.15)',
    },
    error: {
      light: '#FF8682',
      main: '#FF3B30',
      dark: '#E0342A',
      bg: 'rgba(255, 59, 48, 0.15)',
    },
    warning: {
      light: '#FFD426',
      main: '#FF9F0A',
      dark: '#E08E09',
      bg: 'rgba(255, 159, 10, 0.15)',
    },
    info: {
      light: '#409CFF',
      main: '#007AFF',
      dark: '#006DE6',
      bg: 'rgba(0, 122, 255, 0.15)',
    },
    progress: {
      incomplete: 'rgba(84, 84, 88, 0.5)',
      partial: '#FF9F0A',
      complete: '#34C759',
      streak: '#F5C533',
    },
    separator: 'rgba(84, 84, 88, 0.65)',
  },

  spacing: {
    0: '0', 1: '4px', 2: '8px', 3: '12px', 4: '16px',
    5: '20px', 6: '24px', 7: '28px', 8: '32px', 10: '40px',
    12: '48px', 16: '64px', 20: '80px', 24: '96px',
  },

  typography: {
    fontFamily: {
      primary: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Inter', 'Helvetica Neue', sans-serif",
      arabic: "'Cairo', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "ui-monospace, 'SF Mono', Menlo, monospace",
    },
    fontSize: {
      xs: '12px', sm: '13px', base: '15px', lg: '17px',
      xl: '20px', '2xl': '22px', '3xl': '28px', '4xl': '34px', '5xl': '40px',
    },
    fontWeight: {
      normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800,
    },
    lineHeight: {
      tight: 1.2, normal: 1.4, relaxed: 1.6,
    },
  },

  borderRadius: {
    none: '0', sm: '8px', base: '10px', md: '12px', lg: '16px',
    xl: '20px', '2xl': '24px', '3xl': '32px', full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 4px rgba(0, 0, 0, 0.3)',
    base: '0 2px 12px rgba(0, 0, 0, 0.4)',
    md: '0 4px 20px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 30px rgba(0, 0, 0, 0.6)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.7)',
    glow: {
      gold: '0 0 24px rgba(245, 197, 51, 0.4)',
      success: '0 0 20px rgba(52, 199, 89, 0.4)',
      error: '0 0 20px rgba(255, 59, 48, 0.4)',
    },
  },

  zIndex: {
    base: 1, dropdown: 100, sticky: 200, fixed: 300,
    modalBackdrop: 400, modal: 500, popover: 600, tooltip: 700, tabBar: 900,
  },

  transitions: {
    fast: '150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    base: '250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slow: '400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  breakpoints: {
    xs: '320px', sm: '390px', md: '768px', lg: '1024px', xl: '1440px',
  },

  patterns: {
    button: {
      sm: { padding: '8px 16px', fontSize: '15px', borderRadius: '10px' },
      md: { padding: '13px 20px', fontSize: '17px', borderRadius: '14px' },
      lg: { padding: '16px 28px', fontSize: '17px', borderRadius: '16px' },
    },
    input: {
      height: '48px',
      padding: '12px 16px',
      fontSize: '17px',
      borderRadius: '12px',
    },
    card: {
      padding: '16px',
      borderRadius: '16px',
      background: '#2C2C2E',
    },
  },
};

export default theme;
