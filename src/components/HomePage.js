import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

export default function HomePage() {
  const navigate = useNavigate();

  // Get language and tasks from localStorage
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedTasks, setSelectedTasks] = useState(
    JSON.parse(localStorage.getItem("tasks") || '["quran","gym","study","water","sleep","phone","azkar", "shower"]') // Added 'shower' here
  );
  const today = new Date().toISOString().split("T")[0];
  const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
  const completedTasks = completed[today] || [];
  const taskPoints = {
    quran: 15,
    study: 15,
    gym: 15,
    water: 10,
    sleep: 10,
    phone: 10,
    azkar: 15,
    shower: 10,
  };
  
  const totalScore = completedTasks.reduce((sum, task) => {
    return sum + (taskPoints[task] || 0);
  }, 0);
  
  const userName = "Abdulaziz"; // You can replace with Firebase user displayName if needed

  const t = {
    en: {
      welcome: `Welcome, ${userName}`,
      progress: "Daily Progress",
      chooseLang: "Choose Language",
      tasks: {
        quran: "Quran",
        gym: "Gym",
        study: "Study",
        water: "Water",
        sleep: "Sleep",
        phone: "Phone Use",
        azkar: "Azkar",
        shower: "Shower" // Added 'shower' here for the English language
      },
    },
    ar: {
      welcome: `مرحبًا، ${userName}`,
      progress: "تقدمك اليومي",
      chooseLang: "اختر اللغة",
      tasks: {
        quran: "القرآن",
        gym: "النادي",
        study: "الدراسة",
        water: "الماء",
        sleep: "النوم",
        phone: "الهاتف",
        azkar: "الأذكار",
        shower: "الدش" // Added 'shower' here for Arabic language
      },
    },
  };

  const goToTask = (task) => {
    navigate(`/task/${task}`);
  };

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  return (
    <div style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      <h2>{t[language].welcome}</h2>
      <h3>{t[language].progress}: {totalScore}/100</h3>

      <div className="task-grid">
        {selectedTasks.map((task) => (
          <div
  key={task}
  className={`task-card ${completedTasks.includes(task) ? "completed" : ""}`}
  onClick={() => goToTask(task)}
>
            <img src={`/icons/${task}.png`} alt={task} />
            {t[language].tasks[task]}
          </div>
          
        ))}
      </div>

      <hr />

      <NavBar language={language} />
    </div>
  );
}
