import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { auth, db } from "./firebaseConfig"; // Ensure db is exported from firebaseConfig
import AuthPage from "./components/AuthPage";
import HomePage from "./components/HomePage";
import SettingsPage from "./components/SettingsPage";
import AquariumPage from "./components/AquariumPage";
import CalendarPage from "./components/CalendarPage";
import QuranPage from "./components/tasks/QuranPage";
import StudyPage from "./components/tasks/StudyPage";
import GymPage from "./components/tasks/GymPage";
import WaterPage from "./components/tasks/WaterPage";
import SleepPage from "./components/tasks/SleepPage";
import PhoneUsePage from "./components/tasks/PhoneUsePage";
import AthkarPage from "./components/tasks/AthkarPage";
import SabahAthkarPage from "./components/tasks/SabahAthkarPage";
import MasaaAthkarPage from "./components/tasks/MasaaAthkarPage";
import ShowerTaskPage from "./components/tasks/ShowerTaskPage";
import GlobalTimerWatcher from "./components/GlobalTimerWatcher";
import ToDoList from "./components/ToDoList";
import EisenhowerToDo from "./components/EisenhowerToDo";
import ChoosePlan from "./components/ChoosePlan";
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [needsPlan, setNeedsPlan] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists() || !userSnap.data().plan) {
            setNeedsPlan(true); // No plan, redirect needed
          } else {
            setNeedsPlan(false); // Plan exists
          }
        } catch (error) {
          console.error("Error checking user plan:", error);
          setNeedsPlan(true); // Safe default
        }
      } else {
        setNeedsPlan(false);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="loading-screen">
        <h1 className="fade-in">Ready to GrowDaily?</h1>
      </div>
    );
  }

  return (
    <div>
      <GlobalTimerWatcher />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to={needsPlan ? "/choose-plan" : "/home"} /> : <AuthPage />} />
          <Route path="/auth" element={user ? <Navigate to={needsPlan ? "/choose-plan" : "/home"} /> : <AuthPage />} />

          {/* Protected Routes */}
          <Route path="/home" element={user ? (needsPlan ? <Navigate to="/choose-plan" /> : <HomePage />) : <Navigate to="/auth" />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/auth" />} />
          <Route path="/aquarium" element={user ? <AquariumPage /> : <Navigate to="/auth" />} />
          <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/auth" />} />
          <Route path="/todolist" element={user ? <ToDoList /> : <Navigate to="/auth" />} />
          <Route path="/eisenhower" element={user ? <EisenhowerToDo /> : <Navigate to="/auth" />} />
          <Route path="/task/quran" element={user ? <QuranPage /> : <Navigate to="/auth" />} />
          <Route path="/task/study" element={user ? <StudyPage /> : <Navigate to="/auth" />} />
          <Route path="/task/gym" element={user ? <GymPage /> : <Navigate to="/auth" />} />
          <Route path="/task/water" element={user ? <WaterPage /> : <Navigate to="/auth" />} />
          <Route path="/task/sleep" element={user ? <SleepPage /> : <Navigate to="/auth" />} />
          <Route path="/task/phone" element={user ? <PhoneUsePage /> : <Navigate to="/auth" />} />
          <Route path="/task/athkar" element={user ? <AthkarPage /> : <Navigate to="/auth" />} />
          <Route path="/task/athkar/sabah" element={user ? <SabahAthkarPage /> : <Navigate to="/auth" />} />
          <Route path="/task/athkar/masaa" element={user ? <MasaaAthkarPage /> : <Navigate to="/auth" />} />
          <Route path="/task/shower" element={user ? <ShowerTaskPage /> : <Navigate to="/auth" />} />
          <Route path="/choose-plan" element={user ? <ChoosePlan /> : <Navigate to="/auth" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
