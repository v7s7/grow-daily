import { doc, setDoc, getDoc } from "firebase/firestore";
import { checkAndPersistAchievements } from "./progressionSystem";

/**
 * Writes task-completion points to:
 *   - users/{uid}/daily/{today}  — task points + completedTasks array
 *   - users/{uid}                — availablePoints + totalTasksCompleted counter
 *
 * Enforces:
 *   - 75-point daily cap across all tasks
 *   - Per-task maxPerTask cap
 *   - Zero points for 3rd+ same-day submissions
 */
export const updatePoints = async ({
  db,
  userId,
  dailyData,       // today's daily sub-doc snapshot data (pre-write)
  userData,        // root user doc snapshot data (pre-write)
  taskName,
  today,
  rawPoints,
  previousPoints,
  maxPerTask = Infinity,
  repeatCount = 0,
}) => {
  const dailyRef = doc(db, "users", userId, "daily", today);
  const userRef = doc(db, "users", userId);

  const currentDailyPoints = dailyData.totalPoints || 0;
  const availablePoints = userData.availablePoints || 0;

  if (repeatCount > 1) rawPoints = 0;

  const cappedRaw = Math.min(rawPoints, maxPerTask - previousPoints);
  let pointsToAdd = Math.min(75 - currentDailyPoints, cappedRaw);
  pointsToAdd = Math.max(0, pointsToAdd);

  const newAvailable = availablePoints + pointsToAdd;
  const isFirstCompletion = !(dailyData.completedTasks || []).includes(taskName);

  await setDoc(dailyRef, {
    completedTasks: [...new Set([...(dailyData.completedTasks || []), taskName])],
    [`${taskName}Points`]: previousPoints + pointsToAdd,
    totalPoints: currentDailyPoints + pointsToAdd,
    submissions: (dailyData.submissions || 0) + 1,
  }, { merge: true });

  const rootUpdate = { availablePoints: newAvailable };
  if (isFirstCompletion) {
    rootUpdate.totalTasksCompleted = (userData.totalTasksCompleted || 0) + 1;
  }
  await setDoc(userRef, rootUpdate, { merge: true });

  localStorage.setItem("availablePoints", newAvailable);

  const freshRoot = await getDoc(userRef);
  if (freshRoot.exists()) {
    await checkAndPersistAchievements(db, userId, freshRoot.data());
  }
};
