import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function HomePage() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedTasks, setSelectedTasks] = useState(
    JSON.parse(localStorage.getItem("tasks") || '["quran","gym","study","water","sleep","phone","athkar", "shower"]')
  );

  const today = new Date().toISOString().split("T")[0];
  const [completedTasks, setCompletedTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [dailyQuote, setDailyQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
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
      } else {
        return completedTasks.includes(task) ? count + 1 : count;
      }
    }, 0);
  };
  
  const completedCount = calculateCompletedCount();
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  const activeStreakQuotes = [
    "Keep going — your future self will thank you!",
    "You’re building something powerful. One day at a time.",
    "Consistency isn’t flashy — it’s legendary.",
    "Success is just small habits repeated daily.",
    "You’re on a roll — don’t slow down!"
  ];

  const startStreakQuotes = [
    "Every streak starts with Day 1. You got this.",
    "It’s not about perfection — it’s about progress.",
    "Start small. Stay consistent. Watch yourself grow.",
    "The journey begins today — show up for yourself.",
    "No pressure — just progress."
  ];

  const t = {
    en: {
      welcome: `Welcome`,
      progress: "Daily Progress",
      chooseLang: "Choose Language",
      tasks: {
        quran: "Quran",
        gym: "Gym",
        study: "Study",
        water: "Water",
        sleep: "Sleep",
        phone: "Phone Use",
        athkar: "Athkar",
        shower: "Shower"
      },
    },
    ar: {
      welcome: `مرحبًا`,
      progress: "تقدمك اليومي",
      chooseLang: "اختر اللغة",
      tasks: {
        quran: "القرآن",
        gym: "النادي",
        study: "الدراسة",
        water: "الماء",
        sleep: "النوم",
        phone: "الهاتف",
        athkar: "الأذكار",
        shower: "الدش"
      },
    },
  };

  const goToTask = (task) => {
    navigate(`/task/${task}`);
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
  // Load Firestore data on mount
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setStreak(data.streak || 0);
        setCompletedTasks(data.completedTasks?.[today] || []);
    
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

  // Handle streak logic
  useEffect(() => {
    if (!userId) return;

    const todayDate = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastStreakDate");

    const updateFirestore = async (updatedStreak, completed) => {
      const ref = doc(db, "users", userId);
      const stored = JSON.parse(localStorage.getItem("completedTasks") || "{}");
      stored[today] = completed;
      await setDoc(ref, {
        streak: updatedStreak,
        completedTasks: stored,
        lastStreakDate: todayDate
      }, { merge: true });

      localStorage.setItem("streak", updatedStreak);
      localStorage.setItem("lastStreakDate", todayDate);
      localStorage.setItem("completedTasks", JSON.stringify(stored));
    };

    if (progressPercent === 100) {
      if (lastDate !== todayDate) {
        const newStreak = (lastDate === yesterdayDate) ? streak + 1 : 1;
        setStreak(newStreak);
        updateFirestore(newStreak, completedTasks);
      }
    } else {
      if (lastDate && lastDate !== todayDate && lastDate !== yesterdayDate) {
        setStreak(0);
        updateFirestore(0, completedTasks);
      }
    }
  }, [progressPercent, userId]);

  // Handle daily quote
  useEffect(() => {
    const lastQuoteDate = localStorage.getItem("lastQuoteDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastQuoteDate !== today) {
      const quotes = streak > 0 ? activeStreakQuotes : startStreakQuotes;
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      localStorage.setItem("dailyQuote", randomQuote);
      localStorage.setItem("lastQuoteDate", today);
      setDailyQuote(randomQuote);
    } else {
      setDailyQuote(localStorage.getItem("dailyQuote") || "");
    }
  }, [streak]);

  // Prevent flicker before redirect
  if (checkingAuth || !user) return null;

  return (
    <div style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      <h2>{t[language].welcome}, {user?.displayName || "User"}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        <h3 style={{ margin: 0 }}>{t[language].progress}:</h3>
        <svg width="70" height="70">
          <circle cx="35" cy="35" r="30" stroke="#ccc" strokeWidth="6" fill="none" />
          <circle
            cx="35"
            cy="35"
            r="30"
            stroke="#f5c84c"
            strokeWidth="6"
            fill="none"
            strokeDasharray={188.4}
            strokeDashoffset={188.4 - (188.4 * progressPercent) / 100}
            transform="rotate(-90 35 35)"
          />
          <text x="35" y="40" textAnchor="middle" fontSize="12" fill="#f5c84c" fontWeight="bold">
            {progressPercent}%
          </text>
        </svg>
      </div>

      <p style={{ color: streak === 0 ? "#f5c84c" : "#4CAF50", fontSize: "14px", marginTop: "4px" }}>
        🔥 Streak: {streak} — “{dailyQuote}”
      </p>

      <div className="task-grid">
  {selectedTasks.map((task) => {
    let className = "task-card";

    if (task === "athkar") {
      const today = new Date().toISOString().split("T")[0];
      const sabahDone = completedTasks.includes("sabah_athkar");
      const masaaDone = completedTasks.includes("masaa_athkar");

      const sabahProgress = JSON.parse(localStorage.getItem("sabah_athkar_progress") || "{}");
      const masaaProgress = JSON.parse(localStorage.getItem("masaa_athkar_progress") || "{}");

      const sabahStarted = sabahProgress.current > 0 || sabahProgress.count > 0 || sabahDone;
      const masaaStarted = masaaProgress.current > 0 || masaaProgress.count > 0 || masaaDone;

      const fullCompleted = sabahDone && masaaDone;

      if (fullCompleted) {
        className += " completed";
      } else if (sabahStarted || masaaStarted) {
        className += " in-progress";
      }
    } else {
      if (completedTasks.includes(task)) {
        className += " completed";
      }
    }

    return (
      <div key={task} className={className} onClick={() => goToTask(task)}>
<img src={`/icons/${task}.png`} alt={task} className="task-icon" />
{t[language].tasks[task]}
      </div>
    );
  })}
</div>


      <hr />
      <NavBar language={language} />
    </div>
  );
}
