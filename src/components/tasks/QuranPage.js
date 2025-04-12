import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function QuranPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pages, setPages] = useState("");
  const [rating, setRating] = useState(0);
  const [surah, setSurah] = useState("");
  const [error, setError] = useState("");
  const totalTime = selectedMinutes * 60;
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;
  const user = auth.currentUser;
  console.log("Logged in user:", auth.currentUser);

  const t = {
    en: {
      title: "Quran Focus Mode",
      chooseTime: "Choose Focus Time (minutes)",
      countdown: "Time Left",
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
      pages: "Pages Read",
      rating: "Focus Rating (1–5, optional)",
      submit: "Submit",
    },
    ar: {
      title: "وضع التركيز - القرآن",
      chooseTime: "اختر مدة التركيز (بالدقائق)",
      countdown: "الوقت المتبقي",
      start: "ابدأ",
      pause: "إيقاف مؤقت",
      resume: "استئناف",
      stop: "إيقاف",
      pages: "عدد الصفحات المقروءة",
      rating: "تقييم التركيز (من 1 إلى 5 , اختياري)",
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
    if (
      rating === 0 ||
      ((pages === "" || pages === "0") && surah.trim() === "")
    ) {
      setError(language === "ar"
        ? "يرجى إدخال الصفحات أو السورة مع تقييم التركيز"
        : "Please enter pages or surah name and choose a focus rating");
      return;
    }
    
      
    const today = new Date().toISOString().split("T")[0];
    const taskName = "quran";
  
    // Save to local
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
    }
    localStorage.setItem("completedTasks", JSON.stringify(completed));
  
    // Save to Firestore
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};
  
      const updatedTasks = {
        ...(firestoreData.completedTasks || {}),
        [today]: [...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])]
      };
  
      const updatedQuran = {
        ...(firestoreData.quran || {}),
        [today]: {
          pages: Number(pages),
          surah: surah.trim(),
          rating: rating
        },
      };
  
      await setDoc(userRef, {
        completedTasks: updatedTasks,
        quran: updatedQuran
      }, { merge: true });
    }
  
    setError(""); 
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
              stroke="#f8cc6a"
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
          <label>{language === "ar" ? "اسم السورة " : "Surah name "}</label>
<input
  type="text"
  value={surah}
  onChange={(e) => setSurah(e.target.value)}
  placeholder={language === "ar" ? "الفاتحة" : "Al-Fatiha"}
/>
<label>{t[language].pages}</label>

          <input type="number" value={pages} onChange={(e) => setPages(e.target.value)} />
          <FancyRating value={rating} onChange={(val) => setRating(val)} label={t[language].rating} />
          <br />
          {error && (
  <p style={{ color: "#ff5e57", fontWeight: "bold", textAlign: "center", marginTop: 10 }}>
    {error}
  </p>
)}

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
