import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const HomeIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
      fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
    />
  </svg>
);

const InsightsIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 20V14H3L12 4L21 14H19V20H15V15H9V20H5Z"
      fill="none"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect x="4" y="14" width="4" height="6" rx="1" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
    <rect x="10" y="11" width="4" height="9" rx="1" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
    <rect x="16" y="8" width="4" height="12" rx="1" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
  </svg>
);

const CalendarIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3" y="4" width="18" height="18" rx="3"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M3 9H21"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2"
    />
    <path
      d="M8 2V6M16 2V6"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="8" cy="14" r="1.2" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
    <circle cx="12" cy="14" r="1.2" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
    <circle cx="16" cy="14" r="1.2" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
    <circle cx="8" cy="18" r="1.2" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
    <circle cx="12" cy="18" r="1.2" fill={active ? "#F5C533" : "rgba(235,235,245,0.38)"} />
  </svg>
);

const TasksIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3" y="3" width="18" height="18" rx="3"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M7 12L10 15L17 9"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="12" cy="12" r="3"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={active ? "#F5C533" : "rgba(235,235,245,0.38)"}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export default function NavBar({ language = "en" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const t = {
    en: { home: "Home", insights: "Stats", calendar: "Calendar", tasks: "Tasks", settings: "Settings" },
    ar: { home: "الرئيسية", insights: "إحصائيات", calendar: "التقويم", tasks: "المهام", settings: "الإعدادات" },
  };

  const tabs = [
    { key: "home",     path: "/home",      label: t[language].home,     Icon: HomeIcon },
    { key: "insights", path: "/insights",  label: t[language].insights, Icon: InsightsIcon },
    { key: "calendar", path: "/calendar",  label: t[language].calendar, Icon: CalendarIcon },
    { key: "tasks",    path: "/todolist",  label: t[language].tasks,    Icon: TasksIcon },
    { key: "settings", path: "/settings", label: t[language].settings, Icon: SettingsIcon },
  ];

  return (
    <nav className="tab-bar" style={{ direction: "ltr" }}>
      {tabs.map(({ key, path, label, Icon }) => {
        const isActive = location.pathname === path ||
          (key === "tasks" && ["/todolist", "/eisenhower"].includes(location.pathname));
        return (
          <button
            key={key}
            className={`tab-item${isActive ? " active" : ""}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <Icon active={isActive} />
            <span className="tab-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
