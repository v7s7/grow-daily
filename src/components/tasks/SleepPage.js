import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating"; 
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function SleepPage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en"; // Fetch language from localStorage

  const [sleepHours, setSleepHours] = useState(0); // Hours of sleep
  const [rating, setRating] = useState(0); // Rating for sleep quality
  const [quote, setQuote] = useState(""); // Random quote

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

  // List of random quotes
  const quotes = [
    "Sleep is the best meditation.",
    "A good laugh and a long sleep are the best cures in the doctor’s book.",
    "The more you sleep, the better you perform.",
    "Sleep is the golden chain that ties health and our bodies together.",
    "Let her sleep, for when she wakes, she will move mountains.",
    "Sleep is the most important part of any fitness routine.",
    "The time to sleep is when you are tired.",
    "Good sleep is a powerful tool for maintaining health.",
    "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ", // Quranic verse
  ];

  // Function to get a random quote for today
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  // Check if the quote needs to be updated (daily)
  const updateQuote = () => {
    const lastQuoteDate = localStorage.getItem("lastQuoteDate");
    const currentDate = new Date().toLocaleDateString();

    if (lastQuoteDate !== currentDate) {
      // Generate and store a new quote for the day
      const randomQuote = getRandomQuote();
      localStorage.setItem("quote", randomQuote);
      localStorage.setItem("lastQuoteDate", currentDate);
      setQuote(randomQuote);
    } else {
      // Use the stored quote for today
      setQuote(localStorage.getItem("quote"));
    }
  };

  // Calculate sleep quality rating based on sleep hours
  const calculateRating = (hours) => {
    if (hours >= 7 && hours <= 9) {
      return 10; // Perfect sleep range
    } else if (hours < 7) {
      return Math.max(0, 10 - (7 - hours)); // Less than 7 hours reduces the rating
    } else if (hours > 9) {
      return Math.max(0, 10 - (hours - 9)); // More than 9 hours reduces the rating
    }
    return 0; // Default fallback for invalid hours
  };

  useEffect(() => {
    updateQuote(); // Update quote on page load
    setRating(calculateRating(sleepHours)); // Calculate the rating based on sleep hours
  }, [sleepHours]); // Recalculate rating whenever sleep hours change

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "sleep"; // 🔁 Change this to "study", "water", "sleep", etc.
  
    // Local update
    const completed = JSON.parse(localStorage.getItem("completedTasks") || "{}");
    completed[today] = completed[today] || [];
    if (!completed[today].includes(taskName)) {
      completed[today].push(taskName);
    }
    localStorage.setItem("completedTasks", JSON.stringify(completed));
  
    // Firestore update
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
  

  return (
    <div className="task-page-container">

    <div style={{ padding: 20 }}>
      <h2>{t[language].title}</h2>

      <label>{t[language].sleepHours}:</label>
      <input
        type="number"
        value={sleepHours}
        onChange={(e) => setSleepHours(e.target.value)}
        min="0"
        max="24" // Limit to 24 hours max
      />

      <br />

      <h4>{t[language].rating}:</h4>
      <p>{rating} / 10</p> {/* Auto-filled rating based on sleep hours */}

      <br />

      <p>{quote}</p> {/* Display random motivational quote */}

      <br />

      <button onClick={handleSubmit}>{t[language].submit}</button>
      <button onClick={() => navigate("/home")}>{t[language].back}</button>
      </div>
      <NavBar />

      </div>

  );
}
