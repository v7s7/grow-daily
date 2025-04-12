import React from "react";
import "./FancyRating.css";

export default function FancyRating({ value, onChange, label = "Rate" }) {
  const messages = [
    "Just getting started",
    "Warming up",
    "Nice effort!",
    "Great job!",
    "You're crushing it!",
  ];

  return (
    <div className="fancy-rating">
      <h4>{label}</h4>
      <div className="rating-container-wrapper">
        <div className="rating-container">
          {[5, 4, 3, 2, 1].map((num) => (
            <React.Fragment key={num}>
              <input
                type="radio"
                name="rating"
                id={`star${num}`}
                checked={value === num}
                onChange={() => onChange(num)}
              />
              <label htmlFor={`star${num}`} />
            </React.Fragment>
          ))}
        </div>
        <div className="rating-numbers">
          <span>1</span>
          <span>5</span>
        </div>
      </div>

      {value > 0 && (
        <>
          <div className="rating-score">{value} out of 5</div>
          <div className="rating-text">{messages[value - 1]}</div>
        </>
      )}
    </div>
  );
}
