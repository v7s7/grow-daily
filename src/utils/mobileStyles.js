/**
 * Mobile Optimizations for iPhone
 * iOS-specific styles and responsive helpers
 */

import { css } from 'styled-components';
import { theme } from '../theme';

// iPhone viewport sizes
export const iPhoneSizes = {
  iPhoneSE: '375px',      // iPhone SE, 6, 7, 8
  iPhone12: '390px',      // iPhone 12, 13 mini
  iPhone12Pro: '428px',   // iPhone 12/13/14 Pro Max
  iPhone14Pro: '393px',   // iPhone 14 Pro
};

// Safe area insets for iPhone notch
export const SafeAreaCSS = css`
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
`;

// Touch-friendly tap targets (minimum 44x44px for iOS)
export const TouchTargetCSS = css`
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

// Prevent iOS zoom on input focus
export const PreventZoomCSS = css`
  font-size: 16px; /* iOS won't zoom if >= 16px */

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: 16px !important;
  }
`;

// Smooth scrolling for iOS
export const SmoothScrollCSS = css`
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
`;

// iOS-specific button reset
export const iOSButtonReset = css`
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
`;

// Mobile-first grid
export const MobileGrid = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[3]};

  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// Mobile container with safe areas
export const MobileContainer = css`
  max-width: 100vw;
  padding: ${theme.spacing[4]};
  padding-top: calc(${theme.spacing[4]} + env(safe-area-inset-top));
  padding-bottom: calc(${theme.spacing[4]} + env(safe-area-inset-bottom));
  box-sizing: border-box;

  @media (min-width: ${theme.breakpoints.md}) {
    max-width: 1200px;
    margin: 0 auto;
    padding: ${theme.spacing[6]};
  }
`;

// Bottom navigation safe area
export const BottomNavSafeArea = css`
  padding-bottom: calc(${theme.spacing[4]} + env(safe-area-inset-bottom));
`;

// Sticky header with safe area
export const StickyHeaderSafeArea = css`
  position: sticky;
  top: 0;
  padding-top: env(safe-area-inset-top);
  background: ${theme.colors.background.primary};
  z-index: ${theme.zIndex.sticky};
`;

export default {
  SafeAreaCSS,
  TouchTargetCSS,
  PreventZoomCSS,
  SmoothScrollCSS,
  iOSButtonReset,
  MobileGrid,
  MobileContainer,
  BottomNavSafeArea,
  StickyHeaderSafeArea,
};
