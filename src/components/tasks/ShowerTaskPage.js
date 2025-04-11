import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";

export default function ShowerTaskPage() {
  const navigate = useNavigate();
  const [isShowerComplete, setIsShowerComplete] = useState(false);

  const handleShowerCompletion = () => {
    const today = new Date().toISOString().split("T")[0];
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");

    completed[today] = completed[today] || [];
    if (!completed[today].includes("shower")) {
      completed[today].push("shower");
    }

    localStorage.setItem("completedTasks", JSON.stringify(completed));
    setIsShowerComplete(true);
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
