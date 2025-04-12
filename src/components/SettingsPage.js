import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./SettingsPage.css";
import NavBar from "./NavBar";
export default function SettingsPage() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedTasks, setSelectedTasks] = useState(
    JSON.parse(localStorage.getItem("tasks") || '["quran", "gym", "study", "water", "sleep", "phone", "athkar", "shower"]')
  );

  const taskOptions = ["quran", "gym", "study", "water", "sleep", "phone", "athkar", "shower"];

  const t = {
    en: {
      title: "Settings",
      language: "Language",
      tasks: "Choose your tasks",
      save: "Save Settings",
      back: "Back to Home",
      logout: "Logout"
    },
    ar: {
      title: "الإعدادات",
      language: "اللغة",
      tasks: "اختر مهامك",
      save: "حفظ الإعدادات",
      back: "العودة",
      logout: "تسجيل خروج"
    },
  };

  const handleTaskToggle = (task) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleSave = async () => {
    localStorage.setItem("lang", language);
    localStorage.setItem("tasks", JSON.stringify(selectedTasks));

    const user = auth.currentUser;
    if (user) {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { plan: selectedTasks }, { merge: true });
    }

    navigate("/home");
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/auth");
  };

  return (
    <div className="settings-wrapper" style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      <h2>{t[language].title}</h2>

      <div className="section">
        <h4>{t[language].language}</h4>
        <div className="language-buttons">
          <button onClick={() => setLanguage("en")}>English</button>
          <button onClick={() => setLanguage("ar")}>العربية</button>
        </div>
      </div>

      <hr className="divider" />

      <div className="section">
        <h4>{t[language].tasks}</h4>
        <div className="task-grid">
          {taskOptions.map((task) => {
            const isSelected = selectedTasks.includes(task);
            const label =
              language === "en"
                ? task.charAt(0).toUpperCase() + task.slice(1)
                : task === "quran" ? "القرآن"
                : task === "gym" ? "النادي"
                : task === "study" ? "الدراسة"
                : task === "water" ? "الماء"
                : task === "sleep" ? "النوم"
                : task === "phone" ? "الهاتف"
                : task === "shower" ? "الدش"
                : "الأذكار";

            return (
              <div
                key={task}
                onClick={() => handleTaskToggle(task)}
                className={`task-option ${isSelected ? "selected" : "unselected"}`}
              >
                <img
                  src={`/icons/${task}.png`}
                  alt={task}
                  style={{ filter: isSelected ? "none" : "grayscale(100%)" }}
                />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="divider" />

      <div className="button-group">
        <button onClick={handleSave}>{t[language].save}</button>
        <button onClick={() => navigate("/home")}>{t[language].back}</button>
      </div>

      <button onClick={handleLogout} className="logout-button">
        {t[language].logout}
      </button>
            <NavBar />
      
    </div>
  );
}
