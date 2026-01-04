import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { theme } from '../theme';
import NavBar from './NavBar';
import { Button, Input, Card } from './ui';
import ProgressionDisplay from './ProgressionDisplay';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendsProfiles,
} from '../utils/friendsSystem';
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
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[4]};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${props => props.active ? theme.colors.primary[500] : theme.colors.background.elevated};
  color: ${props => props.active ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: none;
  border-radius: ${theme.borderRadius.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  white-space: nowrap;
  min-width: 100px;

  &:active {
    transform: scale(0.95);
  }
`;

const SearchSection = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const SearchResults = styled.div`
  display: grid;
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[3]};
`;

const UserCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[700]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const UserStats = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;

    button {
      flex: 1;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.text.tertiary};
`;

const Badge = styled.span`
  display: inline-block;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.text.inverse};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-left: ${theme.spacing[2]};
`;

const FriendsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const user = auth.currentUser;

  // Subscribe to user data for real-time updates
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserData(data);

        // Load friend profiles
        if (data.friends && data.friends.length > 0) {
          const profiles = await getFriendsProfiles(data.friends);
          setFriends(profiles);
        } else {
          setFriends([]);
        }

        // Load friend requests
        if (data.friendRequests && data.friendRequests.length > 0) {
          const requests = await getFriendsProfiles(data.friendRequests);
          setFriendRequests(requests);
        } else {
          setFriendRequests([]);
        }

        // Load sent requests
        if (data.sentRequests && data.sentRequests.length > 0) {
          const sent = await getFriendsProfiles(data.sentRequests);
          setSentRequests(sent);
        } else {
          setSentRequests([]);
        }
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  // Search users
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const results = await searchUsers(searchTerm, user.uid);
    setSearchResults(results);
    setLoading(false);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSendRequest = async (toUserId) => {
    await sendFriendRequest(user.uid, toUserId);
    // Refresh search results
    handleSearch();
  };

  const handleAcceptRequest = async (friendId) => {
    await acceptFriendRequest(user.uid, friendId);
  };

  const handleRejectRequest = async (friendId) => {
    await rejectFriendRequest(user.uid, friendId);
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(user.uid, friendId);
    }
  };

  const handleViewProfile = (friendId) => {
    navigate(`/friend/${friendId}`);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const isAlreadyFriend = (userId) => {
    return userData?.friends?.includes(userId);
  };

  const hasPendingRequest = (userId) => {
    return userData?.sentRequests?.includes(userId);
  };

  return (
    <Container>
      <Header>
        <Title>👥 Friends</Title>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>
          Friends {friends.length > 0 && `(${friends.length})`}
        </Tab>
        <Tab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>
          Requests {friendRequests.length > 0 && <Badge>{friendRequests.length}</Badge>}
        </Tab>
        <Tab active={activeTab === 'search'} onClick={() => setActiveTab('search')}>
          Search
        </Tab>
      </TabContainer>

      {activeTab === 'search' && (
        <SearchSection>
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            noMargin
          />

          <SearchResults>
            {loading && <EmptyState>Searching...</EmptyState>}

            {!loading && searchTerm.length >= 3 && searchResults.length === 0 && (
              <EmptyState>No users found</EmptyState>
            )}

            {!loading && searchResults.map((result) => (
              <UserCard key={result.id}>
                <Avatar>{getInitial(result.name || result.email)}</Avatar>

                <UserInfo>
                  <UserName>{result.name || result.email?.split('@')[0]}</UserName>
                  <UserStats>
                    <Stat>⭐ Lvl {result.level || 1}</Stat>
                    <Stat>🔥 {result.streak || 0} streak</Stat>
                    <Stat>🏆 {result.achievements?.length || 0} achievements</Stat>
                  </UserStats>
                </UserInfo>

                <ActionButtons>
                  {isAlreadyFriend(result.id) ? (
                    <Button variant="ghost" disabled>Friends</Button>
                  ) : hasPendingRequest(result.id) ? (
                    <Button variant="ghost" disabled>Request Sent</Button>
                  ) : (
                    <Button onClick={() => handleSendRequest(result.id)}>
                      Add Friend
                    </Button>
                  )}
                </ActionButtons>
              </UserCard>
            ))}
          </SearchResults>
        </SearchSection>
      )}

      {activeTab === 'requests' && (
        <div>
          {friendRequests.length === 0 ? (
            <EmptyState>No pending friend requests</EmptyState>
          ) : (
            <SearchResults>
              {friendRequests.map((request) => (
                <UserCard key={request.id}>
                  <Avatar>{getInitial(request.displayName)}</Avatar>

                  <UserInfo>
                    <UserName>{request.displayName}</UserName>
                    <UserStats>
                      <Stat>⭐ Lvl {request.level}</Stat>
                      <Stat>🔥 {request.currentStreak} streak</Stat>
                    </UserStats>
                  </UserInfo>

                  <ActionButtons>
                    <Button onClick={() => handleAcceptRequest(request.id)}>
                      Accept
                    </Button>
                    <Button variant="danger" onClick={() => handleRejectRequest(request.id)}>
                      Reject
                    </Button>
                  </ActionButtons>
                </UserCard>
              ))}
            </SearchResults>
          )}
        </div>
      )}

      {activeTab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <EmptyState>
              No friends yet. Search for users and send friend requests!
            </EmptyState>
          ) : (
            <SearchResults>
              {friends.map((friend) => (
                <UserCard key={friend.id} clickable onClick={() => handleViewProfile(friend.id)}>
                  <Avatar>{getInitial(friend.displayName)}</Avatar>

                  <UserInfo>
                    <UserName>{friend.displayName}</UserName>
                    <UserStats>
                      <Stat>⭐ Lvl {friend.level}</Stat>
                      <Stat>🔥 {friend.currentStreak} streak</Stat>
                      <Stat>🏆 {friend.achievements?.length || 0} achievements</Stat>
                      <Stat>💰 {friend.totalPoints?.toLocaleString() || 0} pts</Stat>
                    </UserStats>
                  </UserInfo>

                  <ActionButtons>
                    <Button variant="ghost" onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(friend.id);
                    }}>
                      View
                    </Button>
                    <Button variant="danger" onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFriend(friend.id);
                    }}>
                      Remove
                    </Button>
                  </ActionButtons>
                </UserCard>
              ))}
            </SearchResults>
          )}
        </div>
      )}

      <NavBar />
    </Container>
  );
};

export default FriendsPage;
