import React, { memo } from "react";
import { useNavigate } from "react-router-dom";

const TASK_LABELS = {
  en: {
    quran: "Quran", gym: "Gym", study: "Study", water: "Water",
    sleep: "Sleep", phone: "Phone", athkar: "Athkar", shower: "Shower",
  },
  ar: {
    quran: "القرآن", gym: "النادي", study: "الدراسة", water: "الماء",
    sleep: "النوم", phone: "الهاتف", athkar: "الأذكار", shower: "الدش",
  },
};

function getCardClass(task, completedTasks) {
  if (task === "athkar") {
    const sabah = completedTasks.includes("sabah_athkar");
    const masaa = completedTasks.includes("masaa_athkar");
    const sabahProg = JSON.parse(localStorage.getItem("sabah_athkar_progress") || "{}");
    const masaaProg = JSON.parse(localStorage.getItem("masaa_athkar_progress") || "{}");
    const started = sabahProg.current > 0 || masaaProg.current > 0 || sabah || masaa;
    if (sabah && masaa) return "task-card completed";
    if (started) return "task-card in-progress";
    return "task-card";
  }
  return completedTasks.includes(task) ? "task-card completed" : "task-card";
}

/**
 * Renders the task grid. Wrapped in React.memo — only re-renders when the
 * task list or completed set changes.
 */
const TaskGrid = memo(function TaskGrid({ tasks, completedTasks, language }) {
  const navigate = useNavigate();
  const labels = TASK_LABELS[language] || TASK_LABELS.en;

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <div
          key={task}
          className={getCardClass(task, completedTasks)}
          onClick={() => navigate(`/task/${task}`)}
        >
          <img src={`/icons/${task}.png`} alt={task} className="task-icon" />
          <span className="task-label">{labels[task] || task}</span>
        </div>
      ))}
    </div>
  );
});

export default TaskGrid;
