import { useEffect } from "react";

export default function GlobalTimerWatcher() {
  useEffect(() => {
    const tick = () => {
      // Check for both study and quran timers in localStorage
      const saved = JSON.parse(localStorage.getItem("study_timer") || localStorage.getItem("quran_timer") || "{}");
      
      // If no timer is running, return early
      if (!saved?.startTime || !saved?.duration || !saved?.isRunning) return;

      // Calculate remaining time
      const now = Date.now();
      const elapsed = Math.floor((now - saved.startTime) / 1000);
      const remaining = saved.duration - elapsed;

      // If the timer has finished
      if (remaining <= 0) {
        localStorage.removeItem("study_timer");
        localStorage.removeItem("quran_timer");

        // Show notification if the permission is granted
        if (Notification.permission === "granted") {
          new Notification("⏱ Time's up!", {
            body: "Well done! 🎉",
            icon: "/favicon.ico",  // Optional: add an icon for the notification
          });
        }
      }
    };

    // Run immediately
    tick();

    // Set an interval to check every second
    const interval = setInterval(tick, 1000);

    // Clear interval on cleanup
    return () => clearInterval(interval);
  }, []);

  return null;
}
