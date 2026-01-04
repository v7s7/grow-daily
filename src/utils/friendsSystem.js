/**
 * Friend System Utilities
 * Search, add, manage friends and view their progress
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Search for users by email or username
 */
export const searchUsers = async (searchTerm, currentUserId) => {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

  try {
    const usersRef = collection(db, 'users');

    // Search by email (exact match or starts with)
    const emailQuery = query(
      usersRef,
      where('email', '>=', searchTerm.toLowerCase()),
      where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      limit(10)
    );

    const emailSnapshot = await getDocs(emailQuery);
    const results = [];

    emailSnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

/**
 * Send friend request
 */
export const sendFriendRequest = async (fromUserId, toUserId) => {
  try {
    const toUserRef = doc(db, 'users', toUserId);
    const fromUserRef = doc(db, 'users', fromUserId);

    // Add to recipient's friend requests
    await updateDoc(toUserRef, {
      friendRequests: arrayUnion(fromUserId),
    });

    // Add to sender's sent requests
    await updateDoc(fromUserRef, {
      sentRequests: arrayUnion(toUserId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (userId, friendId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);

    // Add each other to friends list
    await updateDoc(userRef, {
      friends: arrayUnion(friendId),
      friendRequests: arrayRemove(friendId),
    });

    await updateDoc(friendRef, {
      friends: arrayUnion(userId),
      sentRequests: arrayRemove(userId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reject friend request
 */
export const rejectFriendRequest = async (userId, friendId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);

    await updateDoc(userRef, {
      friendRequests: arrayRemove(friendId),
    });

    await updateDoc(friendRef, {
      sentRequests: arrayRemove(userId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove friend
 */
export const removeFriend = async (userId, friendId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);

    await updateDoc(userRef, {
      friends: arrayRemove(friendId),
    });

    await updateDoc(friendRef, {
      friends: arrayRemove(userId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing friend:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get friend's profile data
 */
export const getFriendProfile = async (friendId) => {
  try {
    const friendRef = doc(db, 'users', friendId);
    const friendSnap = await getDoc(friendRef);

    if (!friendSnap.exists()) {
      return null;
    }

    const data = friendSnap.data();

    // Return public profile data only
    return {
      id: friendId,
      displayName: data.name || data.email?.split('@')[0] || 'User',
      email: data.email,
      level: data.level || 1,
      totalXP: data.totalXP || 0,
      currentStreak: data.streak || 0,
      bestStreak: data.bestStreak || 0,
      totalPoints: data.totalPoints || 0,
      achievements: data.achievements || [],
      plan: data.plan || [],
      joinedDate: data.createdAt || null,
    };
  } catch (error) {
    console.error('Error getting friend profile:', error);
    return null;
  }
};

/**
 * Get all friends' profiles
 */
export const getFriendsProfiles = async (friendIds) => {
  if (!friendIds || friendIds.length === 0) return [];

  try {
    const profiles = await Promise.all(
      friendIds.map(id => getFriendProfile(id))
    );

    return profiles.filter(p => p !== null);
  } catch (error) {
    console.error('Error getting friends profiles:', error);
    return [];
  }
};

/**
 * Get leaderboard (top users by XP or streak)
 */
export const getLeaderboard = async (type = 'xp', limitCount = 50) => {
  try {
    const usersRef = collection(db, 'users');
    const field = type === 'xp' ? 'totalXP' : 'streak';

    const leaderboardQuery = query(
      usersRef,
      orderBy(field, 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(leaderboardQuery);
    const leaderboard = [];

    snapshot.forEach((doc, index) => {
      const data = doc.data();
      leaderboard.push({
        rank: index + 1,
        id: doc.id,
        displayName: data.name || data.email?.split('@')[0] || 'User',
        value: data[field] || 0,
        level: data.level || 1,
        achievements: data.achievements?.length || 0,
      });
    });

    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

/**
 * Challenge a friend (create competitive challenge)
 */
export const createChallenge = async (fromUserId, toUserId, challengeType, duration = 7) => {
  try {
    const challengeRef = doc(collection(db, 'challenges'));
    const challenge = {
      id: challengeRef.id,
      fromUserId,
      toUserId,
      type: challengeType, // 'streak', 'tasks', 'points'
      status: 'pending', // 'pending', 'active', 'completed', 'declined'
      duration, // days
      createdAt: new Date().toISOString(),
      startDate: null,
      endDate: null,
      winner: null,
      scores: {
        [fromUserId]: 0,
        [toUserId]: 0,
      },
    };

    await setDoc(challengeRef, challenge);

    // Notify the challenged user
    const toUserRef = doc(db, 'users', toUserId);
    await updateDoc(toUserRef, {
      pendingChallenges: arrayUnion(challengeRef.id),
    });

    return { success: true, challengeId: challengeRef.id };
  } catch (error) {
    console.error('Error creating challenge:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's rank in global leaderboard
 */
export const getUserRank = async (userId, type = 'xp') => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const userData = userSnap.data();
    const field = type === 'xp' ? 'totalXP' : 'streak';
    const userValue = userData[field] || 0;

    // Count users with higher value
    const usersRef = collection(db, 'users');
    const higherQuery = query(
      usersRef,
      where(field, '>', userValue)
    );

    const higherSnapshot = await getDocs(higherQuery);
    const rank = higherSnapshot.size + 1;

    return {
      rank,
      value: userValue,
      total: higherSnapshot.size + 1,
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

export default {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendProfile,
  getFriendsProfiles,
  getLeaderboard,
  createChallenge,
  getUserRank,
};
