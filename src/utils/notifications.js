/**
 * Smart Notifications System
 * Handles browser notifications, streak reminders, and motivational alerts
 */
import { getLocalDateStr } from './dateUtils';

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options,
  };

  return new Notification(title, defaultOptions);
};

// Notification templates
export const notificationTemplates = {
  // Streak reminders
  streakRisk: (streakDays) => ({
    title: `🔥 ${streakDays}-Day Streak at Risk!`,
    body: `You haven't completed all your tasks today. Keep your momentum going!`,
    tag: 'streak-reminder',
  }),

  streakSafe: (streakDays) => ({
    title: `✅ Streak Protected!`,
    body: `Great job! Your ${streakDays}-day streak is safe for today.`,
    tag: 'streak-safe',
  }),

  // Task reminders
  incompleteTasks: (count) => ({
    title: `📋 ${count} Task${count > 1 ? 's' : ''} Remaining`,
    body: `You have ${count} task${count > 1 ? 's' : ''} left to complete today. Finish strong!`,
    tag: 'task-reminder',
  }),

  // Evening reminders
  eveningReminder: () => ({
    title: '🌙 Evening Check-in',
    body: "It's getting late! Make sure to complete your tasks before midnight.",
    tag: 'evening-reminder',
  }),

  // Achievements
  achievementUnlocked: (achievementTitle) => ({
    title: '🏆 Achievement Unlocked!',
    body: `Congratulations! You earned: ${achievementTitle}`,
    tag: 'achievement',
    requireInteraction: true,
  }),

  levelUp: (newLevel, rankTitle) => ({
    title: `⭐ Level Up!`,
    body: `You reached Level ${newLevel} - ${rankTitle}! Keep growing!`,
    tag: 'level-up',
    requireInteraction: true,
  }),

  // Milestones
  streakMilestone: (streakDays) => ({
    title: `🎉 ${streakDays}-Day Streak!`,
    body: `Incredible consistency! You've maintained a ${streakDays}-day streak.`,
    tag: 'milestone',
    requireInteraction: true,
  }),

  perfectWeek: () => ({
    title: '🌟 Perfect Week!',
    body: 'You completed all tasks for 7 days straight. Amazing work!',
    tag: 'milestone',
    requireInteraction: true,
  }),

  // Motivation
  morningMotivation: () => ({
    title: '☀️ Good Morning!',
    body: 'Ready to make today count? Start your day with GrowDaily.',
    tag: 'morning-motivation',
  }),

  comebackEncouragement: () => ({
    title: '💪 Welcome Back!',
    body: "Every day is a fresh start. Let's rebuild that streak!",
    tag: 'comeback',
  }),
};

// Schedule notifications
export const scheduleNotifications = (userData) => {
  const now = new Date();
  const currentHour = now.getHours();

  // Calculate time until evening reminder (8 PM)
  const eveningTime = new Date();
  eveningTime.setHours(20, 0, 0, 0);
  if (eveningTime <= now) {
    eveningTime.setDate(eveningTime.getDate() + 1);
  }
  const timeUntilEvening = eveningTime.getTime() - now.getTime();

  // Calculate time until midnight
  const midnight = new Date();
  midnight.setHours(23, 45, 0, 0);
  if (midnight <= now) {
    midnight.setDate(midnight.getDate() + 1);
  }
  const timeUntilMidnight = midnight.getTime() - now.getTime();

  // Store notification preferences
  const preferences = {
    morningReminder: localStorage.getItem('notif_morning') !== 'false',
    eveningReminder: localStorage.getItem('notif_evening') !== 'false',
    streakReminder: localStorage.getItem('notif_streak') !== 'false',
    achievements: localStorage.getItem('notif_achievements') !== 'false',
  };

  // Morning motivation (8 AM)
  if (preferences.morningReminder && currentHour < 8) {
    const morningTime = new Date();
    morningTime.setHours(8, 0, 0, 0);
    const timeUntilMorning = morningTime.getTime() - now.getTime();

    setTimeout(() => {
      const template = notificationTemplates.morningMotivation();
      sendNotification(template.title, template);
    }, timeUntilMorning);
  }

  // Evening reminder (8 PM) - only if tasks incomplete
  if (preferences.eveningReminder) {
    setTimeout(() => {
      const today = getLocalDateStr();
      const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '{}');
      const todayTasks = completedTasks[today] || [];
      const selectedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

      if (todayTasks.length < selectedTasks.length) {
        const template = notificationTemplates.eveningReminder();
        sendNotification(template.title, template);
      }
    }, timeUntilEvening);
  }

  // Streak risk reminder (11:45 PM) - only if tasks incomplete
  if (preferences.streakReminder) {
    setTimeout(() => {
      const today = getLocalDateStr();
      const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '{}');
      const todayTasks = completedTasks[today] || [];
      const selectedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const streak = parseInt(localStorage.getItem('streak') || '0');

      if (todayTasks.length < selectedTasks.length && streak > 0) {
        const template = notificationTemplates.streakRisk(streak);
        sendNotification(template.title, template);
      }
    }, timeUntilMidnight);
  }

  return preferences;
};

// Check and send achievement notifications
export const notifyAchievement = (achievement) => {
  const preferences = localStorage.getItem('notif_achievements') !== 'false';
  if (!preferences) return;

  const template = notificationTemplates.achievementUnlocked(achievement.title);
  sendNotification(template.title, {
    ...template,
    body: `${template.body}\n\n+${achievement.xpReward} XP`,
  });
};

// Notify level up
export const notifyLevelUp = (newLevel, rankTitle) => {
  const preferences = localStorage.getItem('notif_achievements') !== 'false';
  if (!preferences) return;

  const template = notificationTemplates.levelUp(newLevel, rankTitle);
  sendNotification(template.title, template);
};

// Notify streak milestone
export const notifyStreakMilestone = (streakDays) => {
  const preferences = localStorage.getItem('notif_streak') !== 'false';
  if (!preferences) return;

  const milestones = [7, 14, 30, 50, 100, 365];
  if (milestones.includes(streakDays)) {
    const template = notificationTemplates.streakMilestone(streakDays);
    sendNotification(template.title, template);
  }
};

// Notify perfect week
export const notifyPerfectWeek = () => {
  const preferences = localStorage.getItem('notif_achievements') !== 'false';
  if (!preferences) return;

  const template = notificationTemplates.perfectWeek();
  sendNotification(template.title, template);
};

export default {
  requestNotificationPermission,
  sendNotification,
  scheduleNotifications,
  notifyAchievement,
  notifyLevelUp,
  notifyStreakMilestone,
  notifyPerfectWeek,
};
