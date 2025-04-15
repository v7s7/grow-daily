import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { taskPoints } from "../../utils/constants";
import { updatePoints } from "../../utils/updatePoints";

export default function SleepPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";

  const [sleepHours, setSleepHours] = useState("0");
  const [rating, setRating] = useState(0);
  const [quote, setQuote] = useState("");

  const t = {
    en: {
      title: "Sleep Tracker",
      sleepHours: "Number of Hours Slept",
      rating: "Your Sleep Quality Rating (0–10)",
      submit: "Submit",
      back: "Back to Home",
    },
    ar: {
      title: "تتبع النوم",
      sleepHours: "عدد ساعات النوم",
      rating: "تقييم جودة نومك (من 0 إلى 10)",
      submit: "إرسال",
      back: "العودة للرئيسية",
    },
  };

  const quotes = [
    "Sleep is the best meditation.",
    "A good laugh and a long sleep are the best cures in the doctor’s book.",
    "The more you sleep, the better you perform.",
    "Sleep is the golden chain that ties health and our bodies together.",
    "Sleep is the most important part of any fitness routine.",
    "The time to sleep is when you are tired.",
    "Good sleep is a powerful tool for maintaining health."
  ];

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const updateQuote = () => {
    const lastQuoteDate = localStorage.getItem("lastSleepQuoteDate");
    const currentDate = new Date().toLocaleDateString();

    if (lastQuoteDate !== currentDate) {
      const randomQuote = getRandomQuote();
      localStorage.setItem("sleepQuote", randomQuote);
      localStorage.setItem("lastSleepQuoteDate", currentDate);
      setQuote(randomQuote);
    } else {
      setQuote(localStorage.getItem("sleepQuote"));
    }
  };

  const calculateRating = (hours) => {
    const h = Number(hours);
    if (h === 0 || h === 24) return 0;
    if (h >= 7 && h <= 9) return 10;
    if (h < 7) return Math.max(0, 10 - (7 - h));
    if (h > 9) return Math.max(0, 10 - (h - 9));
    return 0;
  };

  useEffect(() => {
    updateQuote();
    setRating(calculateRating(sleepHours));
  }, [sleepHours]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setSleepHours("");
    } else {
      const clamped = Math.max(0, Math.min(24, Number(raw)));
      setSleepHours(clamped.toString());
    }
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "sleep";
  
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
      localStorage.setItem("completedTasks", JSON.stringify(completed));
    }
  
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};
  
      const alreadySubmitted = firestoreData?.completedTasks?.[today]?.includes(taskName);
      const rawPoints = alreadySubmitted ? 0 : rating;
  
      // Save sleepPoints
      await setDoc(userRef, {
        sleepPoints: {
          ...(firestoreData.sleepPoints || {}),
          [today]: rating
        }
      }, { merge: true });
  
      await updatePoints({
        db,
        userId: user.uid,
        firestoreData,
        taskName,
        today,
        rawPoints,
        maxPerTask: 10
      });
    }
  
    navigate("/home");
  };
  
  
  

  return (
    <div className="task-page-container">
      <div style={{ padding: 20 }}>
        <h2>{t[language].title}</h2>

        <label>{t[language].sleepHours}:</label>
        <input
          type="number"
          value={sleepHours}
          onChange={handleInputChange}
          max="24"
        />

        <br />

        <h4>{t[language].rating}:</h4>
        <p style={{ fontSize: "24px", color: "#f5c84c", textAlign: "center", fontWeight: "bold" }}>
          {rating} / 10
        </p>

        <p style={{
          fontSize: "12px",
          textAlign: "center",
          color: rating === 10 ? "#4caf50" : rating >= 7 ? "#f5c84c" : "#ff5e57",
          fontWeight: "bold"
        }}>
          {rating === 10
            ? "Perfect sleep! 😴🌙"
            : rating >= 7
              ? "Pretty good, try to stay consistent 🌜"
              : "Try to get more restful sleep 💤"}
        </p>

        <br />

        <p style={{ fontSize: "12px", color: "#f5c84c", textAlign: "center", fontWeight: "bold" }}>{quote}</p>

        <br />

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
          <button onClick={handleSubmit}>{t[language].submit}</button>
          <button onClick={() => navigate("/home")}>
            {t[language]?.back || "Back to Home"}
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
