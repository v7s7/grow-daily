import React, { useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from './Button';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.colors.background.overlay};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modalBackdrop};
  padding: ${theme.spacing[4]};
  animation: fadeIn ${theme.transitions.base};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  max-width: ${props => {
    switch(props.size) {
      case 'sm': return '400px';
      case 'lg': return '800px';
      default: return '600px';
    }
  }};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: ${theme.zIndex.modal};
  animation: slideUp ${theme.transitions.base};

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary[500]};
    border-radius: ${theme.borderRadius.full};
  }
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: ${theme.spacing[2]};
  line-height: 1;
  transition: all ${theme.transitions.fast};
  border-radius: ${theme.borderRadius.base};

  &:hover {
    background: rgba(248, 204, 106, 0.1);
    color: ${theme.colors.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing[6]};
  color: ${theme.colors.text.secondary};
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.background.elevated};
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer size={size} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Close modal">
                ×
              </CloseButton>
            )}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Overlay>
  );
};

export default Modal;
