import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme';

const StyledCard = styled.div`
  background: ${props => props.$transparent ? 'transparent' : theme.colors.background.secondary};
  border-radius: ${props => {
    switch (props.$rounded) {
      case 'sm': return theme.borderRadius.md;
      case 'lg': return theme.borderRadius['2xl'];
      default:   return theme.borderRadius.xl;
    }
  }};
  padding: ${props => {
    switch (props.$padding) {
      case 'sm':   return theme.spacing[4];
      case 'lg':   return theme.spacing[8];
      case 'none': return '0';
      default:     return theme.spacing[5];
    }
  }};
  border: 1.5px solid rgba(84, 84, 88, 0.3);
  transition: transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast};
  box-sizing: border-box;

  ${props => props.$elevated && css`
    background: ${theme.colors.background.tertiary};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  `}

  ${props => props.$clickable && css`
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    &:active {
      transform: scale(0.97);
      opacity: 0.9;
    }
  `}

  ${props => props.$glow && css`
    border-color: rgba(245, 197, 51, 0.45);
    box-shadow: 0 0 24px rgba(245, 197, 51, 0.2);
  `}
`;

const Card = ({
  children,
  clickable = false,
  elevated = false,
  bordered = false,
  glow = false,
  transparent = false,
  padding = 'md',
  rounded = 'md',
  onClick,
  ...props
}) => (
  <StyledCard
    $clickable={clickable}
    $elevated={elevated}
    $bordered={bordered}
    $glow={glow}
    $transparent={transparent}
    $padding={padding}
    $rounded={rounded}
    onClick={onClick}
    {...props}
  >
    {children}
  </StyledCard>
);

export default Card;
