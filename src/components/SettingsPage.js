import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedTasks, setSelectedTasks] = useState(
    JSON.parse(localStorage.getItem("tasks") || '["quran", "gym", "study", "water", "sleep", "phone", "azkar", "shower"]')
  );

  const taskOptions = ["quran", "gym", "study", "water", "sleep", "phone", "azkar", "shower"]; // Added 'shower' here

  const t = {
    en: {
      title: "Settings",
      language: "Language",
      tasks: "Select Tasks",
      save: "Save Settings",
      back: "Back to Home",
    },
    ar: {
      title: "الإعدادات",
      language: "اللغة",
      tasks: "اختر المهام",
      save: "حفظ الإعدادات",
      back: "العودة",
    },
  };

  const handleTaskToggle = (task) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleSave = () => {
    localStorage.setItem("lang", language);
    localStorage.setItem("tasks", JSON.stringify(selectedTasks));
    navigate("/home");
  };

  return (
    <div style={{ padding: 20, direction: language === "ar" ? "rtl" : "ltr" }}>
      <h2>{t[language].title}</h2>

      <h4>{t[language].language}</h4>
      <button onClick={() => setLanguage("en")}>English</button>
      <button onClick={() => setLanguage("ar")}>العربية</button>

      <h4>{t[language].tasks}</h4>
      {taskOptions.map((task) => (
        <div key={task}>
          <label>
            <input
              type="checkbox"
              checked={selectedTasks.includes(task)}
              onChange={() => handleTaskToggle(task)}
            />
            {language === "en" ? task.charAt(0).toUpperCase() + task.slice(1) : 
              task === "quran" ? "القرآن" :
              task === "gym" ? "النادي" :
              task === "study" ? "الدراسة" :
              task === "water" ? "الماء" :
              task === "sleep" ? "النوم" :
              task === "phone" ? "الهاتف" :
              task === "shower" ? "الدش" :
              "الأذكار"}
          </label>
        </div>
      ))}

      <br />
      <button onClick={handleSave}>{t[language].save}</button>
      <button onClick={() => navigate("/home")}>{t[language].back}</button>
    </div>
  );
}
