import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function PhoneUsePage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en";

  const [phoneUseHours, setPhoneUseHours] = useState("0");
  const [rating, setRating] = useState(0);
  const [quote, setQuote] = useState("");

  const t = {
    en: {
      title: "Phone Use Tracker",
      phoneUse: "Number of Hours Spent on Phone",
      rating: "Your Phone Use Rating (0–10)",
      submit: "Submit",
      back: "Back to Home",
    },
    ar: {
      title: "تتبع استخدام الهاتف",
      phoneUse: "عدد ساعات استخدام الهاتف",
      rating: "تقييم استخدام الهاتف (من 0 إلى 10)",
      submit: "إرسال",
      back: "العودة للرئيسية",
    },
  };

  const quotes = [
    "Don't let your phone control you. Control your phone.",
    "The best things in life aren't things.",
    "Disconnect to reconnect.",
    "Your phone is a tool, not a life.",
    "Sometimes the best way to connect is to disconnect.",
    "Time spent on your phone is time you can never get back.",
  ];

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const updateQuote = () => {
    const lastQuoteDate = localStorage.getItem("lastQuoteDate");
    const currentDate = new Date().toLocaleDateString();

    if (lastQuoteDate !== currentDate) {
      const randomQuote = getRandomQuote();
      localStorage.setItem("quote", randomQuote);
      localStorage.setItem("lastQuoteDate", currentDate);
      setQuote(randomQuote);
    } else {
      setQuote(localStorage.getItem("quote"));
    }
  };

  const calculateRating = (hours) => {
    const h = Number(hours);
    if (h < 0) return 0;
    if (h <= 3) return 10;
    if (h === 4) return 9;
    if (h === 5 || h === 6) return 8;
    if (h === 7 || h === 8) return 7;
    if (h === 9) return 6;
    if (h === 10) return 4;
    if (h >= 12 && h<=14) return 3;
    if (h > 15) return 2;
    return 2;
  };

  useEffect(() => {
    updateQuote();
    setRating(calculateRating(phoneUseHours));
  }, [phoneUseHours]);

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "phone";

    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
    }
    localStorage.setItem("completedTasks", JSON.stringify(completed));

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const firestoreData = snapshot.exists() ? snapshot.data() : {};

      const updatedTasks = {
        ...(firestoreData.completedTasks || {}),
        [today]: [...new Set([...(firestoreData.completedTasks?.[today] || []), taskName])]
      };

      await setDoc(userRef, {
        completedTasks: updatedTasks
      }, { merge: true });
    }

    navigate("/home");
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setPhoneUseHours(""); // allow empty temporarily
    } else {
      const clamped = Math.max(0, Math.min(24, Number(raw)));
      setPhoneUseHours(clamped.toString());
    }
  };

  return (
    <div className="task-page-container">
      <div style={{ padding: 20 }}>
        <h2>{t[language].title}</h2>

        <label>{t[language].phoneUse}:</label>
        <input
          type="number"
          value={phoneUseHours}
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
          color: rating >= 9 ? "#4caf50" : rating >= 6 ? "#f5c84c" : "#ff5e57",
          fontWeight: "bold"
        }}>
          {rating >= 9
            ? "Great job! 📱✨"
            : rating >= 6
              ? "Not bad, try to unplug more 💡"
              : "Too much screen time today 😓"}
        </p>

        <br />

        <p style={{ fontSize: "12px", color: "#f5c84c", textAlign: "center", fontWeight: "bold" }}>{quote}</p>

        <br />

        <button onClick={handleSubmit}>{t[language].submit}</button>
        <button onClick={() => navigate("/home")}>{t[language].back}</button>
      </div>

      <NavBar />
    </div>
  );
}
