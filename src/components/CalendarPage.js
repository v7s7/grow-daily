import React, { useEffect, useState, useMemo } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarPage.css';
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";
import { getLocalDateStr } from "../utils/dateUtils";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [value, setValue] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");

  const selectedPlan = useMemo(() =>
    JSON.parse(localStorage.getItem("tasks") || "[]"),
  []);

  // Fetch only the daily docs for the visible calendar month
  useEffect(() => {
    const fetchMonthData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const year = activeStartDate.getFullYear();
      const month = activeStartDate.getMonth();
      const startStr = new Date(year, month, 1).toLocaleDateString("en-CA");
      const endStr = new Date(year, month + 1, 0).toLocaleDateString("en-CA");

      const dailyColl = collection(db, "users", user.uid, "daily");
      const q = query(
        dailyColl,
        where(documentId(), ">=", startStr),
        where(documentId(), "<=", endStr),
      );
      const snap = await getDocs(q);

      const result = {};
      snap.forEach((d) => {
        result[d.id] = d.data().completedTasks || [];
      });
      // Merge so navigating back doesn't wipe previously loaded months
      setCompleted((prev) => ({ ...prev, ...result }));
    };
    fetchMonthData();
  }, [activeStartDate]);

  const getColorClass = (date) => {
    const day = getLocalDateStr(date);
    const tasks = completed[day] || [];
    const isToday = day === getLocalDateStr();
    if (!tasks.length) return isToday ? "today-outline" : "";
    const isFull = selectedPlan.length === 0 || tasks.length >= selectedPlan.length;
    if (isFull) return isToday ? "today-outline full" : "full";
    return isToday ? "today-outline partial" : "partial";
  };

  const handleClickDay = (date) => {
    const str = getLocalDateStr(date);
    setSelectedDateStr(str);
    setSelectedTasks(completed[str] || []);
    setShowPopup(true);
  };

  const handleTodayClick = () => {
    setValue(new Date());
    setActiveStartDate(new Date());
    setCalendarView("month");
  };

  return (
    <div className="calendar-fullscreen">
      <h2 style={{ textAlign: "center" }}>📅 Progress Calendar</h2>

      <div className="calendar-controls">
        <button onClick={() => navigate("/home")}>🏠 Home</button>
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
              {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </h3>
            {selectedTasks.length ? (
              <ul>
                {selectedTasks.map((task, i) => <li key={i}>✅ {task}</li>)}
              </ul>
            ) : (
              <p>No tasks completed.</p>
            )}
            <button onClick={() => setShowPopup(false)} autoFocus>Close</button>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
