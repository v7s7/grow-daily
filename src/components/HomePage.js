import React, { useState } from "react";
import { useHomeData } from "../hooks/useHomeData";
import ProgressRing from "./ProgressRing";
import TaskGrid from "./TaskGrid";

function formatDate(language) {
  return new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    weekday: "short", month: "long", day: "numeric",
  });
}

const STRINGS = {
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
};

export default function HomePage() {
  const [language] = useState(localStorage.getItem("lang") || "en");
  const {
    user, checkingAuth,
    selectedTasks, completedTasks,
    completedCount, totalTasks,
    streak, availablePoints, dailyQuote,
  } = useHomeData();

  if (checkingAuth || !user) return null;

  const t = STRINGS[language] || STRINGS.en;
  const isRTL = language === "ar";
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="home-screen" style={{ direction: isRTL ? "rtl" : "ltr" }}>

      <div className="home-header">
        <div className="home-date">{formatDate(language)}</div>
        <h1 className="home-app-title">Grow<span>Daily</span></h1>
        <p className="home-greeting">{t.welcome}, {user.displayName || "User"} 👋</p>
      </div>

      <div className="home-progress-section">
        <ProgressRing percent={progressPercent} label={t.done} />

        <div className="home-right-info">
          <div className={streak === 0 ? "streak-zero" : ""}>
            <div className="streak-badge">
              <span>🔥</span>
              <span>{streak > 0 ? t.streakLabel(streak) : t.noStreak}</span>
            </div>
          </div>
          {dailyQuote && <p className="home-quote">"{dailyQuote}"</p>}
          <div className="home-points-pill">
            <span>⭐</span>
            <span>{t.pts(availablePoints)}</span>
          </div>
        </div>
      </div>

      <div className="home-tasks-section">
        <div className="section-header">
          <h2 className="section-title">{t.todayTasks}</h2>
          <span className="section-count">{completedCount}/{totalTasks}</span>
        </div>
        <TaskGrid
          tasks={selectedTasks}
          completedTasks={completedTasks}
          language={language}
        />
      </div>
    </div>
  );
}
