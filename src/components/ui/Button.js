import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme';

const variants = {
  primary: css`
    background: ${theme.colors.primary[500]};
    color: #000000;
    &:hover:not(:disabled) { background: ${theme.colors.primary[400]}; }
  `,
  secondary: css`
    background: ${theme.colors.background.elevated};
    color: ${theme.colors.text.primary};
    border: 1.5px solid rgba(84, 84, 88, 0.5);
    &:hover:not(:disabled) {
      background: ${theme.colors.background.tertiary};
      border-color: ${theme.colors.primary[500]};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${theme.colors.primary[500]};
    &:hover:not(:disabled) { background: rgba(245, 197, 51, 0.1); }
  `,
  danger: css`
    background: ${theme.colors.error.main};
    color: #ffffff;
    &:hover:not(:disabled) { background: ${theme.colors.error.dark}; }
  `,
  success: css`
    background: ${theme.colors.success.main};
    color: #ffffff;
    &:hover:not(:disabled) { background: ${theme.colors.success.dark}; }
  `,
};

const sizes = {
  sm: css`
    padding: 8px 16px;
    font-size: 15px;
    border-radius: 10px;
  `,
  md: css`
    padding: 13px 20px;
    font-size: 17px;
    border-radius: 14px;
  `,
  lg: css`
    padding: 16px 28px;
    font-size: 17px;
    border-radius: 16px;
  `,
};

const StyledButton = styled.button`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s ease, opacity 0.12s ease, background 0.15s ease;

  ${props => sizes[props.$size || 'md']}
  ${props => variants[props.$variant || 'primary']}
  ${props => props.$fullWidth && 'width: 100%;'}

  &:active:not(:disabled) {
    transform: scale(0.94);
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => (
  <StyledButton
    $variant={variant}
    $size={size}
    $fullWidth={fullWidth}
    disabled={disabled}
    onClick={onClick}
    type={type}
    {...props}
  >
    {children}
  </StyledButton>
);

export default Button;
