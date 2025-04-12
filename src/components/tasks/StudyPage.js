import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating"; 
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function StudyPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(0);

  const totalTime = selectedMinutes * 60;
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;

  const t = {
    en: {
      title: "Study Focus Mode",
      chooseTime: "Choose Focus Time (minutes)",
      countdown: "Time Left",
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
      subject: "Subject Name (optional)",
      rating: "Focus Rating (1–5, optional)",
      submit: "Submit",
    },
    ar: {
      title: "وضع التركيز - الدراسة",
      chooseTime: "اختر مدة التركيز (بالدقائق)",
      countdown: "الوقت المتبقي",
      start: "ابدأ",
      pause: "إيقاف مؤقت",
      resume: "استئناف",
      stop: "إيقاف",
      subject: "اسم المادة (اختياري)",
      rating: "تقييم التركيز (من 1 إلى 5، اختياري)",
      submit: "إرسال",
    },
  };

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startCountdown = () => {
    setTimeLeft(selectedMinutes * 60);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseCountdown = () => setIsPaused(true);
  const resumeCountdown = () => setIsPaused(false);
  const stopCountdown = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "study"; // 🔁 Change this to "study", "water", "sleep", etc.
  
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
    <div className="task-page-container" style={{ direction: language === "ar" ? "rtl" : "ltr", padding: 20 }}>
      <h2>{t[language].title}</h2>

      {!isRunning && timeLeft === 0 && (
        <>
          <label>{t[language].chooseTime}</label>
          <select value={selectedMinutes} onChange={(e) => setSelectedMinutes(Number(e.target.value))}>
            {[5, 10, 15, 20, 25, 30].map((min) => (
              <option key={min} value={min}>{min}</option>
            ))}
          </select>
        </>
      )}

      {timeLeft > 0 && (
        <div style={{ textAlign: "center", margin: "30px auto" }}>
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="50" stroke="#ccc" strokeWidth="10" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="green"
              strokeWidth="10"
              fill="none"
              strokeDasharray={314}
              strokeDashoffset={314 - (314 * percentage) / 100}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <h2 style={{ marginTop: 10 }}>{formatTime(timeLeft)}</h2>
        </div>
      )}

      {!isRunning && timeLeft === 0 && (
        <button onClick={startCountdown} style={{ backgroundColor: "green", color: "white" }}>{t[language].start}</button>
      )}
      {isRunning && !isPaused && (
        <button onClick={pauseCountdown} style={{ backgroundColor: "orange", color: "white" }}>{t[language].pause}</button>
      )}
      {isRunning && isPaused && (
        <button onClick={resumeCountdown} style={{ backgroundColor: "green", color: "white" }}>{t[language].resume}</button>
      )}
      {(isRunning || isPaused) && (
        <button onClick={stopCountdown} style={{ backgroundColor: "red", color: "white", marginLeft: 10 }}>{t[language].stop}</button>
      )}

      {!isRunning && timeLeft === 0 && (
        <>
          <label>{t[language].subject}</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />

          <FancyRating value={rating} onChange={(val) => setRating(val)} label={t[language].rating} />

          <br />
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
  <button onClick={handleSubmit}>{t[language].submit}</button>
  <button onClick={() => navigate("/home")}>
    {t[language]?.back || "Back to Home"}
  </button>
</div>
        </>
      )}

      <NavBar />
    </div>
  );
}
