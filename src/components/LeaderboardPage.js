import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebaseConfig';
import { theme } from '../theme';
import NavBar from './NavBar';
import { Card } from './ui';
import { getLeaderboard, getUserRank } from '../utils/friendsSystem';
import { MobileContainer } from '../utils/mobileStyles';

const Container = styled.div`
  ${MobileContainer}
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[4]};
  justify-content: center;
`;

const Tab = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[5]};
  background: ${props => props.active ? theme.colors.primary[500] : theme.colors.background.elevated};
  color: ${props => props.active ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: none;
  border-radius: ${theme.borderRadius.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  flex: 1;
  max-width: 180px;

  &:active {
    transform: scale(0.95);
  }
`;

const MyRankCard = styled(Card)`
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
  margin-bottom: ${theme.spacing[4]};
  padding: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const RankNumber = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.full};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[700]};
  flex-shrink: 0;
`;

const RankInfo = styled.div`
  flex: 1;
  color: white;
`;

const RankLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  opacity: 0.9;
  margin-bottom: ${theme.spacing[1]};
`;

const RankValue = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const LeaderboardList = styled.div`
  display: grid;
  gap: ${theme.spacing[2]};
`;

const LeaderboardItem = styled(Card)`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  ${props => props.rank === 1 && `
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: ${theme.shadows.glow.gold};
  `}

  ${props => props.rank === 2 && `
    background: linear-gradient(135deg, #d1d5db, #9ca3af);
  `}

  ${props => props.rank === 3 && `
    background: linear-gradient(135deg, #fb923c, #ea580c);
  `}

  &:hover {
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }
`;

const Position = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background: ${props => {
    if (props.rank === 1) return 'rgba(255, 255, 255, 0.3)';
    if (props.rank === 2) return 'rgba(255, 255, 255, 0.3)';
    if (props.rank === 3) return 'rgba(255, 255, 255, 0.3)';
    return theme.colors.background.elevated;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.rank <= 3 ? 'white' : theme.colors.text.primary};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => props.isTop3 ? 'white' : theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserLevel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => props.isTop3 ? 'rgba(255, 255, 255, 0.8)' : theme.colors.text.secondary};
  margin-top: ${theme.spacing[1]};
`;

const Score = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.isTop3 ? 'white' : theme.colors.primary[500]};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.text.tertiary};
`;

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('xp');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      const data = await getLeaderboard(activeTab, 50);
      setLeaderboard(data);

      if (user) {
        const rank = await getUserRank(user.uid, activeTab);
        setMyRank(rank);
      }

      setLoading(false);
    };

    loadLeaderboard();
  }, [activeTab, user]);

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreLabel = () => {
    return activeTab === 'xp' ? 'XP' : 'Streak';
  };

  return (
    <Container>
      <Header>
        <Title>🏆 Leaderboard</Title>
        <Subtitle>Compete with users worldwide</Subtitle>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'xp'} onClick={() => setActiveTab('xp')}>
          ⭐ By XP
        </Tab>
        <Tab active={activeTab === 'streak'} onClick={() => setActiveTab('streak')}>
          🔥 By Streak
        </Tab>
      </TabContainer>

      {myRank && (
        <MyRankCard>
          <RankNumber>#{myRank.rank}</RankNumber>
          <RankInfo>
            <RankLabel>Your Rank</RankLabel>
            <RankValue>
              {myRank.value.toLocaleString()} {getScoreLabel()}
            </RankValue>
          </RankInfo>
        </MyRankCard>
      )}

      {loading ? (
        <EmptyState>Loading leaderboard...</EmptyState>
      ) : leaderboard.length === 0 ? (
        <EmptyState>No data available</EmptyState>
      ) : (
        <LeaderboardList>
          {leaderboard.map((entry) => (
            <LeaderboardItem
              key={entry.id}
              rank={entry.rank}
              onClick={() => navigate(`/friend/${entry.id}`)}
            >
              <Position rank={entry.rank}>
                {getRankMedal(entry.rank)}
              </Position>

              <UserInfo>
                <UserName isTop3={entry.rank <= 3}>
                  {entry.displayName}
                </UserName>
                <UserLevel isTop3={entry.rank <= 3}>
                  Level {entry.level} • {entry.achievements} achievements
                </UserLevel>
              </UserInfo>

              <Score isTop3={entry.rank <= 3}>
                {entry.value.toLocaleString()}
              </Score>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
      )}

      <NavBar />
    </Container>
  );
};

export default LeaderboardPage;
