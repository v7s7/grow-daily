import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import './App.css';

// Eager load critical components
import AuthPage from "./components/AuthPage";
import HomePage from "./components/HomePage";
import GlobalTimerWatcher from "./components/GlobalTimerWatcher";

// Lazy load non-critical routes
const SettingsPage = lazy(() => import("./components/SettingsPage"));
const InsightsPage = lazy(() => import("./components/InsightsPage"));
const CalendarPage = lazy(() => import("./components/CalendarPage"));
const ToDoList = lazy(() => import("./components/ToDoList"));
const EisenhowerToDo = lazy(() => import("./components/EisenhowerToDo"));
const ChoosePlan = lazy(() => import("./components/ChoosePlan"));

// Task pages
const QuranPage = lazy(() => import("./components/tasks/QuranPage"));
const StudyPage = lazy(() => import("./components/tasks/StudyPage"));
const GymPage = lazy(() => import("./components/tasks/GymPage"));
const WaterPage = lazy(() => import("./components/tasks/WaterPage"));
const SleepPage = lazy(() => import("./components/tasks/SleepPage"));
const PhoneUsePage = lazy(() => import("./components/tasks/PhoneUsePage"));
const AthkarPage = lazy(() => import("./components/tasks/AthkarPage"));
const SabahAthkarPage = lazy(() => import("./components/tasks/SabahAthkarPage"));
const MasaaAthkarPage = lazy(() => import("./components/tasks/MasaaAthkarPage"));
const ShowerTaskPage = lazy(() => import("./components/tasks/ShowerTaskPage"));
const AquariumPage = lazy(() => import("./components/AquariumPage"));

// Loading component
const LoadingFallback = () => (
  <div className="loading-screen">
    <h1 className="fade-in">Loading...</h1>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to={needsPlan ? "/choose-plan" : "/home"} /> : <AuthPage />} />
            <Route path="/auth" element={user ? <Navigate to={needsPlan ? "/choose-plan" : "/home"} /> : <AuthPage />} />

            {/* Protected Routes */}
            <Route path="/home" element={user ? (needsPlan ? <Navigate to="/choose-plan" /> : <HomePage />) : <Navigate to="/auth" />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/auth" />} />
            <Route path="/insights" element={user ? <InsightsPage /> : <Navigate to="/auth" />} />
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
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
