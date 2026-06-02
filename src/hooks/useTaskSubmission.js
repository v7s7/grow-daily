import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePoints } from "../utils/updatePoints";
import { getLocalDateStr } from "../utils/dateUtils";

/**
 * Centralises every task submission:
 *   1. Auth guard (throws if no user)
 *   2. Parallel read of root + today's daily sub-doc
 *   3. Task-detail write (extra fields + repeat counter)
 *   4. Points calculation and write via updatePoints
 *   5. localStorage updated ONLY after all Firestore writes succeed
 *   6. isSubmitting lock prevents double-tap race conditions
 */
export function useTaskSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const navigate = useNavigate();

  const submit = useCallback(async ({
    taskName,
    maxPerTask,
    basePoints = 0,
    getRawPoints,    // ({ repeatCount, basePoints }) => number
    getExtraData,    // optional: (dailyData) => object — extra fields to merge into daily doc
    navigateTo = "/home",
    onSuccess,       // optional callback; if provided, overrides navigateTo
  }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const today = getLocalDateStr();
      const userRef = doc(db, "users", user.uid);
      const dailyRef = doc(db, "users", user.uid, "daily", today);

      // Read root doc and today's daily doc in parallel
      const [userSnap, dailySnap] = await Promise.all([
        getDoc(userRef),
        getDoc(dailyRef),
      ]);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const dailyData = dailySnap.exists() ? dailySnap.data() : {};

      const repeatKey = `${taskName}_repeat`;
      const repeatCount = dailyData.taskRepeats?.[repeatKey] || 0;
      const previousPoints = dailyData[`${taskName}Points`] || 0;

      // Write task-specific detail + bump repeat counter
      const extraFields = getExtraData ? getExtraData(dailyData) : {};
      await setDoc(dailyRef, {
        ...extraFields,
        taskRepeats: {
          ...(dailyData.taskRepeats || {}),
          [repeatKey]: repeatCount + 1,
        },
      }, { merge: true });

      const rawPoints = getRawPoints({ repeatCount, basePoints });

      await updatePoints({
        db,
        userId: user.uid,
        dailyData,
        userData,
        taskName,
        today,
        rawPoints,
        previousPoints,
        maxPerTask,
        repeatCount,
      });

      // localStorage updated only after every Firestore write succeeds
      const stored = JSON.parse(localStorage.getItem("completedTasks") || "{}");
      stored[today] = [...new Set([...(stored[today] || []), taskName])];
      localStorage.setItem("completedTasks", JSON.stringify(stored));

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(navigateTo);
      }
    } catch (err) {
      console.error("Task submission failed:", err);
      setSubmissionError(
        err.code === "unavailable"
          ? "No internet connection. Please try again."
          : "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, navigate]);

  return { submit, isSubmitting, submissionError };
}
