import React, { useState } from "react";
import NavBar from "../NavBar";
import "../../styles/AthkarPage.css";
import { masaaAthkar } from "../../data/masaaAthkar";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function MasaaAthkarPage() {
  const savedProgress = JSON.parse(localStorage.getItem("masaa_athkar_progress") || "{}");
  const [current, setCurrent] = useState(savedProgress.current || 0);
  const [count, setCount] = useState(savedProgress.count || 0);
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
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
    }

    localStorage.setItem("completedTasks", JSON.stringify(completed));
    localStorage.removeItem("masaa_athkar_progress");

    const user = auth.currentUser;
    if (user) {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const firestoreData = snap.exists() ? snap.data() : {};
      const updated = {
        ...(firestoreData.completedTasks || {}),
        [today]: [...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])]
      };
      await setDoc(ref, { completedTasks: updated }, { merge: true });
    }

    window.location.href = "/home";
  };

  const circleRadius = 30;
  const circumference = 2 * Math.PI * circleRadius;
  const percentage = thikr.count > 1 ? count / thikr.count : 1;
  const offset = circumference - percentage * circumference;

  return (
    <div className="task-page-container" style={{ direction: "rtl", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px" }}>أذكار المساء</h2>

      <div className="thikr-box">
        <div className="text-wrapper">
          <p className="thikr-text">{thikr.text}</p>
          {thikr.benefit && <p className="thikr-benefit">{thikr.benefit}</p>}
        </div>

        {thikr.count > 1 && (
          <div className="progress-wrapper" onClick={handleCircleClick}>
            <svg width="80" height="80">
              <circle
                className="circle-bg"
                cx="40"
                cy="40"
                r={circleRadius}
                stroke="#2a2f58"
                strokeWidth="6"
                fill="none"
              />
              <circle
                className="progress-circle"
                cx="40"
                cy="40"
                r={circleRadius}
                stroke="#f5c84c"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 40 40)"
              />
              <text
                x="40"
                y="45"
                textAnchor="middle"
                fill="#f5c84c"
                fontSize="18"
                fontWeight="bold"
              >
                {count}
              </text>
            </svg>
          </div>
        )}

        <div className="button-wrapper">
          <button onClick={handlePrev}>{current === 0 ? "الرجوع" : "السابق"}</button>
          {isLastThikr ? (
            <button onClick={handleSubmit} className="next-button">إرسال</button>
          ) : (
            <button onClick={handleNext} className="next-button">التالي</button>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
}
