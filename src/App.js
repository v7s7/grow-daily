import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} /> 
        <Route path="/home" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/aquarium" element={<AquariumPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/task/quran" element={<QuranPage />} />
        <Route path="/task/study" element={<StudyPage />} />
        <Route path="/task/gym" element={<GymPage />} />
        <Route path="/task/water" element={<WaterPage />} />
        <Route path="/task/sleep" element={<SleepPage />} />
        <Route path="/task/phone" element={<PhoneUsePage />} />
        <Route path="/task/athkar" element={<AthkarPage />} />
        <Route path="/task/athkar/sabah" element={<SabahAthkarPage />} />
        <Route path="/task/athkar/masaa" element={<MasaaAthkarPage />} /> 
        <Route path="/task/shower" element={<ShowerTaskPage />} />
      </Routes>
    </Router>
  );
}

export default App;
