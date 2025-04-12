import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating"; // Import FancyRating
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

  useEffect(() => {
    // Load previously saved rating (if any) from localStorage
    const savedRating = JSON.parse(localStorage.getItem("gymRating"));
    if (savedRating) {
      setRating(savedRating);
    }
  }, []);

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
    }
    localStorage.setItem("completedTasks", JSON.stringify(completed));
  
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};
  
      const updatedTasks = {
        ...(firestoreData.completedTasks || {}),
        [today]: [...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])]
      };
  
      const updatedGym = {
        ...(firestoreData.gym || {}),
        [today]: {
          selected: Object.keys(workouts).filter((w) => workouts[w]),
          rating,
        }
      };
  
      await setDoc(userRef, {
        completedTasks: updatedTasks,
        gym: updatedGym
      }, { merge: true });
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
          <label key={workout} className="styled-checkbox">
            <input
              type="checkbox"
              name={workout}
              checked={workouts[workout]}
              onChange={handleWorkoutChange}
            />
            <span>{workout.charAt(0).toUpperCase() + workout.slice(1)}</span>
          </label>
        ))}
      </div>

      {/* <h4 style={{ marginTop: "20px" }}></h4> */}
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
