import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating";
import { useTaskSubmission } from "../../hooks/useTaskSubmission";
import { taskPoints } from "../../utils/constants";

export default function QuranPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pages, setPages] = useState("");
  const [rating, setRating] = useState(0);
  const [surah, setSurah] = useState("");
  const [validationError, setValidationError] = useState("");

  const { submit, isSubmitting, submissionError } = useTaskSubmission();

  const totalTime = selectedMinutes * 60;
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;

  const t = {
    en: {
      title: "Quran Focus Mode",
      chooseTime: "Choose Focus Time (minutes)",
      start: "Start", pause: "Pause", resume: "Resume", stop: "Stop",
      pages: "Pages Read",
      rating: "Focus Rating (1–5, optional)",
      submit: "Submit",
      back: "Back to Home",
    },
    ar: {
      title: "وضع التركيز - القرآن",
      chooseTime: "اختر مدة التركيز (بالدقائق)",
      start: "ابدأ", pause: "إيقاف مؤقت", resume: "استئناف", stop: "إيقاف",
      pages: "عدد الصفحات المقروءة",
      rating: "تقييم التركيز (من 1 إلى 5 , اختياري)",
      submit: "إرسال",
      back: "العودة للرئيسية",
    },
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("quran_timer") || "{}");
    if (saved.timeLeft && saved.startTime && saved.duration && saved.isRunning) {
      const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
      const remaining = saved.duration - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
        setIsRunning(true);
        setIsPaused(saved.isPaused || false);
      } else {
        localStorage.removeItem("quran_timer");
      }
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      const saved = JSON.parse(localStorage.getItem("quran_timer") || "{}");
      if (!saved.startTime || !saved.duration || !saved.isRunning) return;
      const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
      const remaining = saved.duration - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsRunning(false);
        setIsPaused(false);
        localStorage.removeItem("quran_timer");
        if (Notification.permission === "granted") {
          new Notification("⏱ Time's up!", { body: "Great job staying focused! 🌟", icon: "/favicon.ico" });
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

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startCountdown = () => {
    const duration = selectedMinutes * 60;
    localStorage.setItem("quran_timer", JSON.stringify({
      timeLeft: duration, duration, startTime: Date.now(), isRunning: true, isPaused: false,
    }));
    setTimeLeft(duration);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseCountdown = () => {
    setIsPaused(true);
    const saved = JSON.parse(localStorage.getItem("quran_timer") || "{}");
    localStorage.setItem("quran_timer", JSON.stringify({ ...saved, isPaused: true }));
  };

  const resumeCountdown = () => {
    setIsPaused(false);
    const saved = JSON.parse(localStorage.getItem("quran_timer") || "{}");
    localStorage.setItem("quran_timer", JSON.stringify({
      ...saved, isPaused: false,
      startTime: Date.now() - (saved.duration - timeLeft) * 1000,
    }));
  };

  const stopCountdown = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setIsPaused(false);
    localStorage.removeItem("quran_timer");
  };

  const handleSubmit = async () => {
    if (rating === 0 || ((pages === "" || pages === "0") && surah.trim() === "")) {
      setValidationError(language === "ar"
        ? "يرجى إدخال الصفحات أو السورة مع تقييم التركيز"
        : "Please enter pages or surah name and choose a focus rating");
      return;
    }
    setValidationError("");

    await submit({
      taskName: "quran",
      maxPerTask: 15,
      basePoints: taskPoints.quran || 15,
      getExtraData: () => ({
        quran: { pages: Number(pages), surah: surah.trim(), rating },
      }),
      getRawPoints: ({ repeatCount, basePoints }) => {
        let raw = repeatCount === 0 ? basePoints : repeatCount === 1 ? Math.round(basePoints / 2) : 0;
        const boost = rating >= 4 ? 1.5 : rating >= 2 ? 1.2 : 1;
        return Math.round(raw * boost);
      },
    });
  };

  const error = validationError || submissionError;

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
              cx="60" cy="60" r="50" stroke="#f8cc6a" strokeWidth="10" fill="none"
              strokeDasharray={314}
              strokeDashoffset={314 - (314 * percentage) / 100}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <h2 style={{ marginTop: 10 }}>{formatTime(timeLeft)}</h2>
        </div>
      )}

      {!isRunning && timeLeft === 0 && (
        <button onClick={startCountdown} style={{ backgroundColor: "green", color: "white" }}>
          {t[language].start}
        </button>
      )}
      {isRunning && !isPaused && (
        <button onClick={pauseCountdown} style={{ backgroundColor: "orange", color: "white" }}>
          {t[language].pause}
        </button>
      )}
      {isRunning && isPaused && (
        <button onClick={resumeCountdown} style={{ backgroundColor: "green", color: "white" }}>
          {t[language].resume}
        </button>
      )}
      {(isRunning || isPaused) && (
        <button onClick={stopCountdown} style={{ backgroundColor: "red", color: "white", marginLeft: 10 }}>
          {t[language].stop}
        </button>
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
            <button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "…" : t[language].submit}
            </button>
            <button onClick={() => navigate("/home")}>{t[language].back}</button>
          </div>
        </>
      )}

      <NavBar />
    </div>
  );
}
