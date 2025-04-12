import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import "../../styles/AthkarPage.css";

export default function AthkarPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";

  const t = {
    en: {
      title: "Choose Athkar Type",
      sabah: "Morning",
      masaa: "Evening",
      home: "Back to Home"
    },
    ar: {
      title: "اختر نوع الذكر",
      sabah: "أذكار الصباح",
      masaa: "أذكار المساء",
      home: "العودة للرئيسية"
    },
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
      <div className="athkar-type-container">
        <h2 className="athkar-type-title">{t[language].title}</h2>
        <div className="athkar-buttons">
          {["sabah", "masaa"].map((type) => (
            <div
              key={type}
              className={`athkar-card ${getGlowClass(type)}`}
              onClick={() => navigate(`/task/athkar/${type}`)}
            >
              <img src={`/icons/${type}.png`} alt={type} />
              {t[language][type]}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={() => navigate("/home")}
            style={{
              backgroundColor: "#f8cc6a",
              color: "#021d34",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            {t[language].home}
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
