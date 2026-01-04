import React from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import { calculateLevel, getRankTitle } from '../utils/progressionSystem';

const ProgressionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background.elevated};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.base};
`;

const LevelBadge = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.color || theme.colors.primary[500]}, ${props => props.color || theme.colors.primary[700]});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.glow.gold};
  flex-shrink: 0;
`;

const LevelNumber = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  line-height: 1;
`;

const LevelLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: rgba(255, 255, 255, 0.8);
`;

const ProgressInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RankTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[1]};
`;

const RankIcon = styled.span`
  font-size: ${theme.typography.fontSize.lg};
`;

const RankText = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const XPText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary[600]}, ${theme.colors.primary[400]});
  border-radius: ${theme.borderRadius.full};
  transition: width ${theme.transitions.slow};
  width: ${props => props.progress}%;
  box-shadow: 0 0 8px ${theme.colors.primary[500]};
`;

const ProgressionDisplay = ({ totalXP = 0, compact = false }) => {
  const levelInfo = calculateLevel(totalXP);
  const rank = getRankTitle(levelInfo.level);

  if (compact) {
    return (
      <LevelBadge color={rank.color}>
        <LevelNumber>{levelInfo.level}</LevelNumber>
        <LevelLabel>LVL</LevelLabel>
      </LevelBadge>
    );
  }

  return (
    <ProgressionContainer>
      <LevelBadge color={rank.color}>
        <LevelNumber>{levelInfo.level}</LevelNumber>
        <LevelLabel>LVL</LevelLabel>
      </LevelBadge>

      <ProgressInfo>
        <RankTitle>
          <RankIcon>{rank.icon}</RankIcon>
          <RankText>{rank.title}</RankText>
        </RankTitle>

        <XPText>
          {levelInfo.currentXP.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()} XP
        </XPText>

        <ProgressBarContainer>
          <ProgressBarFill progress={levelInfo.progress} />
        </ProgressBarContainer>
      </ProgressInfo>
    </ProgressionContainer>
  );
};

export default ProgressionDisplay;
