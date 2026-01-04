import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { theme } from '../theme';
import NavBar from './NavBar';
import ProgressionDisplay from './ProgressionDisplay';
import AchievementCard from './AchievementCard';
import { Card } from './ui';
import { calculateUserStats, checkAchievements, achievements } from '../utils/progressionSystem';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing[6]} ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[4]} ${theme.spacing[3]};
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatIcon = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  margin-bottom: ${theme.spacing[3]};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing[8]};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${theme.spacing[3]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const TaskBreakdown = styled.div`
  display: grid;
  gap: ${theme.spacing[3]};
`;

const TaskRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.base};
`;

const TaskName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: capitalize;
`;

const TaskCount = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.primary[500]};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.text.tertiary};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[4]};
  border-bottom: 2px solid ${theme.colors.background.elevated};
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-weight: ${props => props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  white-space: nowrap;
  margin-bottom: -2px;

  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const InsightsPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);

          const userStats = calculateUserStats(data);
          setStats(userStats);

          const unlocked = data.achievements || [];
          setUnlockedAchievements(unlocked);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <Container>
        <EmptyState>Loading your insights...</EmptyState>
        <NavBar />
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container>
        <EmptyState>No data available yet. Start completing tasks!</EmptyState>
        <NavBar />
      </Container>
    );
  }

  const totalXP = userData?.totalXP || 0;
  const sortedTaskCounts = Object.entries(stats.taskCounts || {}).sort((a, b) => b[1] - a[1]);

  // Filter achievements by category
  const filteredAchievements = activeTab === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeTab);

  return (
    <Container>
      <Header>
        <Title>📊 Your Insights</Title>
        <Subtitle>Track your progress and unlock achievements</Subtitle>
      </Header>

      {/* Progression Display */}
      <Section>
        <ProgressionDisplay totalXP={totalXP} />
      </Section>

      {/* Key Stats */}
      <Section>
        <SectionTitle>📈 Key Statistics</SectionTitle>
        <Grid>
          <StatCard>
            <StatIcon>🔥</StatIcon>
            <StatValue>{stats.currentStreak}</StatValue>
            <StatLabel>Current Streak</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>🏆</StatIcon>
            <StatValue>{stats.bestStreak}</StatValue>
            <StatLabel>Best Streak</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>✅</StatIcon>
            <StatValue>{stats.totalTasksCompleted}</StatValue>
            <StatLabel>Tasks Completed</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>✨</StatIcon>
            <StatValue>{stats.perfectDays}</StatValue>
            <StatLabel>Perfect Days</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>💰</StatIcon>
            <StatValue>{stats.totalPoints.toLocaleString()}</StatValue>
            <StatLabel>Total Points</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>🎖️</StatIcon>
            <StatValue>{unlockedAchievements.length}/{achievements.length}</StatValue>
            <StatLabel>Achievements</StatLabel>
          </StatCard>
        </Grid>
      </Section>

      {/* Task Breakdown */}
      <Section>
        <SectionTitle>📋 Task Breakdown</SectionTitle>
        <Card>
          <TaskBreakdown>
            {sortedTaskCounts.length > 0 ? (
              sortedTaskCounts.map(([task, count]) => (
                <TaskRow key={task}>
                  <TaskName>{task}</TaskName>
                  <TaskCount>{count}</TaskCount>
                </TaskRow>
              ))
            ) : (
              <EmptyState>No tasks completed yet</EmptyState>
            )}
          </TaskBreakdown>
        </Card>
      </Section>

      {/* Achievements */}
      <Section>
        <SectionTitle>🏆 Achievements</SectionTitle>

        <TabContainer>
          <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All
          </Tab>
          <Tab active={activeTab === 'beginner'} onClick={() => setActiveTab('beginner')}>
            Beginner
          </Tab>
          <Tab active={activeTab === 'streak'} onClick={() => setActiveTab('streak')}>
            Streaks
          </Tab>
          <Tab active={activeTab === 'task'} onClick={() => setActiveTab('task')}>
            Tasks
          </Tab>
          <Tab active={activeTab === 'perfection'} onClick={() => setActiveTab('perfection')}>
            Perfection
          </Tab>
          <Tab active={activeTab === 'points'} onClick={() => setActiveTab('points')}>
            Points
          </Tab>
        </TabContainer>

        <AchievementGrid>
          {filteredAchievements.map(achievement => {
            const unlocked = unlockedAchievements.find(u => u.id === achievement.id);
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
      </Section>

      <NavBar />
    </Container>
  );
};

export default InsightsPage;
