import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating"; 
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function WaterPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en"; // Fetch language from localStorage

  const [waterIntake, setWaterIntake] = useState(0); // Water intake in cups

  const t = {
    en: {
      title: "Water Drinking Focus Mode",
      waterIntake: "Amount of Water Drunk (Cups)",
      rating: "How would you rate your hydration? (Out of 8 cups)",
      submit: "Submit",
      back: "Back to Home",
    },
    ar: {
      title: "وضع التركيز - شرب الماء",
      waterIntake: "كمية الماء التي شربتها (كوب)",
      rating: "ما تقييمك لترطيبك؟ (من 8 أكواب)",
      submit: "إرسال",
      back: "العودة للرئيسية",
    },
  };

  // Auto fill rating based on water intake
  const rating = Math.min(waterIntake, 8); // Auto-rate based on cups (max 8 cups)

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "water"; // 🔁 Change this to "study", "water", "sleep", etc.
  
    // Local update
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
    }
    localStorage.setItem("completedTasks", JSON.stringify(completed));
  
    // Firestore update
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};
  
      const updatedTasks = {
        ...(firestoreData.completedTasks || {}),
        [today]: [...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])]
      };
  
      await setDoc(userRef, {
        completedTasks: updatedTasks
      }, { merge: true });
    }
  
    navigate("/home");
  };
  

  return (
    <div style={{ padding: 20 }}>
      <h2>{t[language].title}</h2>

      <label>{t[language].waterIntake}:</label>
      <input
        type="number"
        value={waterIntake}
        onChange={(e) => setWaterIntake(e.target.value)}
        min="0"
        max="8" // Limit to 8 cups
      />

      <br />

      <h4>{t[language].rating}:</h4>
      <p>{rating} / 8</p> {/* Auto-filled rating based on cups */}

      <br />

      <p>{t[language].quote}</p> {/* Motivational quote */}
      <p style={{ fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
        وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ
      </p> {/* Quranic Verse */}

      <br />

      <button onClick={handleSubmit}>{t[language].submit}</button>
      <button onClick={() => navigate("/home")}>{t[language].back}</button>
            <NavBar />
      
    </div>
  );
}
