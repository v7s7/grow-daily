import {
  doc, getDoc, setDoc, writeBatch, collection, deleteField,
} from "firebase/firestore";

const BATCH_LIMIT = 400;

const POINTS_FIELDS = [
  "quranPoints", "gymPoints", "studyPoints", "waterPoints",
  "sleepPoints", "phonePoints", "showerPoints",
  "sabah_athkarPoints", "masaa_athkarPoints",
];
const DETAIL_FIELDS = [
  "quran", "gym", "study", "hydration",
  "sabah_athkar", "masaa_athkar",
];
const FLAT_MAPS_TO_DELETE = [
  "completedTasks", "taskRepeats", "dailyPointsEarned", "dailySubmissions",
  ...POINTS_FIELDS, ...DETAIL_FIELDS,
];

/**
 * One-time migration: moves all date-keyed flat maps from the root user doc
 * into individual `users/{uid}/daily/{YYYY-MM-DD}` sub-documents.
 *
 * Safe to re-run — sub-docs are written with { merge: true }.
 *
 * Usage (call once from a settings screen or developer console):
 *   import { migrateUserToSubcollections } from "../utils/migration";
 *   const result = await migrateUserToSubcollections(db, auth.currentUser.uid);
 *   console.log(`Migrated ${result.migrated} daily documents`);
 */
export async function migrateUserToSubcollections(db, userId) {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return { migrated: 0 };

  const data = snap.data();
  const completedByDate = data.completedTasks || {};
  const dateKeys = Object.keys(completedByDate);
  if (dateKeys.length === 0) return { migrated: 0 };

  let batch = writeBatch(db);
  let opCount = 0;
  let migrated = 0;

  for (const dateStr of dateKeys) {
    const dailyRef = doc(db, "users", userId, "daily", dateStr);
    const dailyDoc = {
      completedTasks: completedByDate[dateStr] || [],
    };

    for (const field of POINTS_FIELDS) {
      if (data[field]?.[dateStr] !== undefined) {
        dailyDoc[field] = data[field][dateStr];
      }
    }
    for (const field of DETAIL_FIELDS) {
      if (data[field]?.[dateStr] !== undefined) {
        dailyDoc[field] = data[field][dateStr];
      }
    }
    if (data.taskRepeats?.[dateStr]) {
      dailyDoc.taskRepeats = data.taskRepeats[dateStr];
    }
    if (data.dailyPointsEarned?.[dateStr] !== undefined) {
      dailyDoc.totalPoints = data.dailyPointsEarned[dateStr];
    }

    batch.set(dailyRef, dailyDoc, { merge: true });
    opCount++;
    migrated++;

    if (opCount >= BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    }
  }

  if (opCount > 0) await batch.commit();

  // Build cumulative total for root doc counter
  const totalTasksCompleted = Object.values(completedByDate)
    .reduce((sum, tasks) => sum + tasks.length, 0);

  // Remove flat maps from root doc and add cumulative counter
  const cleanup = {};
  for (const field of FLAT_MAPS_TO_DELETE) {
    if (field in data) cleanup[field] = deleteField();
  }
  await setDoc(userRef, { ...cleanup, totalTasksCompleted }, { merge: true });

  return { migrated };
}
