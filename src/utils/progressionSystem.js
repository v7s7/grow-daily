import { doc, setDoc } from "firebase/firestore";

/**
 * GrowDaily Progression System
 * Levels, XP, Achievements, and Gamification
 */

// XP calculation based on user activity
export const calculateXP = (action, metadata = {}) => {
  const xpValues = {
    // Daily task completion
    task_complete: 50,
    task_perfect_rating: 25, // Bonus for 5-star rating

    // Streak bonuses
    streak_day: 10,
    streak_week: 100,
    streak_month: 500,
    streak_100: 2000,

    // Special achievements
    all_tasks_day: 200,
    early_completion: 50, // Completed before noon
    perfect_week: 1000,

    // Social/engagement
    plan_updated: 20,
    settings_personalized: 30,
  };

  const baseXP = xpValues[action] || 0;

  // Apply multipliers
  let xp = baseXP;

  if (metadata.rating === 5) {
    xp += xpValues.task_perfect_rating;
  }

  if (metadata.earlyCompletion) {
    xp += xpValues.early_completion;
  }

  return xp;
};

// Level calculation from total XP
export const calculateLevel = (totalXP) => {
  // Progressive XP requirements: Level 1 = 0, Level 2 = 100, Level 3 = 250, etc.
  // Formula: XP needed = 100 * level * (level - 1) / 2
  let level = 1;
  let xpForNextLevel = 100;
  let cumulativeXP = 0;

  while (cumulativeXP + xpForNextLevel <= totalXP) {
    cumulativeXP += xpForNextLevel;
    level++;
    xpForNextLevel = 100 * level;
  }

  return {
    level,
    currentXP: totalXP - cumulativeXP,
    xpForNextLevel,
    progress: ((totalXP - cumulativeXP) / xpForNextLevel) * 100,
  };
};

// Achievement definitions
export const achievements = [
  // Beginner achievements
  {
    id: 'first_task',
    title: 'First Steps',
    description: 'Complete your first daily task',
    icon: '🌱',
    xpReward: 100,
    category: 'beginner',
    condition: (stats) => stats.totalTasksCompleted >= 1,
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 500,
    category: 'streak',
    condition: (stats) => stats.bestStreak >= 7,
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '⭐',
    xpReward: 2000,
    category: 'streak',
    condition: (stats) => stats.bestStreak >= 30,
  },
  {
    id: 'century_streak',
    title: 'Century Champion',
    description: 'Achieve a 100-day streak',
    icon: '👑',
    xpReward: 10000,
    category: 'streak',
    condition: (stats) => stats.bestStreak >= 100,
  },

  // Task-specific achievements
  {
    id: 'quran_devotee',
    title: 'Quran Devotee',
    description: 'Complete Quran task 30 times',
    icon: '📖',
    xpReward: 1000,
    category: 'task',
    condition: (stats) => (stats.taskCounts?.quran || 0) >= 30,
  },
  {
    id: 'gym_beast',
    title: 'Gym Beast',
    description: 'Complete 50 gym sessions',
    icon: '💪',
    xpReward: 1000,
    category: 'task',
    condition: (stats) => (stats.taskCounts?.gym || 0) >= 50,
  },
  {
    id: 'study_scholar',
    title: 'Study Scholar',
    description: 'Complete 50 study sessions',
    icon: '📚',
    xpReward: 1000,
    category: 'task',
    condition: (stats) => (stats.taskCounts?.study || 0) >= 50,
  },

  // Perfection achievements
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'Complete all tasks in a single day',
    icon: '✨',
    xpReward: 300,
    category: 'perfection',
    condition: (stats) => stats.perfectDays >= 1,
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all tasks for 7 consecutive days',
    icon: '🏆',
    xpReward: 1500,
    category: 'perfection',
    condition: (stats) => stats.perfectWeeks >= 1,
  },
  {
    id: 'perfect_month',
    title: 'Perfect Month',
    description: 'Complete all tasks for 30 consecutive days',
    icon: '🎖️',
    xpReward: 5000,
    category: 'perfection',
    condition: (stats) => stats.perfectMonths >= 1,
  },

  // Point achievements
  {
    id: 'point_collector',
    title: 'Point Collector',
    description: 'Earn 1,000 total points',
    icon: '💰',
    xpReward: 500,
    category: 'points',
    condition: (stats) => stats.totalPoints >= 1000,
  },
  {
    id: 'point_master',
    title: 'Point Master',
    description: 'Earn 10,000 total points',
    icon: '💎',
    xpReward: 3000,
    category: 'points',
    condition: (stats) => stats.totalPoints >= 10000,
  },

  // Consistency achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete tasks before noon 10 times',
    icon: '🌅',
    xpReward: 500,
    category: 'consistency',
    condition: (stats) => stats.earlyCompletions >= 10,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete tasks after 9 PM 10 times',
    icon: '🦉',
    xpReward: 500,
    category: 'consistency',
    condition: (stats) => stats.lateCompletions >= 10,
  },

  // Special achievements
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Rebuild a streak after breaking it',
    icon: '🔄',
    xpReward: 200,
    category: 'special',
    condition: (stats) => stats.streakRebuilds >= 1,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Try all available tasks',
    icon: '🗺️',
    xpReward: 300,
    category: 'special',
    condition: (stats) => {
      const allTasks = ['quran', 'gym', 'study', 'water', 'sleep', 'phone', 'athkar', 'shower'];
      return allTasks.every(task => (stats.taskCounts?.[task] || 0) > 0);
    },
  },
];

