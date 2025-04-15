import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "../../styles/WaterPage.css";

export default function WaterPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";
  const today = new Date().toISOString().split("T")[0];
  const [waterIntake, setWaterIntake] = useState(0);

  const t = {
    en: {
      title: "Water Drinking Focus Mode",
      waterIntake: "Click the last cup you drank",
      rating: "You've had",
      submit: "Submit",
      back: "Back to Home",
    },
    ar: {
      title: "وضع التركيز - شرب الماء",
      waterIntake: "اختر آخر كوب شربته",
      rating: "لقد شربت",
      submit: "إرسال",
      back: "العودة للرئيسية",
    },
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("waterCups") || "{}");
    setWaterIntake(saved[today] || 0);
  }, []);

  const updateStorage = async (newAmount) => {
    setWaterIntake(newAmount);
    const local = JSON.parse(localStorage.getItem("waterCups") || "{}");
    local[today] = newAmount;
    localStorage.setItem("waterCups", JSON.stringify(local));
  };

  const handleCupSelect = async (index) => {
    const newAmount = index + 1;
    await updateStorage(newAmount);
  };

  const handleSubmit = async () => {
    const taskName = "water";

    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
      localStorage.setItem("completedTasks", JSON.stringify(completed));
    }

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};

      const prevAmount = firestoreData.hydration?.[today] || 0;
      const current = Math.min(prevAmount, 8);
      const next = Math.min(waterIntake, 8);
      let pointsToAdd = 0;

      if (next > current) {
        const rawPoints = (next - current) * 2;
        const prevTotal = current * 2;
        const newTotal = prevTotal + rawPoints;
        const cappedTotal = Math.min(15, newTotal);
        pointsToAdd = cappedTotal - prevTotal;
      }

      const updatedHydration = {
        ...(firestoreData.hydration || {}),
        [today]: waterIntake,
      };

      const updatedTasks = {
        ...(firestoreData.completedTasks || {}),
        [today]: [...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])],
      };

      await setDoc(userRef, {
        completedTasks: updatedTasks,
        hydration: updatedHydration,
        availablePoints: (firestoreData.availablePoints || 0) + pointsToAdd
      }, { merge: true });

      localStorage.setItem("availablePoints", (firestoreData.availablePoints || 0) + pointsToAdd);
    }

    navigate("/home");
  };

  return (
    <div className="task-page-container">
      <h2>{t[language].title}</h2>

      <p>{t[language].waterIntake}</p>

      <div className="cups-container">
        {[...Array(8)].map((_, i) => (
          <img
            key={i}
            src={i < waterIntake ? "/icons/cup-filled.png" : "/icons/cup-empty.png"}
            alt={`cup ${i + 1}`}
            className="cup-icon"
            onClick={() => handleCupSelect(i)}
          />
        ))}
      </div>

      <p className="liter-indicator">
        {language === "en"
          ? `${(waterIntake / 4).toFixed(1)} L (4 cups = 1 liter)`
          : `${(waterIntake / 4).toFixed(1)} لتر (كل ٤ أكواب = ١ لتر)`}
      </p>

      <p>{t[language].rating} {waterIntake} / 8 {language === "en" ? "cups" : "أكواب"} 💧</p>

      <p className="quran-verse">﴾ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴿</p>

      <div className="water-buttons">
        <button onClick={handleSubmit}>{t[language].submit}</button>
        <button onClick={() => navigate("/home")}>{t[language].back}</button>
      </div>

      <NavBar />
    </div>
  );
}
