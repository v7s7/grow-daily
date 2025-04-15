import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { taskPoints } from "../../utils/constants";
import './ShowerTaskPage.css';

export default function ShowerTaskPage() {
  const navigate = useNavigate();
  const [isShowerComplete, setIsShowerComplete] = useState(false);
  const language = localStorage.getItem("lang") || "en";

  const handleShowerCompletion = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "shower";

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
      const repeatCounts = firestoreData.taskRepeats?.[today] || {};
      const repeatCount = repeatCounts[repeatKey] || 0;

      const dailySubmissions = firestoreData.dailySubmissions?.[today] || 0;
      const dailyPoints = firestoreData.dailyPointsEarned?.[today] || 0;

      const basePoints = taskPoints[taskName] || 15;
      let pointsToAdd = 0;

      if (dailySubmissions < 5) {
        if (repeatCount === 0) {
          pointsToAdd = basePoints;
        } else if (repeatCount === 1) {
          pointsToAdd = Math.round(basePoints / 2);
        }
      }

      await setDoc(userRef, {
        completedTasks: {
          ...(firestoreData.completedTasks || {}),
          [today]: [...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])]
        },
        availablePoints: (firestoreData.availablePoints || 0) + pointsToAdd,
        taskRepeats: {
          ...(firestoreData.taskRepeats || {}),
          [today]: {
            ...repeatCounts,
            [repeatKey]: repeatCount + 1
          }
        },
        dailyPointsEarned: {
          ...(firestoreData.dailyPointsEarned || {}),
          [today]: dailyPoints + pointsToAdd
        },
        dailySubmissions: {
          ...(firestoreData.dailySubmissions || {}),
          [today]: dailySubmissions + 1
        }
      }, { merge: true });

      localStorage.setItem("availablePoints", (firestoreData.availablePoints || 0) + pointsToAdd);
    }

    setIsShowerComplete(true);
    navigate("/home");
  };

  return (
    <div className="task-page-container shower-container">
      <h2 className="shower-title">Shower Task</h2>
      <p className="shower-text">Did you complete your shower today?</p>
      <div className="shower-button-group">
        <button className="shower-button" onClick={handleShowerCompletion}>
          {isShowerComplete ? "Completed" : "Mark as Completed"}
        </button>
        <button className="shower-button" onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </div>
      <NavBar />
    </div>
  );
}
