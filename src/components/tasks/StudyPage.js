import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { taskPoints } from "../../utils/constants";
import { updatePoints } from "../../utils/updatePoints";
import { getLocalDateStr } from "../../utils/dateUtils";

export default function StudyPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");

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
      back: "Back to Home"
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
      back: "العودة للرئيسية"
    },
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("study_timer") || "{}");
    if (saved.timeLeft && saved.startTime && saved.duration && saved.isRunning) {
      const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
      const remaining = saved.duration - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
        setIsRunning(true);
        setIsPaused(saved.isPaused || false);
      } else {
        localStorage.removeItem("study_timer");
      }
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      const saved = JSON.parse(localStorage.getItem("study_timer") || "{}");
      if (!saved.startTime || !saved.duration || !saved.isRunning) return;

      const now = Date.now();
      const elapsed = Math.floor((now - saved.startTime) / 1000);
      const remaining = saved.duration - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsRunning(false);
        setIsPaused(false);
        localStorage.removeItem("study_timer");

        if (Notification.permission === "granted") {
          new Notification("⏱ Time's up!", {
            body: "Great job staying focused! 🌟",
            icon: "/favicon.ico"
          });
        } else {
          alert("⏱ Time's up! Great job staying focused! 🌟");
        }
      } else {
        setTimeLeft(remaining);
      }
    };

    if (isRunning && !isPaused) {
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startCountdown = () => {
    const duration = selectedMinutes * 60;
    const startTime = Date.now();
    const state = {
      timeLeft: duration,
      duration,
      startTime,
      isRunning: true,
      isPaused: false,
    };
    localStorage.setItem("study_timer", JSON.stringify(state));
    setTimeLeft(duration);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseCountdown = () => {
    setIsPaused(true);
    const saved = JSON.parse(localStorage.getItem("study_timer") || "{}");
    saved.isPaused = true;
    localStorage.setItem("study_timer", JSON.stringify(saved));
  };

  const resumeCountdown = () => {
    setIsPaused(false);
    const saved = JSON.parse(localStorage.getItem("study_timer") || "{}");
    saved.isPaused = false;
    saved.startTime = Date.now() - (saved.duration - timeLeft) * 1000;
    localStorage.setItem("study_timer", JSON.stringify(saved));
  };

  const stopCountdown = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setIsPaused(false);
    localStorage.removeItem("study_timer");
  };

  const handleSubmit = async () => {
    if (rating === 0 || subject.trim() === "") {
      setError(language === "ar"
        ? "يرجى إدخال اسم المادة مع تقييم التركيز"
        : "Please enter subject and choose a focus rating");
      return;
    }

    const today = getLocalDateStr();
    const taskName = "study";

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
      const previousPoints = firestoreData.studyPoints?.[today] || 0;
      const basePoints = taskPoints[taskName] || 15;
      const maxPerTask = 15;

      // Save subject & rating
      await setDoc(userRef, {
        study: {
          ...(firestoreData.study || {}),
          [today]: {
            subject: subject.trim(),
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
    <div className="task-page-container" style={{ direction: language === "ar" ? "rtl" : "ltr", padding: 20 }}>
      <h2>{t[language].title}</h2>

      {!isRunning && timeLeft === 0 && (
        <>
          <label>{t[language].chooseTime}</label>
          <select value={selectedMinutes} onChange={(e) => setSelectedMinutes(Number(e.target.value))}>
            {[0.1, 5, 10, 15, 20, 25, 30].map((min) => (
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
          <label>{t[language].subject}</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />

          <FancyRating value={rating} onChange={(val) => setRating(val)} label={t[language].rating} />

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
