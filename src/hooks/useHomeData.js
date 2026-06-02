import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getLocalDateStr, getYesterdayStr, getNextMidnight } from "../utils/dateUtils";

const ACTIVE_QUOTES = [
  "Keep going — your future self will thank you!",
  "You're building something powerful. One day at a time.",
  "Consistency isn't flashy — it's legendary.",
  "Success is just small habits repeated daily.",
  "You're on a roll — don't slow down!",
];

const START_QUOTES = [
  "Every streak starts with Day 1. You got this.",
  "It's not about perfection — it's about progress.",
  "Start small. Stay consistent. Watch yourself grow.",
  "The journey begins today — show up for yourself.",
  "No pressure — just progress.",
];

export function useHomeData() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState(
    JSON.parse(localStorage.getItem("tasks") || '["quran","gym","study","water","sleep","phone","athkar","shower"]')
  );
  const [completedTasks, setCompletedTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(
    Number(localStorage.getItem("availablePoints") || 0)
  );
  const [dailyQuote, setDailyQuote] = useState("");

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate("/auth");
      }
      setCheckingAuth(false);
    });
    return () => unsub();
  }, [navigate]);

  // Fetch root doc + today's daily sub-doc
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const today = getLocalDateStr();
      const [rootSnap, dailySnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "users", user.uid, "daily", today)),
      ]);

      if (rootSnap.exists()) {
        const root = rootSnap.data();
        setStreak(root.streak || 0);
        setAvailablePoints(root.availablePoints || 0);
        localStorage.setItem("availablePoints", root.availablePoints || 0);
        localStorage.setItem("lastStreakDate", root.lastStreakDate || "");
        if (Array.isArray(root.plan)) {
          setSelectedTasks(root.plan);
          localStorage.setItem("tasks", JSON.stringify(root.plan));
        }
      }

      if (dailySnap.exists()) {
        const daily = dailySnap.data();
        const tasks = daily.completedTasks || [];
        setCompletedTasks(tasks);
        // Keep localStorage in sync for task pages that still read it
        const stored = JSON.parse(localStorage.getItem("completedTasks") || "{}");
        stored[getLocalDateStr()] = tasks;
        localStorage.setItem("completedTasks", JSON.stringify(stored));
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Derived progress values (stable, computed inline)
  const completedCount = selectedTasks.reduce((count, task) => {
    if (task === "athkar") {
      const sabah = completedTasks.includes("sabah_athkar");
      const masaa = completedTasks.includes("masaa_athkar");
      if (sabah && masaa) return count + 1;
      if (sabah || masaa) return count + 0.5;
      return count;
    }
    return completedTasks.includes(task) ? count + 1 : count;
  }, 0);
  const totalTasks = selectedTasks.length;

  // Midnight streak check
  useEffect(() => {
    if (!user) return;
    const runMidnightCheck = async () => {
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const yesterday = getYesterdayStr(now);
      const lastDate = localStorage.getItem("lastStreakDate");
      if (lastDate === todayStr) return;

      const allDone = totalTasks > 0 && completedCount >= totalTasks;
      const newStreak = allDone ? (lastDate === yesterday ? streak + 1 : 1) : 0;
      const bestStreak = Math.max(newStreak, streak);

      await setDoc(doc(db, "users", user.uid), {
        streak: newStreak,
        lastStreakDate: todayStr,
        bestStreak,
      }, { merge: true });

      setStreak(newStreak);
      localStorage.setItem("streak", newStreak);
      localStorage.setItem("lastStreakDate", todayStr);
    };

    const now = new Date();
    const timer = setTimeout(runMidnightCheck, getNextMidnight(now).getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, [user, completedCount, totalTasks, streak]);

  // Daily quote (one per day, changes when streak changes)
  useEffect(() => {
    const todayStr = getLocalDateStr();
    const lastQuoteDate = localStorage.getItem("lastQuoteDate");
    if (lastQuoteDate !== todayStr) {
      const pool = streak > 0 ? ACTIVE_QUOTES : START_QUOTES;
      const quote = pool[Math.floor(Math.random() * pool.length)];
      localStorage.setItem("dailyQuote", quote);
      localStorage.setItem("lastQuoteDate", todayStr);
      setDailyQuote(quote);
    } else {
      setDailyQuote(localStorage.getItem("dailyQuote") || "");
    }
  }, [streak]);

  return {
    user, checkingAuth, loading,
    selectedTasks, completedTasks,
    completedCount, totalTasks,
    streak, availablePoints, dailyQuote,
  };
}
