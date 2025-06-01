import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./SettingsPage.css"; 

export default function ChoosePlan() {
  const navigate = useNavigate();

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Define categories and tasks
  const categories = {
    All: ["quran", "gym", "study", "water", "sleep", "phone", "athkar", "shower"],
    Islamic: ["quran", "athkar"],
    Sport: ["gym"],
    Study: ["study"],
    Health: ["water", "sleep"],
    Lifestyle: ["phone", "shower"]
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate("/auth");
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleTaskToggle = (task) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleSave = async () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task.");
      return;
    }

    if (!user) {
      alert("User not authenticated. Please sign in.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), { plan: selectedTasks }, { merge: true });
      localStorage.setItem("tasks", JSON.stringify(selectedTasks));
      navigate("/home");
      window.location.reload();
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Error saving your plan. Please try again.");
    }
  };

  if (checkingAuth) return null;

  // Filter tasks based on selected category
  const displayedTasks = selectedCategory === "All" ? categories.All : categories[selectedCategory];

  return (
    <div className="settings-wrapper">
      <h2>Choose Your Plan</h2>
      <h3>You can change it later</h3>

      <div className="button-group">
        {Object.keys(categories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{ fontWeight: selectedCategory === category ? "bold" : "normal" }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Task Count Display */}
      <p style={{ fontWeight: "bold", marginTop: "10px" }}>
        Tasks chosen: {selectedTasks.length}
      </p>

      <div className="task-grid">
        {displayedTasks.map((task) => (
          <div
            key={task}
            onClick={() => handleTaskToggle(task)}
            className={`task-option ${selectedTasks.includes(task) ? "selected" : "unselected"}`}
          >
            <img
              src={`/icons/${task}.png`}
              alt={task}
              style={{ filter: selectedTasks.includes(task) ? "none" : "grayscale(100%)" }}
            />
            <span>{task.charAt(0).toUpperCase() + task.slice(1)}</span>
          </div>
        ))}
      </div>

      <div className="button-group">
        <button onClick={handleSave}>Save and Go Home</button>
      </div>
    </div>
  );
}
