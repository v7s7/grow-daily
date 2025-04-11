import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating"; 
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
export default function ShowerTaskPage() {
  const navigate = useNavigate();
  const [isShowerComplete, setIsShowerComplete] = useState(false);

  const handleShowerCompletion = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "shower"; // 🔁 Change this to "study", "water", "sleep", etc.
  
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
    <div className="task-page-container">
      <h2>Shower Task</h2>
      <p>Did you complete your shower?</p>
      <button onClick={handleShowerCompletion}>
        {isShowerComplete ? "Completed" : "Mark as Completed"}
      </button>

      <hr />
      <NavBar />
    </div>
  );
}
