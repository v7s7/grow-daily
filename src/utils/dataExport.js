/**
 * Data Export/Import Utilities
 * Allows users to backup and restore their progress
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { getLocalDateStr } from './dateUtils';

// Export user data as JSON
export const exportUserData = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('No user data found');
    }

    const userData = userSnap.data();

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      data: {
        ...userData,
        // Remove sensitive data
        email: undefined,
      },
    };

    return exportData;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Download data as JSON file
export const downloadDataAsJSON = async () => {
  try {
    const data = await exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = getLocalDateStr();
    link.href = url;
    link.download = `growdaily-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

// Export data as CSV (for spreadsheet analysis)
export const downloadDataAsCSV = async () => {
  try {
    const data = await exportUserData();
    const completedTasks = data.data.completedTasks || {};

    // Create CSV header
    const headers = ['Date', 'Tasks Completed', 'Task Names'];
    const rows = [headers];

    // Convert tasks data to CSV rows
    Object.entries(completedTasks)
      .sort()
      .forEach(([date, tasks]) => {
        rows.push([
          date,
          tasks.length,
          tasks.join(', '),
        ]);
      });

    const csv = rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = getLocalDateStr();
    link.href = url;
    link.download = `growdaily-tasks-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('CSV export error:', error);
    throw error;
  }
};

// Import user data from JSON file
export const importUserData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const importData = JSON.parse(event.target.result);

        // Validate import data
        if (!importData.version || !importData.data) {
          throw new Error('Invalid backup file format');
        }

        const user = auth.currentUser;
        if (!user) {
          throw new Error('No authenticated user');
        }

        // Merge imported data with existing data
        const userRef = doc(db, 'users', user.uid);
        const currentSnap = await getDoc(userRef);
        const currentData = currentSnap.exists() ? currentSnap.data() : {};

        const mergedData = {
          ...currentData,
          ...importData.data,
          // Preserve current plan and email
          plan: currentData.plan || importData.data.plan,
          email: user.email,
        };

        // Save merged data to Firestore
        await setDoc(userRef, mergedData, { merge: true });

        // Update localStorage
        if (importData.data.completedTasks) {
          localStorage.setItem('completedTasks', JSON.stringify(importData.data.completedTasks));
        }
        if (importData.data.streak) {
          localStorage.setItem('streak', importData.data.streak);
        }
        if (importData.data.plan) {
          localStorage.setItem('tasks', JSON.stringify(importData.data.plan));
        }

        resolve({
          success: true,
          message: 'Data imported successfully',
          tasksImported: Object.keys(importData.data.completedTasks || {}).length,
        });
      } catch (error) {
        console.error('Import error:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

// Generate summary statistics for export
export const generateExportSummary = (userData) => {
  const completedTasks = userData.completedTasks || {};
  const totalDays = Object.keys(completedTasks).length;
  const totalTasks = Object.values(completedTasks).reduce(
    (sum, tasks) => sum + tasks.length,
    0
  );

  const taskCounts = {};
  Object.values(completedTasks).forEach(tasks => {
    tasks.forEach(task => {
      taskCounts[task] = (taskCounts[task] || 0) + 1;
    });
  });

  return {
    totalDays,
    totalTasks,
    currentStreak: userData.streak || 0,
    bestStreak: userData.bestStreak || userData.streak || 0,
    totalPoints: userData.totalPoints || 0,
    level: userData.level || 1,
    totalXP: userData.totalXP || 0,
    achievements: userData.achievements?.length || 0,
    taskBreakdown: taskCounts,
  };
};

export default {
  exportUserData,
  downloadDataAsJSON,
  downloadDataAsCSV,
  importUserData,
  generateExportSummary,
};
