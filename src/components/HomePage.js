import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getLocalDateStr, getYesterdayStr, getNextMidnight } from "../utils/dateUtils";

const RING_R = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function formatDate(language) {
  const now = new Date();
  if (language === "ar") {
    return now.toLocaleDateString("ar-SA", { weekday: "long", month: "long", day: "numeric" });
  }
  return now.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
}

export default function HomePage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedTasks, setSelectedTasks] = useState(
    JSON.parse(localStorage.getItem("tasks") || '["quran","gym","study","water","sleep","phone","athkar","shower"]')
  );

  const today = getLocalDateStr();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [dailyQuote, setDailyQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [availablePoints, setAvailablePoints] = useState(Number(localStorage.getItem("availablePoints") || 0));

  const userId = user?.uid;
  const totalTasks = selectedTasks.length;

  const calculateCompletedCount = () => {
    return selectedTasks.reduce((count, task) => {
      if (task === "athkar") {
        const sabahDone = completedTasks.includes("sabah_athkar");
        const masaaDone = completedTasks.includes("masaa_athkar");
        if (sabahDone && masaaDone) return count + 1;
        if (sabahDone || masaaDone) return count + 0.5;
        return count;
      }
      return completedTasks.includes(task) ? count + 1 : count;
    }, 0);
  };

  const completedCount = calculateCompletedCount();
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  const activeStreakQuotes = [
    "Keep going — your future self will thank you!",
    "You're building something powerful. One day at a time.",
    "Consistency isn't flashy — it's legendary.",
    "Success is just small habits repeated daily.",
    "You're on a roll — don't slow down!",
  ];

  const startStreakQuotes = [
    "Every streak starts with Day 1. You got this.",
    "It's not about perfection — it's about progress.",
    "Start small. Stay consistent. Watch yourself grow.",
    "The journey begins today — show up for yourself.",
    "No pressure — just progress.",
  ];

  const t = {
    en: {
      welcome: "Welcome back",
      progress: "Daily Progress",
      streakLabel: (n) => n === 1 ? "1-day streak" : `${n}-day streak`,
      noStreak: "Start your streak today",
      todayTasks: "Today's Tasks",
      pts: (n) => `${n} pts`,
      done: "done",
    },
    ar: {
      welcome: "أهلاً بعودتك",
      progress: "تقدم اليوم",
      streakLabel: (n) => `${n} أيام متتالية`,
      noStreak: "ابدأ سلسلتك اليوم",
      todayTasks: "مهام اليوم",
      pts: (n) => `${n} نقطة`,
      done: "تم",
    },
    tasks: {
      en: { quran: "Quran", gym: "Gym", study: "Study", water: "Water", sleep: "Sleep", phone: "Phone", athkar: "Athkar", shower: "Shower" },
      ar: { quran: "القرآن", gym: "النادي", study: "الدراسة", water: "الماء", sleep: "النوم", phone: "الهاتف", athkar: "الأذكار", shower: "الدش" },
    },
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate("/auth");
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setStreak(data.streak || 0);
        setCompletedTasks(data.completedTasks?.[today] || []);
        setAvailablePoints(data.availablePoints || 0);
        localStorage.setItem("availablePoints", data.availablePoints || 0);
        if (data.plan && Array.isArray(data.plan)) {
          setSelectedTasks(data.plan);
          localStorage.setItem("tasks", JSON.stringify(data.plan));
        }
        localStorage.setItem("completedTasks", JSON.stringify(data.completedTasks || {}));
        localStorage.setItem("lastStreakDate", data.lastStreakDate || "");
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const runMidnightCheck = async () => {
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const yesterday = getYesterdayStr(now);
      const lastDate = localStorage.getItem("lastStreakDate");
      const allTasksCompleted = completedCount === totalTasks;
      const updateFirestore = async (updatedStreak) => {
        const ref = doc(db, "users", userId);
        const stored = JSON.parse(localStorage.getItem("completedTasks") || "{}");
        stored[todayStr] = completedTasks;
        await setDoc(ref, { streak: updatedStreak, completedTasks: stored, lastStreakDate: todayStr }, { merge: true });
        localStorage.setItem("streak", updatedStreak);
        localStorage.setItem("lastStreakDate", todayStr);
        localStorage.setItem("completedTasks", JSON.stringify(stored));
      };
      if (lastDate === todayStr) return;
      if (allTasksCompleted) {
        const newStreak = (lastDate === yesterday) ? streak + 1 : 1;
        setStreak(newStreak);
        await updateFirestore(newStreak);
      } else {
        setStreak(0);
        await updateFirestore(0);
      }
    };
    const now = new Date();
    const nextMidnight = getNextMidnight(now);
    const timer = setTimeout(runMidnightCheck, nextMidnight.getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, [completedCount, totalTasks, userId]);

  useEffect(() => {
    const lastQuoteDate = localStorage.getItem("lastQuoteDate");
    const todayStr = getLocalDateStr();
    if (lastQuoteDate !== todayStr) {
      const quotes = streak > 0 ? activeStreakQuotes : startStreakQuotes;
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      localStorage.setItem("dailyQuote", randomQuote);
      localStorage.setItem("lastQuoteDate", todayStr);
      setDailyQuote(randomQuote);
    } else {
      setDailyQuote(localStorage.getItem("dailyQuote") || "");
    }
  }, [streak]);

  if (checkingAuth || !user) return null;

  const isRTL = language === "ar";
  const strokeOffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * progressPercent) / 100;

  const getTaskCardClass = (task) => {
    if (task === "athkar") {
      const sabahDone = completedTasks.includes("sabah_athkar");
      const masaaDone = completedTasks.includes("masaa_athkar");
      const sabahProgress = JSON.parse(localStorage.getItem("sabah_athkar_progress") || "{}");
      const masaaProgress = JSON.parse(localStorage.getItem("masaa_athkar_progress") || "{}");
      const started = sabahProgress.current > 0 || masaaProgress.current > 0 || sabahDone || masaaDone;
      if (sabahDone && masaaDone) return "task-card completed";
      if (started) return "task-card in-progress";
      return "task-card";
    }
    if (completedTasks.includes(task)) return "task-card completed";
    return "task-card";
  };

  const ringColor = progressPercent === 100 ? "#34C759" : "#F5C533";

  return (
    <div className="home-screen" style={{ direction: isRTL ? "rtl" : "ltr" }}>

      {/* Header */}
      <div className="home-header">
        <div className="home-date">{formatDate(language)}</div>
        <h1 className="home-app-title">
          Grow<span>Daily</span>
        </h1>
        <p className="home-greeting">
          {t[language].welcome}, {user?.displayName || "User"} 👋
        </p>
      </div>

      {/* Progress & Streak Card */}
      <div className="home-progress-section">
        <div className="progress-ring-wrap">
          <svg width="110" height="110" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={RING_R}
              stroke="rgba(84,84,88,0.35)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60" cy="60" r={RING_R}
              stroke={ringColor}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.25,0.46,0.45,0.94), stroke 0.4s ease" }}
            />
            <text x="60" y="56" textAnchor="middle" fontSize="20" fill="#FFFFFF" fontWeight="700" fontFamily="system-ui">
              {progressPercent}%
            </text>
            <text x="60" y="74" textAnchor="middle" fontSize="10" fill="rgba(235,235,245,0.45)" fontFamily="system-ui">
              {t[language].done}
            </text>
          </svg>
          <span className="progress-ring-label">{t[language].progress}</span>
        </div>

        <div className="home-right-info">
          <div className={streak === 0 ? "streak-zero" : ""}>
            <div className="streak-badge">
              <span>🔥</span>
              <span>{streak > 0 ? t[language].streakLabel(streak) : t[language].noStreak}</span>
            </div>
          </div>

          {dailyQuote ? (
            <p className="home-quote">"{dailyQuote}"</p>
          ) : null}

          <div className="home-points-pill">
            <span>⭐</span>
            <span>{t[language].pts(availablePoints)}</span>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="home-tasks-section">
        <div className="section-header">
          <h2 className="section-title">{t[language].todayTasks}</h2>
          <span className="section-count">{completedCount}/{totalTasks}</span>
        </div>

        <div className="task-grid">
          {selectedTasks.map((task) => (
            <div
              key={task}
              className={getTaskCardClass(task)}
              onClick={() => navigate(`/task/${task}`)}
            >
              <img
                src={`/icons/${task}.png`}
                alt={task}
                className="task-icon"
              />
              <span className="task-label">
                {t.tasks[language][task] || task}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
