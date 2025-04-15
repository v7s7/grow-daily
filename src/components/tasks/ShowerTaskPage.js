import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { taskPoints } from "../../utils/constants";
import './ShowerTaskPage.css';
import { updatePoints } from "../../utils/updatePoints";

export default function ShowerTaskPage() {
  const navigate = useNavigate();
  const [isShowerComplete, setIsShowerComplete] = useState(false);
  const language = localStorage.getItem("lang") || "en";

  const handleShowerCompletion = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "shower";
  
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
  
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};
  
      const alreadySubmitted = firestoreData?.completedTasks?.[today]?.includes(taskName);
      const rawPoints = alreadySubmitted ? 0 : 10;
  
      await updatePoints({
        db,
        userId: user.uid,
        firestoreData,
        taskName,
        today,
        rawPoints,
        maxPerTask: 10
      });
  
      // ✅ Only mark as complete locally after update
      if (!completed[today].includes(taskName)) {
        completed[today].push(taskName);
        localStorage.setItem("completedTasks", JSON.stringify(completed));
      }
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
