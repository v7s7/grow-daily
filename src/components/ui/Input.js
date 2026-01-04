import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const InputWrapper = styled.div`
  width: 100%;
  margin-bottom: ${props => props.noMargin ? '0' : theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
`;

const StyledInput = styled.input`
  width: 100%;
  height: ${theme.patterns.input.height};
  padding: ${theme.patterns.input.padding};
  font-size: ${theme.patterns.input.fontSize};
  font-family: ${theme.typography.fontFamily.primary};
  border-radius: ${theme.patterns.input.borderRadius};
  border: 2px solid ${props => props.error ? theme.colors.error.main : theme.colors.background.elevated};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.base};
  box-sizing: border-box;

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.error ? theme.colors.error.main : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.error ? theme.colors.error.bg : 'rgba(248, 204, 106, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${theme.patterns.input.padding};
  font-size: ${theme.patterns.input.fontSize};
  font-family: ${theme.typography.fontFamily.primary};
  border-radius: ${theme.patterns.input.borderRadius};
  border: 2px solid ${props => props.error ? theme.colors.error.main : theme.colors.background.elevated};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.base};
  box-sizing: border-box;
  resize: vertical;

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.error ? theme.colors.error.main : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.error ? theme.colors.error.bg : 'rgba(248, 204, 106, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  height: ${theme.patterns.input.height};
  padding: ${theme.patterns.input.padding};
  font-size: ${theme.patterns.input.fontSize};
  font-family: ${theme.typography.fontFamily.primary};
  border-radius: ${theme.patterns.input.borderRadius};
  border: 2px solid ${theme.colors.background.elevated};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.base};
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px rgba(248, 204, 106, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

const ErrorMessage = styled.span`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error.main};
  margin-top: ${theme.spacing[1]};
`;

const Input = ({
  label,
  error,
  type = 'text',
  multiline = false,
  rows = 4,
  noMargin = false,
  ...props
}) => {
  const InputComponent = multiline ? StyledTextarea : StyledInput;

  return (
    <InputWrapper noMargin={noMargin}>
      {label && <Label>{label}</Label>}
      <InputComponent
        type={type}
        error={error}
        rows={multiline ? rows : undefined}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export const Select = ({ label, error, children, noMargin = false, ...props }) => {
  return (
    <InputWrapper noMargin={noMargin}>
      {label && <Label>{label}</Label>}
      <StyledSelect error={error} {...props}>
        {children}
      </StyledSelect>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export default Input;