// Check which achievements user has earned
export const checkAchievements = (stats, unlockedAchievements = []) => {
  const newlyUnlocked = [];

  achievements.forEach(achievement => {
    const alreadyUnlocked = unlockedAchievements.includes(achievement.id);
    const meetsCondition = achievement.condition(stats);

    if (!alreadyUnlocked && meetsCondition) {
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
};

// Check achievements and write newly unlocked ones to Firestore
export const checkAndPersistAchievements = async (db, userId, rootData) => {
  const stats = calculateUserStats(rootData);
  const alreadyUnlocked = rootData.unlockedAchievements || [];
  const newlyUnlocked = checkAchievements(stats, alreadyUnlocked);
  if (newlyUnlocked.length === 0) return [];
  const updatedList = [...alreadyUnlocked, ...newlyUnlocked.map((a) => a.id)];
  await setDoc(doc(db, "users", userId), { unlockedAchievements: updatedList }, { merge: true });
  return newlyUnlocked;
};

// Get achievement by ID
export const getAchievement = (id) => {
  return achievements.find(a => a.id === id);
};

// Get user rank title based on level
export const getRankTitle = (level) => {
  if (level >= 50) return { title: 'Legendary', icon: '👑', color: '#fbbf24' };
  if (level >= 40) return { title: 'Master', icon: '🏆', color: '#a78bfa' };
  if (level >= 30) return { title: 'Expert', icon: '⭐', color: '#60a5fa' };
  if (level >= 20) return { title: 'Advanced', icon: '🎖️', color: '#34d399' };
  if (level >= 10) return { title: 'Intermediate', icon: '🥉', color: '#fbbf24' };
  if (level >= 5) return { title: 'Apprentice', icon: '📈', color: '#94a3b8' };
  return { title: 'Beginner', icon: '🌱', color: '#cbd5e1' };
};

// Derives achievement-check stats from the root user document.
// Cumulative counters (totalTasksCompleted, bestStreak, etc.) live on the
// root doc; per-day task breakdowns live in the daily sub-collection and
// are NOT fetched here to keep this path cheap.
export const calculateUserStats = (rootData) => ({
  totalTasksCompleted: rootData.totalTasksCompleted || 0,
  taskCounts: {},
  perfectDays: 0,
  perfectWeeks: 0,
  perfectMonths: 0,
  bestStreak: rootData.bestStreak || rootData.streak || 0,
  currentStreak: rootData.streak || 0,
  totalPoints: rootData.availablePoints || 0,
  earlyCompletions: rootData.earlyCompletions || 0,
  lateCompletions: rootData.lateCompletions || 0,
  streakRebuilds: rootData.streakRebuilds || 0,
});

export default {
  calculateXP,
  calculateLevel,
  achievements,
  checkAchievements,
  getAchievement,
  getRankTitle,
  calculateUserStats,
};
