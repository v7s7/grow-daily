import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import StyledSlider from "../StyledSlider";
import FancyRating from "../FancyRating";

export default function GymPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";

  const [workouts, setWorkouts] = useState({
    back: false,
    chest: false,
    legs: false,
    arms: false,
    shoulders: false,
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

  const handleSubmit = () => {
    const today = new Date().toISOString().split("T")[0];
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");

    completed[today] = completed[today] || [];
    if (!completed[today].includes("gym")) {
      completed[today].push("gym");
    }

    localStorage.setItem("completedTasks", JSON.stringify(completed));
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

      <h4 style={{ marginTop: "20px" }}>{t[language].rating} (0–10):</h4>
      <FancyRating value={rating} onChange={(val) => setRating(val)} label={t[language].rating} />

      <div className="button-center">
        <button onClick={handleSubmit}>{t[language].submit}</button>
        <button onClick={() => navigate("/home")}>{t[language].back}</button>
      </div>

      <NavBar />
    </div>
  );
}
