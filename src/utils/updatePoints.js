import { doc, setDoc } from "firebase/firestore";

export const updatePoints = async ({
  db,
  userId,
  firestoreData,
  taskName,
  today,
  rawPoints,
  previousPoints = 0,
  maxPerTask = Infinity,
  repeatCount = 0
}) => {
  const availablePoints = firestoreData.availablePoints || 0;

  // ✅ Recalculate total points earned today from all `*Points` fields
  const totalEarned = Object.entries(firestoreData)
    .filter(([key]) => key.endsWith("Points"))
    .map(([_, val]) => val?.[today] || 0)
    .reduce((sum, v) => sum + v, 0);

  const currentDailyPoints = Math.max(
    totalEarned,
    firestoreData.dailyPointsEarned?.[today] || 0
  );

  // ✅ Block 3rd+ submissions
  if (repeatCount > 1) rawPoints = 0;

  // ✅ Cap per task and per day
  const cappedRaw = Math.min(rawPoints, maxPerTask - previousPoints);
  let pointsToAdd = Math.min(75 - currentDailyPoints, cappedRaw);
  pointsToAdd = Math.max(0, pointsToAdd);

  const newTotal = availablePoints + pointsToAdd;

  await setDoc(
    doc(db, "users", userId),
    {
      completedTasks: {
        ...(firestoreData.completedTasks || {}),
        [today]: [
          ...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])
        ]
      },
      [`${taskName}Points`]: {
        ...(firestoreData[`${taskName}Points`] || {}),
        [today]: previousPoints + pointsToAdd
      },
      availablePoints: newTotal,
      dailyPointsEarned: {
        ...(firestoreData.dailyPointsEarned || {}),
        [today]: currentDailyPoints + pointsToAdd
      },
      dailySubmissions: {
        ...(firestoreData.dailySubmissions || {}),
        [today]: (firestoreData.dailySubmissions?.[today] || 0) + 1
      }
    },
    { merge: true }
  );

  localStorage.setItem("availablePoints", newTotal);
};
