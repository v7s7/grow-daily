import { useEffect } from "react";

export default function GlobalTimerWatcher() {
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = JSON.parse(localStorage.getItem("study_timer") || "{}");
      if (!saved.startTime || !saved.duration || !saved.isRunning || saved.isPaused) return;

      const now = Date.now();
      const elapsed = Math.floor((now - saved.startTime) / 1000);
      const remaining = saved.duration - elapsed;

      if (remaining <= 0) {
        localStorage.removeItem("study_timer");

        if (Notification.permission === "granted") {
          new Notification("⏱ Time's up!", {
            body: "Great job staying focused! 🌟",
            icon: "/favicon.ico"
          });
        } else {
          alert("⏱ Time's up! Great job staying focused! 🌟");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // invisible
}
