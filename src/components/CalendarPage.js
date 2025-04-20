import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarPage.css';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import NavBar from "./NavBar";

const getLocalDateStr = (date) => {
  const local = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Bahrain" }));
  const yyyy = local.getFullYear();
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function CalendarPage() {
  const [completed, setCompleted] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [value, setValue] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setCompleted(snap.data().completedTasks || {});
      }
    };
    fetchData();
  }, []);

  const getColorClass = (date) => {
    const day = getLocalDateStr(date);
    const todayTasks = completed[day] || [];
    const plan = JSON.parse(localStorage.getItem("selectedTasks") || "[]");
    const todayStr = getLocalDateStr(new Date());
    const isToday = day === todayStr;

    if (!todayTasks.length) return isToday ? "today-outline" : "";

    const isFull = plan.length === 0 || todayTasks.length === plan.length;

    if (isFull) return isToday ? "today-outline full" : "full";
    return isToday ? "today-outline partial" : "partial";
  };

  const handleClickDay = (date) => {
    const str = getLocalDateStr(date);
    const tasks = completed[str] || [];
    setSelectedDateStr(str);
    setSelectedTasks(tasks);
    setShowPopup(true);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setValue(today);
    setActiveStartDate(today);
    setCalendarView("month");
  };

  return (
<div className="calendar-fullscreen">
<h2 style={{ textAlign: "center" }}>📅 Progress Calendar</h2>

      <div className="calendar-controls">
        <button onClick={() => window.location.href = "/home"}>🏠 Home</button>
        <button onClick={handleTodayClick}>📆 Today</button>
      </div>

      <Calendar
        onClickDay={handleClickDay}
        tileClassName={({ date }) => getColorClass(date)}
        value={value}
        activeStartDate={activeStartDate}
        view={calendarView}
        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
        onViewChange={({ view }) => setCalendarView(view)}
      />

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {new Date(selectedDateStr).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Asia/Bahrain",
              })}
            </h3>
            {selectedTasks.length ? (
              <ul>
                {selectedTasks.map((task, index) => (
                  <li key={index}>✅ {task}</li>
                ))}
              </ul>
            ) : (
              <p>No tasks completed.</p>
            )}
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
