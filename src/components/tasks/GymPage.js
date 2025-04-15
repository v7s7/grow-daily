import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { taskPoints } from "../../utils/constants";
import { updatePoints } from "../../utils/updatePoints"; 
import "../../styles/GymPage.css";

export default function GymPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";
  const [error, setError] = useState("");
  const [workouts, setWorkouts] = useState({
    fullbody: false,
    chest: false,
    back: false,
    arms: false,
    shoulders: false,
    legs: false,
    cardio: false,
  });
  const [rating, setRating] = useState(0);

  const t = {
    en: {
      title: "Gym Focus Mode",
      chooseWorkout: "Choose the workout(s) you did:",
      rating: "How would you rate your workout?",
      submit: "Submit",
      back: "Back to Home",
    },
    ar: {
      title: "وضع التركيز - النادي",
      chooseWorkout: "اختر التمرين الذي قمت به:",
      rating: "ما تقييمك لتمرينك؟",
      submit: "إرسال",
      back: "العودة للرئيسية",
    },
  };

  const handleWorkoutChange = (event) => {
    const { name, checked } = event.target;
    setWorkouts((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async () => {
    const selectedWorkouts = Object.values(workouts).filter(Boolean).length;
    if (selectedWorkouts === 0 || rating === 0) {
      setError(language === "ar"
        ? "يرجى اختيار تمرين واحد على الأقل وتقييم التمرين"
        : "Please select at least one workout and rate your session");
      return;
    }
  
    const today = new Date().toISOString().split("T")[0];
    const taskName = "gym";
  
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
  
      const repeatKey = `${taskName}_repeat`;
      const repeatCount = firestoreData.taskRepeats?.[today]?.[repeatKey] || 0;
      const previousPoints = firestoreData.gymPoints?.[today] || 0;
      const maxPerTask = 15;
      const basePoints = taskPoints[taskName] || 15;
  
      // Save workout info
      await setDoc(userRef, {
        gym: {
          ...(firestoreData.gym || {}),
          [today]: {
            selected: Object.keys(workouts).filter((w) => workouts[w]),
            rating,
          }
        },
        taskRepeats: {
          ...(firestoreData.taskRepeats || {}),
          [today]: {
            ...(firestoreData.taskRepeats?.[today] || {}),
            [repeatKey]: repeatCount + 1
          }
        }
      }, { merge: true });
  
      // 🎯 Calculate rawPoints correctly
      let rawPoints = 0;
      if (repeatCount === 0) {
        rawPoints = basePoints;
      } else if (repeatCount === 1) {
        rawPoints = Math.round(basePoints / 2);
      }
  
      const ratingBoost = rating >= 4 ? 1.5 : rating >= 2 ? 1.2 : 1;
      rawPoints = Math.round(rawPoints * ratingBoost);
  
      await updatePoints({
        db,
        userId: user.uid,
        firestoreData,
        taskName,
        today,
        rawPoints,
        previousPoints,
        maxPerTask,
        repeatCount
      });
    }
  
    setError("");
    navigate("/home");
  };
  

  return (
    <div className="task-page-container">
      <h2>{t[language].title}</h2>

      <h4>{t[language].chooseWorkout}</h4>
      <div className="checkbox-group">
        {Object.keys(workouts).map((workout) => (
          <label key={workout} className="checkbox-wrapper">
            <input
              type="checkbox"
              name={workout}
              checked={workouts[workout]}
              onChange={handleWorkoutChange}
            />
            <span className="checkmark">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M20.3 5.7c.4.4.4 1 0 1.4L9.4 18 3.7 12.3a1 1 0 1 1 1.4-1.4l4.3 4.3L18.9 5.7a1 1 0 0 1 1.4 0z"
                />
              </svg>
            </span>
            <span className="label">{workout.charAt(0).toUpperCase() + workout.slice(1)}</span>
          </label>
        ))}
      </div>

      <FancyRating value={rating} onChange={(val) => setRating(val)} label={t[language].rating} />

      {error && (
        <p style={{ color: "#ff5e57", fontWeight: "bold", textAlign: "center", marginTop: 10 }}>
          {error}
        </p>
      )}

      <div className="button-center">
        <button onClick={handleSubmit}>{t[language].submit}</button>
        <button onClick={() => navigate("/home")}>{t[language].back}</button>
      </div>

      <NavBar />
    </div>
  );
}
