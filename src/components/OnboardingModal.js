import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import { Modal, Button } from './ui';

const OnboardingContent = styled.div`
  text-align: center;
`;

const Icon = styled.div`
  font-size: 80px;
  margin-bottom: ${theme.spacing[4]};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[3]} 0;
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-bottom: ${theme.spacing[6]};
`;

const FeatureList = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
  margin: ${theme.spacing[6]} 0;
  text-align: left;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.base};
`;

const FeatureIcon = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  flex-shrink: 0;
`;

const FeatureContent = styled.div``;

const FeatureTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const FeatureText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: center;
  margin-top: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const Progress = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[6]};
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: ${theme.borderRadius.full};
  background: ${props => props.active ? theme.colors.primary[500] : theme.colors.background.elevated};
  transition: all ${theme.transitions.base};
`;

const onboardingSteps = [
  {
    icon: '🌟',
    title: 'Welcome to GrowDaily!',
    description: 'Your personal habit tracker designed to help you build consistency and reach your goals every single day.',
    showFeatures: true,
    features: [
      {
        icon: '🎯',
        title: 'Track Daily Tasks',
        text: 'Complete tasks like Quran, Gym, Study, and more. Build habits that last.',
      },
      {
        icon: '🔥',
        title: 'Build Streaks',
        text: 'Maintain your momentum. Every day counts toward your success.',
      },
      {
        icon: '🏆',
        title: 'Earn Achievements',
        text: 'Unlock badges, level up, and track your progress over time.',
      },
    ],
  },
  {
    icon: '📊',
    title: 'Track Your Progress',
    description: 'Monitor your growth with detailed insights, statistics, and visual progress indicators.',
    showFeatures: true,
    features: [
      {
        icon: '📈',
        title: 'Daily Dashboard',
        text: 'See your progress at a glance with an intuitive homepage.',
      },
      {
        icon: '📅',
        title: 'Calendar View',
        text: 'Visualize your consistency with color-coded completion history.',
      },
      {
        icon: '💎',
        title: 'Insights Page',
        text: 'Deep dive into your stats, achievements, and personal records.',
      },
    ],
  },
  {
    icon: '🎮',
    title: 'Level Up Your Life',
    description: 'GrowDaily gamifies your daily habits to keep you motivated and engaged.',
    showFeatures: true,
    features: [
      {
        icon: '⭐',
        title: 'XP & Levels',
        text: 'Earn experience points and level up as you complete tasks.',
      },
      {
        icon: '🎖️',
        title: 'Achievements',
        text: 'Unlock special badges for milestones and consistent performance.',
      },
      {
        icon: '👑',
        title: 'Ranks & Titles',
        text: 'Progress from Beginner to Legendary as you grow.',
      },
    ],
  },
  {
    icon: '🚀',
    title: 'Ready to Start?',
    description: 'Begin your journey toward better habits. Every great achievement starts with a single step.',
    showFeatures: false,
  },
];

const OnboardingModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const step = onboardingSteps[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <OnboardingContent>
        <Icon>{step.icon}</Icon>
        <Title>{step.title}</Title>
        <Description>{step.description}</Description>

        {step.showFeatures && (
          <FeatureList>
            {step.features.map((feature, index) => (
              <FeatureItem key={index}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureContent>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureText>{feature.text}</FeatureText>
                </FeatureContent>
              </FeatureItem>
            ))}
          </FeatureList>
        )}

        <ButtonGroup>
          {currentStep > 0 && (
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button onClick={handleNext}>
            {currentStep === onboardingSteps.length - 1 ? "Let's Go!" : 'Next'}
          </Button>
          {currentStep < onboardingSteps.length - 1 && (
            <Button variant="ghost" onClick={handleFinish}>
              Skip
            </Button>
          )}
        </ButtonGroup>

        <Progress>
          {onboardingSteps.map((_, index) => (
            <Dot key={index} active={index === currentStep} />
          ))}
        </Progress>
      </OnboardingContent>
    </Modal>
  );
};

export default OnboardingModal;
