import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import "../../styles/AthkarPage.css";

export default function AthkarPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";

  const t = {
    en: { title: "Choose Athkar Type", sabah: "Morning", masaa: "Evening" },
    ar: { title: "اختر نوع الذكر", sabah: "أذكار الصباح", masaa: "أذكار المساء" },
  };

  const today = new Date().toISOString().split("T")[0];
  const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
  const getGlowClass = (type) => {
    const progress = JSON.parse(localStorage.getItem(`${type}_athkar_progress`) || "{}");
    const isCompleted = completed[today]?.includes(`${type}_athkar`);
    const isStarted = progress.current > 0 || progress.count > 0;
  
    if (isCompleted) return "completed";
    if (isStarted) return "in-progress";
    return "";
  };
  

  return (
    <div className="task-page-container" style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      <h2>{t[language].title}</h2>

      <div className="task-grid">
        {["sabah", "masaa"].map((type) => (
          <div
            key={type}
            className={`task-card ${getGlowClass(type)}`}
            onClick={() => navigate(`/task/athkar/${type}`)}
          >
            <img src={`/icons/${type}.png`} alt={type} className="task-icon" />
            {t[language][type]}
          </div>
        ))}
      </div>

      <NavBar />
    </div>
  );
}
