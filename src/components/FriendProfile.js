import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../theme';
import NavBar from './NavBar';
import { Card, Button } from './ui';
import ProgressionDisplay from './ProgressionDisplay';
import AchievementCard from './AchievementCard';
import { getFriendProfile } from '../utils/friendsSystem';
import { achievements } from '../utils/progressionSystem';
import { MobileContainer } from '../utils/mobileStyles';

const Container = styled.div`
  ${MobileContainer}
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[6]};
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[700]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  margin: 0 auto ${theme.spacing[4]};
  box-shadow: ${theme.shadows.glow.gold};
`;

const Name = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const JoinedDate = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${theme.spacing[3]};
  margin: ${theme.spacing[6]} 0;

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing[4]};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatIcon = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  margin-bottom: ${theme.spacing[2]};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing[8]};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
`;

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing[3]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const BackButton = styled(Button)`
  margin-bottom: ${theme.spacing[4]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.text.tertiary};
`;

const CompareButton = styled(Button)`
  width: 100%;
  margin-top: ${theme.spacing[4]};
`;

const FriendProfile = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await getFriendProfile(friendId);
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [friendId]);

  if (loading) {
    return (
      <Container>
        <EmptyState>Loading profile...</EmptyState>
        <NavBar />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <EmptyState>Profile not found</EmptyState>
        <BackButton onClick={() => navigate('/friends')}>
          ← Back to Friends
        </BackButton>
        <NavBar />
      </Container>
    );
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Container>
      <BackButton variant="ghost" onClick={() => navigate('/friends')}>
        ← Back
      </BackButton>

      <Header>
        <Avatar>{getInitial(profile.displayName)}</Avatar>
        <Name>{profile.displayName}</Name>
        <JoinedDate>Joined {formatDate(profile.joinedDate)}</JoinedDate>
      </Header>

      <Section>
        <ProgressionDisplay totalXP={profile.totalXP || 0} />
      </Section>

      <Section>
        <SectionTitle>📊 Statistics</SectionTitle>
        <Grid>
          <StatCard>
            <StatIcon>🔥</StatIcon>
            <StatValue>{profile.currentStreak}</StatValue>
            <StatLabel>Current Streak</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>🏆</StatIcon>
            <StatValue>{profile.bestStreak}</StatValue>
            <StatLabel>Best Streak</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>💰</StatIcon>
            <StatValue>{profile.totalPoints?.toLocaleString() || 0}</StatValue>
            <StatLabel>Total Points</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>🎖️</StatIcon>
            <StatValue>{profile.achievements?.length || 0}</StatValue>
            <StatLabel>Achievements</StatLabel>
          </StatCard>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>🏆 Achievements ({profile.achievements?.length || 0})</SectionTitle>
        {!profile.achievements || profile.achievements.length === 0 ? (
          <EmptyState>No achievements unlocked yet</EmptyState>
        ) : (
          <AchievementGrid>
            {achievements.map((achievement) => {
              const unlocked = profile.achievements?.find(a => a.id === achievement.id);
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={!!unlocked}
                  unlockedAt={unlocked?.unlockedAt}
                />
              );
            })}
          </AchievementGrid>
        )}
      </Section>

      <CompareButton onClick={() => navigate(`/compare/${friendId}`)}>
        ⚔️ Compare Stats
      </CompareButton>

      <NavBar />
    </Container>
  );
};

export default FriendProfile;
