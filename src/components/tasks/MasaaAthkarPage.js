import React, { useState } from "react";
import NavBar from "../NavBar";
import "../../styles/AthkarPage.css";
import { masaaAthkar } from "../../data/masaaAthkar";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePoints } from "../../utils/updatePoints"; // ✅ new import

export default function MasaaAthkarPage() {
  const type = "masaa";
const progressKey = `${type}_athkar_progress`;
const taskName = `${type}_athkar`;

const savedProgress = JSON.parse(localStorage.getItem(progressKey) || "{}");
const completedTasks = JSON.parse(localStorage.getItem("completedTasks") || "{}");

// Current Bahrain time
const now = new Date();
const bahrainTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bahrain" }));
const currentHour = bahrainTime.getHours();
const currentDateStr = bahrainTime.toISOString().split("T")[0];

// Get the last date this athkar was marked completed
const lastCompletedDate = Object.keys(completedTasks).find(date =>
  completedTasks[date]?.includes(taskName)
);

// Determine if reset is needed
const shouldReset =
  lastCompletedDate &&
  lastCompletedDate !== currentDateStr &&
  currentHour >= 4;

const initialCurrent = shouldReset ? 0 : savedProgress.current || 0;
const initialCount = shouldReset ? 0 : savedProgress.count || 0;

const [current, setCurrent] = useState(initialCurrent);
const [count, setCount] = useState(initialCount);

// Optional: clear progress in storage if reset
if (shouldReset) {
  localStorage.setItem(progressKey, JSON.stringify({ current: 0, count: 0 }));
}

  const navigate = useNavigate();
  const thikr = masaaAthkar[current];
  const isLastThikr = current === masaaAthkar.length - 1;

  const saveProgress = (currentVal, countVal) => {
    localStorage.setItem("masaa_athkar_progress", JSON.stringify({ current: currentVal, count: countVal }));
  };

  const handleCircleClick = () => {
    if (count + 1 < thikr.count) {
      const newCount = count + 1;
      setCount(newCount);
      saveProgress(current, newCount);
    } else {
      setCount(thikr.count);
      saveProgress(current, thikr.count);
      setTimeout(() => {
        if (!isLastThikr) {
          const newCurrent = current + 1;
          setCurrent(newCurrent);
          setCount(0);
          saveProgress(newCurrent, 0);
        }
      }, 600);
    }
  };

  const handleNext = () => {
    if (!isLastThikr) {
      const newCurrent = current + 1;
      setCurrent(newCurrent);
      setCount(0);
      saveProgress(newCurrent, 0);
    }
  };

  const handlePrev = () => {
    if (current === 0) {
      navigate("/task/athkar");
    } else {
      const newCurrent = current - 1;
      setCurrent(newCurrent);
      setCount(0);
      saveProgress(newCurrent, 0);
    }
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "masaa_athkar";
  
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
  
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};
  
      const alreadySubmitted = firestoreData?.completedTasks?.[today]?.includes(taskName);
      const rawPoints = alreadySubmitted ? 0 : 10;
      const previousPoints = firestoreData[`${taskName}Points`]?.[today] || 0;
  
      await setDoc(userRef, {
        masaa_athkar: {
          ...(firestoreData.masaa_athkar || {}),
          [today]: true
        }
      }, { merge: true });
  
      await updatePoints({
        db,
        userId: user.uid,
        firestoreData,
        taskName,
        today,
        rawPoints,
        previousPoints, // ✅ this line is important
        maxPerTask: 10
      });
    }
  
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
      localStorage.setItem("completedTasks", JSON.stringify(completed));
    }
  
    navigate("/home");
  };
  
  

  const circleRadius = 40;
  const circumference = 2 * Math.PI * circleRadius;
  const percentage = thikr.count > 1 ? count / thikr.count : 1;
  const offset = circumference - percentage * circumference;

  return (
    <div
      className="task-page-container"
      style={{ direction: "rtl", textAlign: "center" }}
      onClick={(e) => {
        if (
          !e.target.closest(".navbar") &&
          e.target.tagName !== "BUTTON" &&
          e.target.tagName !== "svg" &&
          e.target.tagName !== "circle"
        ) {
          handleCircleClick();
        }
      }}
      
    >
      <h2 style={{ marginBottom: "20px" }}>أذكار المساء</h2>

      <div style={{ marginBottom: "12px" }}>
        <progress
          className="athkar-progress"
          value={current + 1}
          max={masaaAthkar.length}
          style={{
            width: "100%",
            height: "14px",
            borderRadius: "8px",
            appearance: "none",
            backgroundColor: "#f5c84c"
          }}
        />
        <p style={{ fontSize: "12px", color: "#ccc" }}>
          {current + 1} من {masaaAthkar.length}
        </p>
      </div>

      <div className="thikr-box">
        <div className="text-wrapper">
          <p className="thikr-text">{thikr.text}</p>
          {thikr.benefit && <p className="thikr-benefit">{thikr.benefit}</p>}
          {thikr.count > 1 && (
            <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "16px" }}>
              <strong>{thikr.count} {thikr.count === 100 ? "مرة" : "مرات"}</strong>
            </p>
          )}
        </div>

        {thikr.count > 1 && (
          <div className="progress-wrapper" onClick={handleCircleClick}>
            <svg width="120" height="120">
              <circle
                className="circle-bg"
                cx="60"
                cy="60"
                r={circleRadius}
                stroke="#2a2f58"
                strokeWidth="6"
                fill="none"
              />
              <circle
                className="progress-circle"
                cx="60"
                cy="60"
                r={circleRadius}
                stroke="#f5c84c"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="65"
                textAnchor="middle"
                fill="#f5c84c"
                fontSize="22"
                fontWeight="bold"
              >
                {count}
              </text>
            </svg>
          </div>
        )}

        <div className="button-wrapper">
          <button onClick={handlePrev} className="back-button">{current === 0 ? "الرجوع" : "السابق"}</button>
          {isLastThikr ? (
            <button onClick={handleSubmit} className="next-button">إرسال</button>
          ) : (
            <button onClick={handleNext} className="next-button">التالي</button>
          )}
        </div>
      </div>

      <NavBar className="navbar" />
      </div>
  );
}
