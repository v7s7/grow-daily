import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const InputWrapper = styled.div`
  width: 100%;
  margin-bottom: ${props => props.$noMargin ? '0' : theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
`;

const baseInputStyles = `
  width: 100%;
  height: ${theme.patterns.input.height};
  padding: ${theme.patterns.input.padding};
  font-size: ${theme.patterns.input.fontSize};
  font-family: ${theme.typography.fontFamily.primary};
  border-radius: ${theme.patterns.input.borderRadius};
  border: 1.5px solid rgba(84, 84, 88, 0.45);
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
  outline: none;

  &::placeholder {
    color: rgba(235, 235, 245, 0.28);
  }

  &:focus {
    border-color: ${theme.colors.primary[500]};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const StyledInput = styled.input`
  ${baseInputStyles}
  ${props => props.$error && `border-color: ${theme.colors.error.main};`}
  ${props => props.$error && `&:focus { border-color: ${theme.colors.error.main}; }`}
`;

const StyledTextarea = styled.textarea`
  ${baseInputStyles}
  height: auto;
  min-height: 100px;
  resize: vertical;
  ${props => props.$error && `border-color: ${theme.colors.error.main};`}
`;

const StyledSelect = styled.select`
  ${baseInputStyles}
  cursor: pointer;

  option {
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

const ErrorMessage = styled.span`
  display: block;
  font-size: 13px;
  color: ${theme.colors.error.main};
  margin-top: 6px;
`;

const Input = ({ label, error, type = 'text', multiline = false, rows = 4, noMargin = false, ...props }) => {
  const Component = multiline ? StyledTextarea : StyledInput;
  return (
    <InputWrapper $noMargin={noMargin}>
      {label && <Label>{label}</Label>}
      <Component type={type} $error={!!error} rows={multiline ? rows : undefined} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export const Select = ({ label, error, children, noMargin = false, ...props }) => (
  <InputWrapper $noMargin={noMargin}>
    {label && <Label>{label}</Label>}
    <StyledSelect $error={!!error} {...props}>{children}</StyledSelect>
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </InputWrapper>
);

export default Input;
