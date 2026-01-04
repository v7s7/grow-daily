import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const StyledCard = styled.div`
  background: ${props => props.transparent ? 'transparent' : theme.colors.background.tertiary};
  border-radius: ${props => {
    switch(props.rounded) {
      case 'sm': return theme.borderRadius.base;
      case 'lg': return theme.borderRadius.xl;
      default: return theme.borderRadius.lg;
    }
  }};
  padding: ${props => {
    switch(props.padding) {
      case 'sm': return theme.spacing[4];
      case 'lg': return theme.spacing[8];
      case 'none': return '0';
      default: return theme.spacing[6];
    }
  }};
  box-shadow: ${props => props.elevated ? theme.shadows.md : theme.shadows.base};
  transition: all ${theme.transitions.base};
  box-sizing: border-box;

  ${props => props.clickable && `
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
    &:active {
      transform: translateY(0);
    }
  `}

  ${props => props.bordered && `
    border: 2px solid ${theme.colors.background.elevated};
  `}

  ${props => props.glow && `
    box-shadow: ${theme.shadows.glow.gold};
    border: 2px solid ${theme.colors.primary[500]};
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
}) => {
  return (
    <StyledCard
      clickable={clickable}
      elevated={elevated}
      bordered={bordered}
      glow={glow}
      transparent={transparent}
      padding={padding}
      rounded={rounded}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
