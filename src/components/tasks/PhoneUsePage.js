import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import FancyRating from "../FancyRating"; 
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function PhoneUsePage() {
  const navigate = useNavigate();
  const language = localStorage.getItem("lang") || "en"; // Fetch language from localStorage

  const [phoneUseHours, setPhoneUseHours] = useState(0); // Phone use in hours
  const [rating, setRating] = useState(0); // Rating for phone use

  const [quote, setQuote] = useState(""); // Random quote

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

  // List of random quotes
  const quotes = [
    "Don't let your phone control you. Control your phone.",
    "The best things in life aren't things.",
    "Disconnect to reconnect.",
    "Your phone is a tool, not a life.",
    "Sometimes the best way to connect is to disconnect.",
    "Time spent on your phone is time you can never get back.",
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

  // Calculate rating based on phone use hours
  const calculateRating = (hours) => {
    if (hours <= 3) {
      return 10; // Less than or equal to 3 hours = perfect rating
    } else if (hours <= 5) {
      return 7; // 4-5 hours = 7/10
    } else if (hours <= 7) {
      return 5; // 6-7 hours = 5/10
    } else {
      return 3; // More than 7 hours = 3/10
    }
  };

  useEffect(() => {
    updateQuote(); // Update quote on page load
    setRating(calculateRating(phoneUseHours)); // Calculate rating based on phone hours
  }, [phoneUseHours]); // Recalculate rating whenever phone use hours change

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskName = "phone"; // 🔁 Change this to "study", "water", "sleep", etc.
  
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

      <label>{t[language].phoneUse}:</label>
      <input
        type="number"
        value={phoneUseHours}
        onChange={(e) => setPhoneUseHours(e.target.value)}
        min="0"
        max="24" // Limit to 24 hours max
      />

      <br />

      <h4>{t[language].rating}:</h4>
      <p>{rating} / 10</p> {/* Auto-filled rating based on phone use hours */}

      <br />

      <p>{quote}</p> {/* Display random motivational quote */}

      <br />
      <FancyRating value={rating} onChange={(val) => setRating(val)} label={t[language].rating} />

      <button onClick={handleSubmit}>{t[language].submit}</button>
      <button onClick={() => navigate("/home")}>{t[language].back}</button>
    </div>      <NavBar />
    
    </div>

  );
}
