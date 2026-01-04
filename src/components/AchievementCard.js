import React from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const CardContainer = styled.div`
  background: ${props => props.unlocked ? theme.colors.background.tertiary : theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  display: flex;
  gap: ${theme.spacing[3]};
  opacity: ${props => props.unlocked ? 1 : 0.5};
  border: 2px solid ${props => props.unlocked ? theme.colors.primary[500] : theme.colors.background.elevated};
  transition: all ${theme.transitions.base};
  box-shadow: ${props => props.unlocked ? theme.shadows.glow.gold : theme.shadows.base};

  ${props => props.unlocked && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `}

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]};
  }
`;

const IconContainer = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  flex-shrink: 0;
  filter: ${props => props.unlocked ? 'none' : 'grayscale(100%)'};
`;

const ContentContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => props.unlocked ? theme.colors.text.primary : theme.colors.text.disabled};
  margin-bottom: ${theme.spacing[1]};
`;

const Description = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => props.unlocked ? theme.colors.text.secondary : theme.colors.text.disabled};
  margin-bottom: ${theme.spacing[2]};
`;

const RewardBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  background: ${props => props.unlocked ? theme.colors.primary[500] : theme.colors.background.elevated};
  color: ${props => props.unlocked ? theme.colors.text.inverse : theme.colors.text.disabled};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const UnlockDate = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  margin-top: ${theme.spacing[2]};
`;

const AchievementCard = ({ achievement, unlocked = false, unlockedAt = null }) => {
  return (
    <CardContainer unlocked={unlocked}>
      <IconContainer unlocked={unlocked}>
        {achievement.icon}
      </IconContainer>

      <ContentContainer>
        <Title unlocked={unlocked}>{achievement.title}</Title>
        <Description unlocked={unlocked}>{achievement.description}</Description>
        <RewardBadge unlocked={unlocked}>
          ⭐ {achievement.xpReward} XP
        </RewardBadge>
        {unlocked && unlockedAt && (
          <UnlockDate>
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </UnlockDate>
        )}
      </ContentContainer>
    </CardContainer>
  );
};

export default AchievementCard;
