import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const StyledButton = styled.button`
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  border: none;
  transition: all ${theme.transitions.base};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  text-decoration: none;
  user-select: none;

  /* Size variants */
  ${props => {
    const size = props.size || 'md';
    const sizeStyles = theme.patterns.button[size];
    return `
      padding: ${sizeStyles.padding};
      font-size: ${sizeStyles.fontSize};
      border-radius: ${sizeStyles.borderRadius};
    `;
  }}

  /* Variant styles */
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${theme.colors.background.elevated};
          color: ${theme.colors.text.primary};
          border: 2px solid ${theme.colors.primary[500]};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary[500]};
            color: ${theme.colors.text.inverse};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.glow.gold};
          }
        `;

      case 'ghost':
        return `
          background: transparent;
          color: ${theme.colors.text.primary};

          &:hover:not(:disabled) {
            background: rgba(248, 204, 106, 0.1);
          }
        `;

      case 'danger':
        return `
          background: ${theme.colors.error.main};
          color: white;

          &:hover:not(:disabled) {
            background: ${theme.colors.error.dark};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.glow.error};
          }
        `;

      case 'success':
        return `
          background: ${theme.colors.success.main};
          color: white;

          &:hover:not(:disabled) {
            background: ${theme.colors.success.dark};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.glow.success};
          }
        `;

      default: // 'primary'
        return `
          background: ${theme.colors.primary[500]};
          color: ${theme.colors.text.inverse};
          box-shadow: ${theme.shadows.base};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary[400]};
            transform: translateY(-1px) scale(1.02);
            box-shadow: ${theme.shadows.glow.gold};
          }
        `;
    }
  }}

  /* Full width */
  ${props => props.fullWidth && `
    width: 100%;
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Active state */
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  /* Focus visible */
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
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
